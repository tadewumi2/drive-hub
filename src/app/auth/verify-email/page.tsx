"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const redirectTo = searchParams.get("redirect") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);

    // Focus the last filled input or the next empty one
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleVerify() {
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess(data.message);
      const destination = redirectTo
        ? `/auth/sign-in?callbackUrl=${encodeURIComponent(redirectTo)}`
        : "/auth/sign-in";
      setTimeout(() => router.push(destination), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;

    setResendStatus("sending");
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setResendStatus("error");
        setResendMessage(data.error);
        return;
      }

      if (res.ok) {
        setResendStatus("sent");
        setResendMessage(data.message);
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setResendStatus("error");
        setResendMessage(data.error);
      }
    } catch {
      setResendStatus("error");
      setResendMessage("Failed to resend. Please try again.");
    }
  }

  // Success state
  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Email verified!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-slate-600">{success}</p>
          <p className="text-sm text-slate-400 mt-2">
            Redirecting to sign in...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-slate-700">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 text-center">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div
          className="flex justify-center gap-2 sm:gap-3 mb-6"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 6}
          className="w-full"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </Button>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 mb-2">
            Didn&apos;t receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={resendStatus === "sending" || countdown > 0}
            className="text-sm font-medium text-slate-900 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendStatus === "sending"
              ? "Sending..."
              : countdown > 0
                ? `Resend code in ${countdown}s`
                : "Resend code"}
          </button>
          {resendMessage && (
            <p
              className={`text-xs mt-2 ${
                resendStatus === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {resendMessage}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/auth/sign-in">
          <Button variant="ghost" className="text-slate-500">
            Back to sign in
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-slate-600">Loading...</p>
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
