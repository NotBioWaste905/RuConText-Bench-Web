<script lang="ts">
    import { Table } from "@flowbite-svelte-plugins/datatable";

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

    // Transform entries to DataTable items format
    $: tableItems = currentTask
        ? currentTask.entries.map((entry) => {
              const item: Record<string, string | number> = {
                  Model: entry.model,
              };
              metricKeys.forEach((key) => {
                  const value = entry.metrics[key];
                  // Format numbers to 3 decimal places, use "—" for null values
                  // Store as formatted string - simple-datatables can sort numeric strings correctly
                  item[key] = formatMetric(value);
              });
              return item;
          })
        : [];

    // DataTable options with sorting enabled
    const dataTableOptions = {
        sortable: true,
        searchable: true,
        perPage: 25,
        perPageSelect: [10, 25, 50, 100],
    };
</script>

<div class="container"><h1>RusConText Benchmark</h1>
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
            {#key activeTask}
                <Table items={tableItems} {dataTableOptions} divClass="relative overflow-x-auto">
                </Table>
            {/key}
        {/if}
    </section></div>


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
        width: 100%;
        overflow-x: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
    .empty-state {
        margin: 2rem auto;
        text-align: center;
        color: #555;
    }
    
    /* Table styling improvements */
    :global(table.dataTable) {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    :global(table.dataTable thead) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    :global(table.dataTable thead th) {
        position: relative;
        cursor: pointer;
        user-select: none;
        padding: 1rem 1.25rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        white-space: nowrap;
        min-width: 120px;
    }
    
    :global(table.dataTable thead th:first-child) {
        text-transform: capitalize;
        min-width: 180px;
        padding-left: 1.5rem;
    }
    
    :global(table.dataTable thead th:not(:first-child)) {
        text-align: right;
        padding-right: 1.5rem;
    }
    
    :global(table.dataTable thead th.sorting:before),
    :global(table.dataTable thead th.sorting:after) {
        content: "";
        position: absolute;
        right: 0.5rem;
        font-size: 0.8rem;
        opacity: 0.5;
    }
    
    :global(table.dataTable thead th.sorting_asc:before) {
        opacity: 1;
    }
    
    :global(table.dataTable thead th.sorting_desc:after) {
        opacity: 1;
    }
    
    :global(table.dataTable tbody) {
        background: white;
    }
    
    :global(table.dataTable tbody tr) {
        border-bottom: 1px solid #e5e7eb;
        transition: background-color 0.15s ease;
    }
    
    :global(table.dataTable tbody tr:last-child) {
        border-bottom: none;
    }
    
    :global(table.dataTable tbody tr:hover) {
        background-color: #f9fafb;
    }
    
    :global(table.dataTable tbody tr:nth-child(even)) {
        background-color: #fafafa;
    }
    
    :global(table.dataTable tbody tr:nth-child(even):hover) {
        background-color: #f3f4f6;
    }
    
    :global(table.dataTable tbody td) {
        padding: 1rem 1.25rem;
        text-align: right;
        font-size: 0.9375rem;
        color: #374151;
        border-right: 1px solid #e5e7eb;
        white-space: nowrap;
    }
    
    :global(table.dataTable tbody td:last-child) {
        border-right: none;
    }
    
    :global(table.dataTable tbody td:first-child) {
        text-align: left;
        font-weight: 600;
        text-transform: capitalize;
        color: #111827;
        padding-left: 1.5rem;
        background-color: #f9fafb;
        border-right: 2px solid #e5e7eb;
    }
    
    
    /* Column width adjustments */
    :global(table.dataTable thead th),
    :global(table.dataTable tbody td) {
        width: auto;
    }
    
    :global(table.dataTable thead th:first-child),
    :global(table.dataTable tbody td:first-child) {
        position: sticky;
        left: 0;
        z-index: 10;
    }
    .container {
    /* display: flex; */
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    max-width: 1100px;
    padding-left: 2rem;
    padding-right: 2rem;
    box-sizing: border-box;
    }
</style>
