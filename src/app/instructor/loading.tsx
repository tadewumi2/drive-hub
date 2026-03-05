export default function InstructorLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-5 h-28"
          />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 h-64" />
    </div>
  );
}
