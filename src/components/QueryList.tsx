import { useState } from 'react';
import { useQueryStore } from '../store/useQueryStore';
import { toast } from 'react-toastify';

export default function QueryList() {
  const queries = useQueryStore(s => s.queries);
  const activeId = useQueryStore(s => s.activeId);
  const createQuery = useQueryStore(s => s.createQuery);
  const setActive = useQueryStore(s => s.setActive);
  const runQuery = useQueryStore(s => s.runQuery);
  const deleteQuery = useQueryStore(s => s.deleteQuery);

  const [filter, setFilter] = useState('');

  const filtered = queries.filter(q =>
    q.text.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex gap-2">
        <button
          className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-3 py-2 rounded-md cursor-pointer"
          onClick={() => createQuery()}
        >
          New Query
        </button>
        <button
          className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-3 py-2 rounded-md cursor-pointer"
          onClick={() => {
            createQuery('SELECT 1');
            toast.info('New sample query created');
          }}
        >
          Sample
        </button>
      </div>

      <div className="mt-2">
        <input
          placeholder="Search queries..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full px-2 py-2 rounded-md border border-white/5 bg-transparent text-inherit"
        />
      </div>

      <div className="flex flex-col gap-2 mt-3">
        {filtered.map(q => (
          <div
            key={q.id}
            className={`flex justify-between items-center px-2 py-1 rounded-md cursor-pointer ${
              q.id === activeId
                ? 'bg-blue-500/10 border-l-4 border-blue-400 pl-1'
                : 'bg-white/5'
            }`}
          >
            <div className="flex-1 min-w-0" onClick={() => setActive(q.id)}>
              <div className="text-sm break-words whitespace-normal min-w-0 w-full">{q.text}</div>
              <div className="text-[11px] text-[#9aa4b2]">
                {q.status} • {new Date(q.createdAt).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <button
                className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-2 py-1 rounded-md cursor-pointer text-sm"
                onClick={() => runQuery(q.id)}
              >
                Run
              </button>
              <button
                className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-2 py-1 rounded-md cursor-pointer text-sm"
                onClick={() => {
                  deleteQuery(q.id);
                  toast.info('Deleted');
                }}
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}