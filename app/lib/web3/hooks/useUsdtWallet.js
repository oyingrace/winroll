"use client";

import { useCallback } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { erc20Abi } from "@/lib/web3/erc20Abi";
import { winRollAbi } from "@/lib/web3/winRollAbi";
import { STAKE_TOKEN_ADDRESS, WINROLL_CONTRACT_ADDRESS } from "@/lib/web3/constants";

/**
 * Approve + placeBet flow for staking USDT into WinRollGame. MiniPay signs
 * with legacy transactions, paying gas in a stablecoin, so no relayer step
 * is needed here (unlike a USDT-only wallet with zero CELO — see cbet's
 * gas-relayer notes if that becomes relevant for winroll too).
 */
export function useUsdtWallet() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const placeBet = useCallback(
    async ({ roundId, betType, numbers, amountRaw }) => {
      if (!address) throw new Error("Wallet not connected");
      if (!WINROLL_CONTRACT_ADDRESS) throw new Error("WinRollGame contract not configured");

      const approveHash = await writeContractAsync({
        address: STAKE_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [WINROLL_CONTRACT_ADDRESS, amountRaw],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      const betHash = await writeContractAsync({
        address: WINROLL_CONTRACT_ADDRESS,
        abi: winRollAbi,
        functionName: "placeBet",
        args: [roundId, betType, numbers, amountRaw],
      });
      await publicClient.waitForTransactionReceipt({ hash: betHash });

      return betHash;
    },
    [address, writeContractAsync, publicClient]
  );

  return { placeBet };
}
