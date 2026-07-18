"use client";

import { useEffect, useState } from "react";

/** Polls the current betting round and ticks a local clock for the countdown. */
export function useRound() {
  const [round, setRound] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/rounds/current");
        const data = await res.json();
        if (!cancelled && data?.success) setRound(data.data);
      } catch (err) {
        console.error("Failed to load current round:", err);
      }
    }

    load();
    const interval = setInterval(load, 5_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(tick);
  }, []);

  return { round, now };
}
