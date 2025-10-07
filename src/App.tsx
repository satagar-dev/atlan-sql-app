import React, { useEffect } from 'react';
import { useQueryStore } from './store/useQueryStore';
import QueryEditor from './components/QueryEditor';
import QueryList from './components/QueryList';
import QueryResult from './components/QueryResult';

function App() {
  const loadSample = useQueryStore(s => s.loadSample);

  useEffect(() => {
    loadSample();
  }, [loadSample]);

  return (
    <div className="flex h-screen gap-3 bg-[#071029] text-[#e6eef8] font-sans">
      <aside className="w-[280px] bg-[#061024] p-4 border-r border-white/5 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Queries</h3>
        <QueryList />
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="px-4 py-3 border-b border-white/5 flex items-center gap-4">
          <h2 className="text-xl font-bold">SQL Playground (Mock)</h2>
        </header>

        <section className="flex flex-col gap-3 h-full min-h-0">
          <div className="flex-[0.4] min-h-[120px] flex flex-col bg-[#08132C] rounded-md p-3 overflow-auto">
            <QueryEditor />
          </div>
          <div className="flex-[0.6] min-h-[180px] flex flex-col bg-[#07132a] rounded-md p-3 overflow-auto">
            <QueryResult />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
