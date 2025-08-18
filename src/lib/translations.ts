export type Language = 'en' | 'ja';

export const translations = {
  en: {
    // Header
    appTitle: 'CS in English: SQL Builder',
    logout: 'Logout',
    
    // Home page
    homeTitle: 'SQL Tutorial',
    homeSubtitle: 'SQL learning app for elementary and middle school students',
    getStarted: 'Get Started',
    
    // Editor page
    editorTypeLabel: 'Choose either "Block Editor" or "Text Editor"',
    blockEditor: 'Block Editor',
    textEditor: 'Text Editor',
    run: 'Run',
    save: 'Save',
    
    // Left pane
    selectDB: 'Select DB',
    selectPlaceholder: 'Please select',
    dragToEditor: 'Drag to insert into editor',
    sqlKeywords: 'SQL Keywords',
    columns: 'Columns',
    savedQueries: 'Saved Queries',
    clickToLoad: 'Click to load into editor',
    delete: 'Delete',
    
    // Result grid
    error: 'Error',
    executing: 'Executing...',
    noResults: 'Results will be displayed here',
    
    // Query save modal
    saveQuery: 'Save Query',
    queryName: 'Query name',
    cancel: 'Cancel',
    
    // Error messages
    sqlExecutionError: 'SQL execution failed. Please check the content.',
    
    // Blockly Editor
    blocklyEditorLabel: 'SQL Block Editor',
    queryDisplayLabel: 'Generated Query',
  },
  ja: {
    // Header
    appTitle: 'CS in English: SQL Builder',
    logout: 'ログアウト',
    
    // Home page
    homeTitle: 'SQL Tutorial',
    homeSubtitle: '小中学生向けの SQL 学習アプリ',
    getStarted: 'はじめる',
    
    // Editor page
    editorTypeLabel: '「ブロックエディタ」か「テキストエディタ」のどちらかを選んでください',
    blockEditor: 'ブロックエディタ',
    textEditor: 'テキストエディタ',
    run: '実行',
    save: '保存',
    
    // Left pane
    selectDB: 'DBを選択',
    selectPlaceholder: '選択してください',
    dragToEditor: 'ドラッグしてエディタに挿入',
    sqlKeywords: 'SQLキーワード',
    columns: 'カラム',
    savedQueries: '保存済みクエリ',
    clickToLoad: 'クリックでエディタに読み込み',
    delete: '削除',
    
    // Result grid
    error: 'エラー',
    executing: '実行中…',
    noResults: '結果がここに表示されます',
    
    // Query save modal
    saveQuery: 'クエリを保存',
    queryName: 'クエリ名',
    cancel: 'キャンセル',
    
    // Error messages
    sqlExecutionError: 'SQLの実行に失敗しました。内容を確認してください。',
    
    // Blockly Editor
    blocklyEditorLabel: 'SQLブロックエディタ',
    queryDisplayLabel: '実行するクエリ文',
  },
} as const;

export function useTranslation(language: Language) {
  return translations[language];
}
