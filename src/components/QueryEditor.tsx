import { useEffect, useState } from 'react';
import { useQueryStore } from '../store/useQueryStore';
import { toast } from 'react-toastify';

export default function QueryEditor() {
  const activeId = useQueryStore(s => s.activeId);
  const queries = useQueryStore(s => s.queries);
  const updateText = useQueryStore(s => s.updateQueryText);
  const runQuery = useQueryStore(s => s.runQuery);
  const createQuery = useQueryStore(s => s.createQuery);

  const activeQuery = queries.find(q => q.id === activeId);
  const [text, setText] = useState(activeQuery?.text ?? '');

  useEffect(() => {
    setText(activeQuery?.text ?? '');
  }, [activeQuery?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (activeQuery) handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [text, activeQuery]);

  const handleRun = async () => {
    if (!activeQuery) {
      const newQ = createQuery(text);
      setTimeout(() => runQuery(newQ.id), 50);
      return;
    }
    updateText(activeQuery.id, text);
    toast.info('Running query...');
    await runQuery(activeQuery.id);
    toast.success('Query finished');
  };

  return (
    <div className="bg-[#07132a] rounded-lg p-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-base font-semibold">Editor</h4>
        <div className="text-xs text-[#9aa4b2]">Ctrl/Cmd + Enter to run</div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write any SQL-like text here..."
        className="w-full h-full bg-transparent text-[#e6eef8] font-mono border border-white/5 p-3 rounded-md resize-none"
      />

      <div className="flex gap-2 mt-2">
        <button
          className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-3 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRun}
          disabled={!text.trim()}
        >
          Run
        </button>
        <button
          className="bg-[#0b2a4a] text-[#e6eef8] border border-white/5 px-3 py-2 rounded-md cursor-pointer"
          onClick={() => setText('SELECT * FROM customers')}
        >
          Load Example
        </button>
      </div>
    </div>
  );
}