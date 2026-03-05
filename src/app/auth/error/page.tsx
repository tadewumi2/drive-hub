import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthErrorPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Authentication Error
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-slate-600">
          Something went wrong during authentication. Please try signing in
          again.
        </p>
      </CardContent>
      <CardFooter className="justify-center gap-3">
        <Link href="/auth/sign-in">
          <button className="bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-slate-800 transition-colors">
            Sign In
          </button>
        </Link>
        <Link href="/">
          <button className="border border-slate-300 text-slate-700 text-sm font-medium px-6 py-2.5 rounded-full hover:bg-slate-50 transition-colors">
            Go Home
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
}
