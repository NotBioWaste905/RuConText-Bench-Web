<script lang="ts">
    import {
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
    } from "flowbite-svelte";

    export let data:
        | {
              tasks: {
                  task: string;
                  entries: {
                      model: string;
                      metrics: Record<string, number | null>;
                  }[];
              }[];
              metricKeys: string[];
          }
        | undefined;

    const tasks = [...(data?.tasks ?? [])];
    const metricKeys = data?.metricKeys ?? [];

    let activeTask = tasks[0]?.task ?? null;

    $: if (tasks.length > 0 && !tasks.some((task) => task.task === activeTask)) {
        activeTask = tasks[0]?.task ?? null;
    }

    const selectTask = (taskName: string) => {
        activeTask = taskName;
    };

    $: currentTask = tasks.find((task) => task.task === activeTask);

    const formatMetric = (value: number | null | undefined) =>
        value === null || value === undefined ? "—" : value.toFixed(3);
</script>

<h1>RusConText Benchmark</h1>
<p class="annotation">
    A benchmark (for the <a href="https://aclanthology.org/2025.acl-srw.91/"
        >paper</a
    >) for evaluating short-context understanding in Russian, comprising four
    distinct yet interrelated tasks: coreference resolution, discourse
    understanding, idiom interpretation and ellipsis resolution. Each task
    targets a specific aspect of linguistic processing, challenging a large
    language model to recover omitted information, resolve referential
    dependencies, interpret idioms and discourse. The RusConText Benchmark is an
    additional resource beyond standard benchmarks, designed to assess model
    performance from a specific perspective.
</p>

<section class="table-wrapper">
    <div class="tabs" role="tablist">
        {#if tasks.length === 0}
            <span class="tab disabled">No tasks available</span>
        {:else}
            {#each tasks as task}
                <button
                    type="button"
                    class:active={task.task === activeTask}
                    class="tab"
                    on:click={() => selectTask(task.task)}
                >
                    {task.task}
                </button>
            {/each}
        {/if}
    </div>

    {#if !currentTask}
        <p class="empty-state">No metrics to display.</p>
    {:else}
        <Table hoverable shadow>
            <TableHead>
                <TableHeadCell>Model</TableHeadCell>
                {#each metricKeys as key}
                    <TableHeadCell>{key}</TableHeadCell>
                {/each}
            </TableHead>
            <TableBody>
                {#each currentTask.entries as entry}
                    <TableBodyRow>
                        <TableBodyCell class="model-name">{entry.model}</TableBodyCell>
                        {#each metricKeys as key}
                            <TableBodyCell>{formatMetric(entry.metrics[key])}</TableBodyCell>
                        {/each}
                    </TableBodyRow>
                {/each}
            </TableBody>
        </Table>
    {/if}
</section>

<style>
    h1 {
        font-size: 3rem;
        color: #333;
        text-align: center;
        margin-top: 5%;
    }
    .annotation {
        text-align: center;
        margin: 1rem;
    }
    a {
        color: #007bff;
    }
    .table-wrapper {
        margin: 2rem auto 4rem;
        max-width: 90vw;
        overflow-x: auto;
    }
    .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    .tab {
        border: 1px solid #ccc;
        border-radius: 999px;
        padding: 0.4rem 1rem;
        background: #f7f7f7;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .tab.active {
        background: #007bff;
        color: #fff;
        border-color: #007bff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }
    .tab.disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
    .model-name {
        font-weight: 600;
        text-transform: capitalize;
    }
    .empty-state {
        margin: 2rem auto;
        text-align: center;
        color: #555;
    }
</style>
