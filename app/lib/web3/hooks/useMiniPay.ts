"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

export interface UseMiniPayResult {
  /** True when the app is running inside the MiniPay dapp browser. */
  isMiniPay: boolean;
  /** True once the MiniPay host has been detected (client-side only). */
  isReady: boolean;
  /** The connected wallet address, if any. */
  address?: `0x${string}`;
  /** True while a wallet is connected. */
  isConnected: boolean;
  /** True while a connection attempt is in flight. */
  isConnecting: boolean;
  /** Manually connect an injected wallet (used outside MiniPay). */
  connectWallet: () => void;
}

function noopSubscribe() {
  return () => {};
}

function getMiniPaySnapshot() {
  return Boolean(window.ethereum?.isMiniPay);
}

function getMiniPayServerSnapshot() {
  return false;
}

function getReadySnapshot() {
  return true;
}

function getReadyServerSnapshot() {
  return false;
}

/**
 * Detects the MiniPay host and manages the wallet connection.
 *
 * `window.ethereum` is external state the server can't see, so `isMiniPay`
 * and `isReady` are read via `useSyncExternalStore` (server snapshot always
 * `false`, real value re-read on the client after hydration) instead of an
 * effect + setState — avoids the "derived state in an effect" anti-pattern
 * entirely rather than working around it.
 *
 * - **Inside MiniPay** (`window.ethereum.isMiniPay === true`): auto-connects the
 *   injected wallet, so the UI never shows a connect button — the connection is
 *   implicit.
 * - **Outside MiniPay** (normal browser): does not auto-connect. `connectWallet`
 *   lets the UI offer a "Connect Wallet" button for an injected wallet, so the
 *   app is still usable/testable outside MiniPay.
 */
export function useMiniPay(): UseMiniPayResult {
  const isMiniPay = useSyncExternalStore(noopSubscribe, getMiniPaySnapshot, getMiniPayServerSnapshot);
  const isReady = useSyncExternalStore(noopSubscribe, getReadySnapshot, getReadyServerSnapshot);
  const { connect, isPending } = useConnect();
  const { address, isConnected } = useAccount();

  const connectWallet = useCallback(() => {
    connect({ connector: injected() });
  }, [connect]);

  useEffect(() => {
    if (isMiniPay && !isConnected) {
      connect({ connector: injected() });
    }
  }, [isMiniPay, isConnected, connect]);

  return {
    isMiniPay,
    isReady,
    address,
    isConnected,
    isConnecting: isPending,
    connectWallet,
  };
}
