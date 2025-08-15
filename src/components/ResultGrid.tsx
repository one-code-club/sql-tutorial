type Props = {
  rows: any[];
  loading?: boolean;
  error?: string | null;
};

export function ResultGrid({ rows, loading, error }: Props) {
  if (error) return (
    <div className="rounded-md border border-red-700/50 bg-red-900/30 p-3 text-red-200">
      ⚠ エラー: {error}
    </div>
  );
  if (loading) return <div className="rounded-md border border-slate-700 bg-slate-800 p-3 text-slate-200">実行中…</div>;
  if (!rows?.length) return <div className="rounded-md border border-slate-700 bg-slate-800 p-3 text-slate-300">結果がここに表示されます</div>;

  const columns = Object.keys(rows[0] ?? {});
  return (
    <div className="overflow-auto rounded-md border border-slate-700">
      <table className="min-w-full text-sm text-slate-100">
        <thead className="bg-slate-800">
          <tr>
            {columns.map((c) => (
              <th key={c} className="border-b border-slate-700 px-3 py-2 text-left font-medium text-slate-200">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="even:bg-slate-800/60">
              {columns.map((c) => (
                <td key={c} className="border-b border-slate-700 px-3 py-2 align-top">{String(r[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


