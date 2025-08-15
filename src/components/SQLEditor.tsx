"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function SQLEditor({ value, onChange }: Props) {
  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    const { selectionStart, selectionEnd } = e.currentTarget;
    const appended = text.endsWith(' ') ? text : `${text} `; // 末尾に半角スペースを1つ付与
    const newValue = value.slice(0, selectionStart) + appended + value.slice(selectionEnd);
    onChange(newValue.replace(/ {2,}/g, ' ')); // 2つ以上のスペースを1つに正規化
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-200">SQLエディタ</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/ {2,}/g, ' '))}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        rows={12}
        className="w-full rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        spellCheck={false}
      />
    </div>
  );
}


