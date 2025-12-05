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
            <Table items={tableItems} {dataTableOptions} divClass="relative overflow-x-auto shadow-md sm:rounded-lg">
            </Table>
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
    .empty-state {
        margin: 2rem auto;
        text-align: center;
        color: #555;
    }
    
    :global(table.dataTable thead th) {
        position: relative;
        cursor: pointer;
        user-select: none;
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
    
    :global(table.dataTable tbody tr:hover) {
        background-color: #f3f4f6;
    }
    
    :global(table.dataTable thead th:first-child) {
        text-transform: capitalize;
        font-weight: 600;
    }
    
    /* Format numeric cells - ensure proper alignment and formatting */
    :global(table.dataTable tbody td) {
        text-align: right;
    }
    
    :global(table.dataTable tbody td:first-child) {
        text-align: left;
        font-weight: 600;
        text-transform: capitalize;
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
