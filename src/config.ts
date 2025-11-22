import type { Abi } from "viem";
// НЕ ЗАБУДЬТЕ: Переименуйте ваш JSON файл или измените путь, если он называется иначе
import contractAbiOptimism from "./abi/contractAbiOptimism.json";
import contractAbiArbitrum from "./abi/contractAbiArbitrum.json";

// Тип для наших сетей
export type AllowedNetwork = "Optimism" | "Arbitrum";

// Параметры для ДОБАВЛЕНИЯ сетей в MetaMask
// Это нужно для функции switchOrAddNetwork в MintCard
export const NETWORK_PARAMS = {
  Optimism: {
    chainId: "0xa", // 10 в десятичной
    chainName: "OP Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io/"],
  },
  Arbitrum: {
    chainId: "0xa4b1", // 42161 в десятичной
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io/"],
  },
};

// Параметры НАШИХ КОНТРАКТОВ для минта
// (Это нужно для App.tsx)
export const CONTRACT_CONFIG: Record<
  AllowedNetwork,
  {
    chainId: string;
    address: `0x${string}`;
    abi: Abi;
  }
> = {
  Optimism: {
    chainId: NETWORK_PARAMS.Optimism.chainId, // "0xa"
    // Адрес Optimism
    address: "0x24b8b90c6050dD066e595027831A863D0906c5A7",
    abi: contractAbiOptimism as Abi,
  },
  Arbitrum: {
    chainId: NETWORK_PARAMS.Arbitrum.chainId, // "0xa4b1"
    address: "0x24b8b90c6050dD066e595027831A863D0906c5A7", // Адрес Arbitrum
    abi: contractAbiArbitrum as Abi, // ABI для Arbitrum
  },
};
