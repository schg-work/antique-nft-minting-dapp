import React, { useEffect, useState, useCallback } from "react";
import type { Abi } from "viem";
import { encodeFunctionData, parseEther, getAddress } from "viem";
import { NETWORK_PARAMS, type AllowedNetwork } from "../config";

interface EthereumChainParams {
  chainId: string;
  chainName?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
}

async function switchOrAddNetwork(params: EthereumChainParams): Promise<void> {
  if (!window.ethereum) throw new Error("Ethereum provider not found");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: params.chainId }] as unknown[],
    });
  } catch (switchError: unknown) {
    const error = switchError as { code?: number; message?: string };
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [params] as unknown[],
        });
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: params.chainId }] as unknown[],
        });
      } catch (addError: unknown) {
        const err = addError as { message?: string };
        throw new Error(err?.message || "Failed to add network");
      }
    } else {
      throw new Error(error?.message || "Failed to switch network");
    }
  }
}

type MintCardProps = {
  contractAddress: `0x${string}` | null;
  abi: Abi | null;
  currentNetwork: string | null;
  requiredChainIdHex: string | null;
  selectedNetwork: AllowedNetwork;
  onNetworkChange: (net: AllowedNetwork) => void;
};

// 👇 ИСПРАВЛЕНИЕ: Явно указываем тип возвращаемого значения React.JSX.Element
export default function MintCard({
  contractAddress,
  abi,
  currentNetwork: _currentNetworkProp,
  requiredChainIdHex,
  selectedNetwork,
  onNetworkChange,
}: MintCardProps): React.JSX.Element {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(
    _currentNetworkProp ?? null,
  );

  const pricePerItem = 0.05;
  const rawTotalCost = quantity * pricePerItem;
  const totalCostDisplay = rawTotalCost.toFixed(2);
  const valueInWei = parseEther(rawTotalCost.toFixed(18));

  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  const dappHost = window.location.host;
  const protocol = dappHost.includes("localhost") ? "http" : "https";
  const deepLink = `https://metamask.app.link/dapp/${protocol}://${dappHost}`;

  const getNetworkName = (chainId: string | null): AllowedNetwork | null => {
    if (chainId === NETWORK_PARAMS.Optimism.chainId) return "Optimism";
    if (chainId === NETWORK_PARAMS.Arbitrum.chainId) return "Arbitrum";
    return null;
  };

  const isCorrectNetwork =
    currentNetwork?.toLowerCase() === requiredChainIdHex?.toLowerCase();

  const increment = () => setQuantity((p) => Math.min(p + 1, 20));
  const decrement = () => setQuantity((p) => Math.max(p - 1, 1));

  const connectWallet = useCallback(async () => {
    if (isMobile && !window.ethereum) {
      window.location.href = deepLink;
      return;
    }
    if (!window.ethereum) {
      setError("MetaMask is not installed");
      return;
    }
    try {
      setError(null);
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length > 0) {
        setAccount(getAddress(accounts[0]));
        const chainId = (await window.ethereum.request({
          method: "eth_chainId",
        })) as string;
        setCurrentNetwork(chainId);
      }
    } catch (err: unknown) {
      const connectError = err as { message?: string };
      setError(connectError.message || "Failed to connect");
    }
  }, [isMobile, deepLink]);

  const handleSwitchNetwork = async () => {
    if (!requiredChainIdHex) return;
    setIsSwitching(true);
    setError(null);
    try {
      if (requiredChainIdHex === NETWORK_PARAMS.Optimism.chainId) {
        await switchOrAddNetwork(NETWORK_PARAMS.Optimism);
      } else if (requiredChainIdHex === NETWORK_PARAMS.Arbitrum.chainId) {
        await switchOrAddNetwork(NETWORK_PARAMS.Arbitrum);
      }
      window.location.reload();
    } catch (err: unknown) {
      const switchError = err as { code?: number; message?: string };
      setError(switchError.message || "Failed to switch network");
    } finally {
      if (error) setIsSwitching(false);
    }
  };

  const handleMint = async () => {
    if (!window.ethereum || !account || !contractAddress || !abi) {
      setError("System not ready. Check connection.");
      return;
    }
    if (!isCorrectNetwork) {
      setError("Wrong network detected.");
      return;
    }

    setIsMinting(true);
    setError(null);
    setTxHash(null);

    try {
      const data = encodeFunctionData({
        abi,
        functionName: "purchase",
        args: [BigInt(quantity)],
      });

      const tx = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: account,
            to: contractAddress,
            data,
            value: `0x${valueInWei.toString(16)}`,
          },
        ],
      })) as string;

      setTxHash(tx);
    } catch (err: unknown) {
      const mintError = err as { message?: string };
      console.error(mintError);
      if (mintError.message?.includes("User denied")) {
        setError("Transaction denied by user");
      } else {
        setError("Mint failed. Check console for details.");
      }
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;
    const provider = window.ethereum;

    const handleChainChanged = (chainId: string) => {
      setCurrentNetwork(chainId);
    };
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? getAddress(accounts[0]) : null);
    };

    (async () => {
      try {
        const chainId = (await provider.request({
          method: "eth_chainId",
        })) as string;
        setCurrentNetwork(chainId);
      } catch {
        // ignore
      }
    })();

    provider.on("chainChanged", handleChainChanged);
    provider.on("accountsChanged", handleAccountsChanged);

    return () => {
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  let mainButton: React.ReactNode;
  if (!account) {
    mainButton = (
      <button
        onClick={connectWallet}
        disabled={isMinting || isSwitching}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-colors disabled:bg-gray-500"
      >
        🔗 Connect Wallet
      </button>
    );
  } else if (!isCorrectNetwork) {
    mainButton = (
      <button
        onClick={handleSwitchNetwork}
        disabled={isMinting || isSwitching}
        className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors disabled:bg-gray-500 flex items-center justify-center space-x-2"
      >
        {isSwitching ? (
          <>
            <div className="spinner"></div>
            <span>Switching...</span>
          </>
        ) : (
          <>🚨 Switch to {getNetworkName(requiredChainIdHex)}</>
        )}
      </button>
    );
  } else {
    mainButton = (
      <button
        onClick={handleMint}
        disabled={isMinting || !contractAddress || !abi || isSwitching}
        className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors disabled:bg-gray-500 flex items-center justify-center space-x-2"
      >
        {isMinting ? (
          <>
            <div className="spinner"></div>
            <span>Minting...</span>
          </>
        ) : (
          `Mint ${quantity} NFT${quantity > 1 ? "s" : ""}`
        )}
      </button>
    );
  }

  // 👇 ГЛАВНОЕ ИСПРАВЛЕНИЕ: Убедитесь, что этот return существует и возвращает JSX
  return (
    <div className="max-w-md w-full mx-auto bg-linear-to-br from-purple-900/80 to-pink-900/80 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 text-white relative overflow-hidden">
      <div className="mb-4 text-center text-sm">
        Network:
        <span
          className={`font-semibold ml-1 ${isCorrectNetwork ? "text-green-400" : "text-red-400"}`}
        >
          {getNetworkName(currentNetwork) ?? "Unknown"}
        </span>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => onNetworkChange("Optimism")}
          className={`py-2 px-4 rounded-xl font-semibold ${
            selectedNetwork === "Optimism" ? "bg-purple-500" : "bg-gray-600/50"
          } hover:bg-purple-700 transition-colors`}
        >
          Optimism
        </button>
        <button
          onClick={() => onNetworkChange("Arbitrum")}
          className={`py-2 px-4 rounded-xl font-semibold ${
            selectedNetwork === "Arbitrum" ? "bg-purple-500" : "bg-gray-600/50"
          } hover:bg-purple-700 transition-colors`}
        >
          Arbitrum
        </button>
      </div>

      <div className="mb-6 text-center text-sm bg-white/10 p-2 rounded-lg truncate">
        {account ? (
          <>
            Wallet:{" "}
            <span className="font-mono text-purple-300">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </>
        ) : (
          "Wallet: Disconnected"
        )}
      </div>

      <div className="flex justify-between items-center bg-white/10 p-4 rounded-lg mb-6">
        <span className="text-lg font-semibold">Quantity (Max 20)</span>
        <div className="flex items-center space-x-3">
          <button
            onClick={decrement}
            disabled={quantity <= 1 || isMinting || isSwitching}
            className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 transition-colors text-xl"
          >
            −
          </button>
          <span className="text-xl font-bold w-6 text-center">{quantity}</span>
          <button
            onClick={increment}
            disabled={quantity >= 20 || isMinting || isSwitching}
            className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 transition-colors text-xl"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 border-t border-white/20 pt-4">
        <span className="text-xl font-bold">Total Cost (ETH)</span>
        <span className="text-xl font-bold text-green-400">
          {totalCostDisplay}
        </span>
      </div>

      {mainButton}

      {error && (
        <div className="mt-4 p-3 bg-red-800/70 rounded-lg text-sm font-medium border border-red-500">
          ❌ Error: {error}
        </div>
      )}

      {txHash && (
        <div className="mt-4 p-3 bg-blue-800/70 rounded-lg text-sm font-medium wrap-break-words border border-blue-500">
          🎉 Success! TX Hash:
          <a
            href={`https://explorer/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 hover:text-blue-100 underline ml-1"
          >
            {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </a>
        </div>
      )}
    </div>
  );
}
