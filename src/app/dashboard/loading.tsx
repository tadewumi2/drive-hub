export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-64" />
      <div className="h-4 bg-slate-100 rounded w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-5 h-32"
          />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 h-48" />
    </div>
  );
}
