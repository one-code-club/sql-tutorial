import { create } from 'zustand';

export type SavedQuery = {
  id: string;
  name: string;
  text: string;
};

type AppState = {
  nickname: string;
  selectedDB: string | null;
  columns: string[];
  queries: SavedQuery[];
  setNickname: (name: string) => void;
  setSelectedDB: (db: string | null) => void;
  setColumns: (cols: string[]) => void;
  setQueries: (queries: SavedQuery[]) => void;
  resetAll: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  nickname: '',
  selectedDB: null,
  columns: [],
  queries: [],
  setNickname: (name) => set({ nickname: name }),
  setSelectedDB: (db) => set({ selectedDB: db }),
  setColumns: (cols) => set({ columns: cols }),
  setQueries: (queries) => set({ queries }),
  resetAll: () => set({ nickname: '', selectedDB: null, columns: [], queries: [] }),
}));


