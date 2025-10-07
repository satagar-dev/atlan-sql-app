import { useQueryStore } from '../store/useQueryStore';
import DataTable from './DataTable';

export default function QueryResult() {
  const activeId = useQueryStore(s => s.activeId);
  const queries = useQueryStore(s => s.queries);
  const rerun = useQueryStore(s => s.rerunQuery);

  const query = queries.find(q => q.id === activeId);

  if (!query) {
    return (
      <div className="bg-[#07132a] rounded-lg p-3 h-full flex flex-col">
        Select or create a query to see results
      </div>
    );
  }

  const handleDownload = () => {
    if (!query.result) return;
    const cols = query.result.columns;
    const rows = query.result.rows;
    const csvRows = [cols.join(',')].concat(
      rows.map(r =>
        cols.map(c => `"${String(r[c] ?? '')}"`).join(',')
      )
    );
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-${query.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#07132a] rounded-lg p-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="text-base font-semibold">Result</h4>
          <div className="text-xs text-[#9aa4b2]">{query.text}</div>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-3 py-2 rounded-md cursor-pointer"
            onClick={() => rerun(query.id)}
          >
            Rerun
          </button>
          <button
            className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-3 py-2 rounded-md cursor-pointer"
            onClick={handleDownload}
          >
            Download CSV
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {query.status === 'running' && (
          <div className="p-3">Running…</div>
        )}
        {query.status === 'error' && (
          <div className="p-3 text-red-400">Error: {query.error}</div>
        )}
        {query.status === 'done' && query.result && (
          <DataTable result={query.result} />
        )}
        {query.status === 'idle' && (
          <div className="p-3">Run the query to see results</div>
        )}
      </div>
    </div>
  );
}