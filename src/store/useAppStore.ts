import { create } from 'zustand';

export type SavedQuery = {
  id: string;
  name: string;
  text: string;
};

export type Language = 'en' | 'ja';

type AppState = {
  nickname: string;
  selectedDB: string | null;
  columns: string[];
  queries: SavedQuery[];
  language: Language;
  setNickname: (name: string) => void;
  setSelectedDB: (db: string | null) => void;
  setColumns: (cols: string[]) => void;
  setQueries: (queries: SavedQuery[]) => void;
  setLanguage: (lang: Language) => void;
  resetAll: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  nickname: '',
  selectedDB: null,
  columns: [],
  queries: [],
  language: 'en', // デフォルトは英語
  setNickname: (name) => set({ nickname: name }),
  setSelectedDB: (db) => set({ selectedDB: db }),
  setColumns: (cols) => set({ columns: cols }),
  setQueries: (queries) => set({ queries }),
  setLanguage: (lang) => set({ language: lang }),
  resetAll: () => set({ nickname: '', selectedDB: null, columns: [], queries: [] }),
}));


