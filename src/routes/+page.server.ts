import path from "node:path";
import { promises as fs } from "node:fs";
import type { ServerLoad } from "@sveltejs/kit";

const RESULTS_DIR = path.join(process.cwd(), "static", "results");

type MetricValue = number | null;
type MetricRecord = Record<string, MetricValue>;

interface TaskRow {
    task: string;
    metrics: MetricRecord;
}

interface ParsedMetrics {
    metricKeys: string[];
    rows: TaskRow[];
}

const parseNumber = (value: string | undefined): number | null => {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const parseMetricsCsv = (csvRaw: string): ParsedMetrics => {
    const lines = csvRaw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) {
        return { metricKeys: [], rows: [] };
    }

    const headerLine = lines[0];
    const headers = headerLine.split(",").map((header) => header.trim());
    const taskIndex = headers.indexOf("Task");

    const metricKeys = headers.filter((header) => header && header !== "Task");

    const rows: TaskRow[] = [];

    for (let i = 1; i < lines.length; i += 1) {
        const row = lines[i];
        if (!row) continue;

        const columns = row.split(",");
        const taskName = columns[taskIndex]?.trim() || `task_${i}`;

        const metrics = metricKeys.reduce<MetricRecord>((acc, key) => {
            const columnIndex = headers.indexOf(key);
            acc[key] = parseNumber(columns[columnIndex]);
            return acc;
        }, {});

        rows.push({ task: taskName, metrics });
    }

    return { metricKeys, rows };
};

export const load: ServerLoad = async () => {
    const dirEntries = await fs.readdir(RESULTS_DIR, { withFileTypes: true });

    const taskMap = new Map<string, { model: string; metrics: MetricRecord }[]>();
    const metricKeySet = new Set<string>();

    await Promise.all(
        dirEntries
            .filter((entry) => entry.isDirectory())
            .map(async (entry) => {
                const metricsPath = path.join(RESULTS_DIR, entry.name, "metrics.csv");
                try {
                    const csvRaw = await fs.readFile(metricsPath, "utf-8");
                    const parsed = parseMetricsCsv(csvRaw);

                    parsed.metricKeys.forEach((key) => metricKeySet.add(key));

                    parsed.rows.forEach((row) => {
                        if (!taskMap.has(row.task)) {
                            taskMap.set(row.task, []);
                        }
                        taskMap.get(row.task)?.push({
                            model: entry.name,
                            metrics: row.metrics,
                        });
                    });
                } catch (error) {
                    console.error(`Failed to read metrics for ${entry.name}:`, error);
                }
            }),
    );

    const tasks = Array.from(taskMap.entries()).map(([task, entries]) => ({
        task,
        entries: entries.sort((a, b) => a.model.localeCompare(b.model)),
    }));

    return {
        tasks: tasks.sort((a, b) => a.task.localeCompare(b.task)),
        metricKeys: Array.from(metricKeySet),
    };
};

