// app/providers/TimeZoneProvider.tsx
"use client";
import { useEffect } from "react";
import { setUserTimeZone } from "../lib/date";

export default function TimeZoneProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;  // e.g. "Asia/Shanghai" or "Europe/Bucharest" :contentReference[oaicite:0]{index=0}
    setUserTimeZone(tz);
  }, []);

  return <>{children}</>;
}