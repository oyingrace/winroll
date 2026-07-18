"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/context/AppContext";
import { walletFetch } from "@/lib/web3/apiClient";

/** The connected wallet's recent bet history. */
export function useBetHistory() {
  const { address, isConnected } = useApp();
  const [bets, setBets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      try {
        const res = await walletFetch(address, "/api/user/bets?limit=20");
        const data = await res.json();
        if (!cancelled && data?.success) setBets(data.data);
      } catch (err) {
        console.error("Failed to load bet history:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  return { bets: isConnected ? bets : [], isLoading };
}
