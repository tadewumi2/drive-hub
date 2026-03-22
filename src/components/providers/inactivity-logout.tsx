"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

export default function InactivityLogout() {
  const { status } = useSession();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    function resetTimer() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        signOut({ callbackUrl: "/auth/sign-in" });
      }, INACTIVITY_LIMIT);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [status]);

  return null;
}
