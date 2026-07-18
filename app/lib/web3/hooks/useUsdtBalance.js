"use client";

import { useReadContract } from "wagmi";
import { erc20Abi } from "@/lib/web3/erc20Abi";
import { STAKE_TOKEN_ADDRESS } from "@/lib/web3/constants";

/** Live USDT balance (base units) for the connected wallet. */
export function useUsdtBalance(address) {
  return useReadContract({
    address: STAKE_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 15_000,
    },
  });
}
