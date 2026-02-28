import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              DriveHub
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Book your driving lessons with ease
            </p>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
