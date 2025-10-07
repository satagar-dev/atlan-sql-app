import {create} from 'zustand';
import { faker } from '@faker-js/faker';

export type QueryStatus = 'idle' | 'running' | 'done' | 'error';

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
}

export interface QueryItem {
  id: string;
  text: string;
  status: QueryStatus;
  result?: QueryResult;
  createdAt: number;
  updatedAt?: number;
  error?: string;
}

type State = {
  queries: QueryItem[];
  activeId?: string;
  createQuery: (text?: string) => QueryItem;
  updateQueryText: (id: string, text: string) => void;
  setActive: (id: string) => void;
  deleteQuery: (id: string) => void;
  runQuery: (id: string) => Promise<void>;
  rerunQuery: (id: string) => Promise<void>;
  loadSample: () => void;
};

const makeId = () => {
  return Date.now().toString() + '-' + Math.floor(Math.random() * 1000000).toString();
}

export const useQueryStore = create<State>((set, get) => {
  // helper: create mock dataset
  const generateMockResult = (queryText: string) => {
    const rows = Math.min(5000 + queryText.length * 100, 20000); // between 500 and 2000 rows
    const cols = ['id', 'name', 'email', 'country', 'amount', 'created_at'];
    const data: Record<string, any>[] = [];
    for (let i = 0; i < rows; i++) {
      data.push({
        id: i + 1,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        country: faker.location.country(),
        amount: (Math.random() * 10000).toFixed(2),
        created_at: faker.date.past().toISOString().slice(0, 10),
      });
    }
    return { columns: cols, rows: data };
  };

  const runningQueries: Record<string, boolean> = {};

  return {
    queries: [],
    activeId: undefined,

    createQuery: (text = 'SELECT * FROM users LIMIT 100') => {
      const q: QueryItem = {
        id: makeId(),
        text,
        status: 'idle',
        createdAt: Date.now(),
      };
      set(state => ({ queries: [q, ...state.queries], activeId: q.id }));
      return q;
    },

    updateQueryText: (id, text) => {
      set(state => ({
        queries: state.queries.map(q => (q.id === id ? { ...q, text, updatedAt: Date.now() } : q)),
      }));
    },

    setActive: (id) => set(() => ({ activeId: id })),

    deleteQuery: (id) => set(state => {
      const queries = state.queries.filter(q => q.id !== id);
      const activeId = state.activeId === id ? queries[0]?.id : state.activeId;
      return { queries, activeId };
    }),

    // runQuery: updates status, generates mock result after artificial delay
    runQuery: async (id) => {
      const state = get();
      const query = state.queries.find(q => q.id === id);
      if (!query) return;

      const queryKey = query.text.trim().toLowerCase();
      if (runningQueries[queryKey]) {
        // skip duplicate concurrent run
        return;
      }
      runningQueries[queryKey] = true;
      set(state => ({
        queries: state.queries.map(q => (q.id === id ? { ...q, status: 'running', updatedAt: Date.now() } : q)),
      }));

      try {
        // artificial delay
        const delay = 800 + Math.random() * 1400;
        await new Promise(res => setTimeout(res, delay));

        // generate mock result
        const result = generateMockResult(query.text);

        set(state => ({
          queries: state.queries.map(q => (q.id === id ? { ...q, status: 'done', result, updatedAt: Date.now() } : q)),
        }));
      } catch (err: any) {
        set(state => ({
          queries: state.queries.map(q => (q.id === id ? { ...q, status: 'error', error: String(err) } : q)),
        }));
      } finally {
        runningQueries[queryKey] = false;
      }
    },

    rerunQuery: async (id) => {
      // same as runQuery but forces new run even if previously done
      await get().runQuery(id);
    },

    loadSample: () => {
      // create two initial queries
      set(state => {
        const q1: QueryItem = { id: makeId(), text: 'SELECT * FROM users LIMIT 100', status: 'idle', createdAt: Date.now() };
        const q2: QueryItem = { id: makeId(), text: 'SELECT country, COUNT(*) FROM users GROUP BY country', status: 'idle', createdAt: Date.now() };
        return { queries: [q1, q2, ...state.queries], activeId: q1.id };
      });
    },
  };
});
