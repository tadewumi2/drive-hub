"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"checking" | "waiting" | "success" | "error">(token ? "checking" : "waiting");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) return;

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${token}&email=${email}`,
        );
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [token, email]);

  // Waiting state — user just signed up, no token in URL
  if (status === "waiting") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-slate-900">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Click the link in your email to verify your account. The link
            expires in 24 hours. Check your spam folder if you don&apos;t see
            it.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/auth/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Checking state — verifying token
  if (status === "checking") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Verifying your email...</CardTitle>
          <CardDescription>Please wait a moment.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Success or error state
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {status === "success" ? "Email verified!" : "Verification failed"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant={status === "success" ? "default" : "destructive"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Link href="/auth/sign-in" className="w-full">
          <Button className="w-full">
            {status === "success" ? "Sign In" : "Back to Sign In"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
