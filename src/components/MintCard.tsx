import React, { useState } from "react";
import type { Abi } from "viem";
import { encodeFunctionData, parseEther, getAddress } from "viem";

interface AddEthereumChainParameter {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/* Polygon */
const POLYGON_PARAMS: AddEthereumChainParameter = {
  chainId: "0x89",
  chainName: "Polygon Mainnet",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://polygon-rpc.com/"],
  blockExplorerUrls: ["https://polygonscan.com/"],
};

/* Arbitrum */
const ARBITRUM_PARAMS: AddEthereumChainParameter = {
  chainId: "0xa4b1",
  chainName: "Arbitrum One",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://arb1.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://arbiscan.io/"],
};

type AllowedNetwork = "Polygon" | "Arbitrum";

const NETWORK_PARAMS: Record<AllowedNetwork, AddEthereumChainParameter> = {
  Polygon: POLYGON_PARAMS,
  Arbitrum: ARBITRUM_PARAMS,
};

async function switchOrAddNetwork(
  params: AddEthereumChainParameter,
): Promise<void> {
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: params.chainId }],
    });
    return;
  } catch (switchError: unknown) {
    const err = switchError as { code?: number; message?: string };
    if (err?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [params],
        });
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: params.chainId }],
        });
        return;
      } catch (addError: unknown) {
        const addErr = addError as { message?: string };
        throw new Error(
          addErr?.message || "Failed to add the network to the wallet",
        );
      }
    }
    throw new Error(err?.message || "Failed to switch network");
  }
}

async function switchToNetwork(network: AllowedNetwork): Promise<void> {
  await switchOrAddNetwork(NETWORK_PARAMS[network]);
}

function getNetworkName(chainId: string | null): string {
  if (!chainId) return "Unknown";
  switch (chainId.toLowerCase()) {
    case "0x89":
      return "Polygon";
    case "0xa4b1":
      return "Arbitrum One";
    case "0x1":
      return "Ethereum Mainnet";
    default:
      return `Another network (${chainId})`;
  }
}

function isCurrentNetwork(
  chainId: string | null,
  targetNetwork: AllowedNetwork,
): boolean {
  if (!chainId) return false;
  const targetChainId = NETWORK_PARAMS[targetNetwork].chainId.toLowerCase();
  return chainId.toLowerCase() === targetChainId;
}

interface MintCardProps {
  contractAddress: `0x${string}`;
  abi: Abi;
  currentNetwork: string | null;
  requiredChainIdHex: string;
}

const MintCard: React.FC<MintCardProps> = ({
  contractAddress,
  abi,
  currentNetwork,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [switching, setSwitching] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<AllowedNetwork | null>(
    null,
  );

  const pricePerItem = 0.05;
  const totalCost = (quantity * pricePerItem).toFixed(4);
  const dappHost = window.location.host;
  // localhost
  const protocol = dappHost.includes("localhost") ? "http" : "https";
  const deepLink = `https://metamask.app.link/dapp/${protocol}://${dappHost}`;
  // UX
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  const isAllowedNetwork = (chainId: string | null): boolean =>
    !!chainId &&
    (chainId.toLowerCase() === POLYGON_PARAMS.chainId ||
      chainId.toLowerCase() === ARBITRUM_PARAMS.chainId);

  const handleSwitch = async (network: AllowedNetwork): Promise<void> => {
    setSelectedNetwork(network);
    setSwitching(true);
    setError(null);
    // Deep Link
    if (isMobile && !window.ethereum) {
      window.location.href = deepLink;
      return;
    }

    try {
      await switchToNetwork(network);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to switch";
      setError(errorMessage);
    } finally {
      setSwitching(false);
      setSelectedNetwork(null);
    }
  };

  const connectWallet = async (): Promise<void> => {
    // Deep Link.
    if (isMobile && typeof window.ethereum === "undefined") {
      window.location.href = deepLink;
      return;
    }

    // If MetaMask is not installed in your browser (desktop or app)
    if (!window.ethereum) {
      setError("MetaMask is not installed or unavailable");
      return;
    }

    try {
      setError(null);
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (accounts.length === 0) throw new Error("No accounts found");
      const userAddress = getAddress(accounts[0]);
      setAccount(userAddress);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Wallet connection error";
      setError(errorMessage);
    }
  };

  const increment = (): void => setQuantity((prev) => Math.min(prev + 1, 20));
  const decrement = (): void => setQuantity((prev) => Math.max(prev - 1, 1));

  const handleMint = async (): Promise<void> => {
    // Adding a Deep Link for Mint if the provider is not detected on mobile
    if (isMobile && typeof window.ethereum === "undefined") {
      window.location.href = deepLink;
      return;
    }
    if (!window.ethereum) {
      setError("MetaMask is not installed or unavailable");
      return;
    }
    if (!account) {
      setError("First, connect the wallet");
      return;
    }
    if (!isAllowedNetwork(currentNetwork)) {
      setError("Minting is only available on Polygon or Arbitrum One");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const data = encodeFunctionData({
        abi,
        functionName: "purchase",
        args: [BigInt(quantity)],
      });
      const valueInWei = parseEther(totalCost);

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
      })) as `0x${string}`;

      setTxHash(tx);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Minting failed";
      if (errorMessage.includes("User denied"))
        setError("Transaction declined by the user");
      else if (errorMessage.includes("insufficient funds"))
        setError("Insufficient funds for the transaction");
      else setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-linear-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 text-white">
      <h2 className="cosmic-text text-2xl sm:text-3xl font-bold text-center mb-6">
        NFT minting
      </h2>

      {!account ? (
        <div className="text-center">
          <p className="mb-4 text-gray-300">
            Connect your browser wallet (MetaMask) and select the desired
            network
          </p>
          <button
            onClick={connectWallet}
            className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg font-semibold glow hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            {/* Dynamic text for mobile devices */}
            {isMobile && typeof window.ethereum === "undefined"
              ? "Open in MetaMask App"
              : "Connect Wallet"}
          </button>
          {/*  "Open in MetaMask App"  */}
        </div>
      ) : (
        <>
          {/* Account Info */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">Connected:</p>
            <p className="text-sm font-mono truncate">{account}</p>
          </div>

          {/* NETWORK SELECTION */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-3">Select Network:</p>
            <div className="flex gap-2">
              {/* Polygon */}
              <button
                onClick={() => handleSwitch("Polygon")}
                disabled={
                  switching || isCurrentNetwork(currentNetwork, "Polygon")
                }
                className={`flex-1 py-3 px-3 rounded text-sm font-semibold transition-all ${
                  isCurrentNetwork(currentNetwork, "Polygon")
                    ? "bg-green-600 cursor-default"
                    : "bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                } disabled:opacity-50`}
              >
                {switching && selectedNetwork === "Polygon"
                  ? "Switching..."
                  : isCurrentNetwork(currentNetwork, "Polygon")
                    ? "✅ Polygon"
                    : "Polygon"}
              </button>

              {/* Arbitrum */}
              <button
                onClick={() => handleSwitch("Arbitrum")}
                disabled={
                  switching || isCurrentNetwork(currentNetwork, "Arbitrum")
                }
                className={`flex-1 py-3 px-3 rounded text-sm font-semibold transition-all ${
                  isCurrentNetwork(currentNetwork, "Arbitrum")
                    ? "bg-green-600 cursor-default"
                    : "bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                } disabled:opacity-50`}
              >
                {switching && selectedNetwork === "Arbitrum"
                  ? "Switching..."
                  : isCurrentNetwork(currentNetwork, "Arbitrum")
                    ? "✅ Arbitrum"
                    : "Arbitrum"}
              </button>
            </div>
          </div>

          {/* Current Network Status */}
          <div className="mb-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">Current Network:</p>
            <p
              className={`text-sm font-semibold ${
                isAllowedNetwork(currentNetwork)
                  ? "text-green-400"
                  : "text-yellow-400"
              }`}
            >
              {getNetworkName(currentNetwork)}
              {!isAllowedNetwork(currentNetwork) && " (Not supported)"}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Quantity</span>
              <span className="text-sm text-gray-400">Max: 20</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
              <button
                onClick={decrement}
                disabled={quantity <= 1}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-bold mx-4 min-w-10 text-center">
                {quantity}
              </span>
              <button
                onClick={increment}
                disabled={quantity >= 20}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Cost */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-300">Total Cost:</span>
              <span className="font-bold text-purple-400">{totalCost} ETH</span>
            </div>
          </div>

          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={loading || !isAllowedNetwork(currentNetwork)}
            className="w-full py-4 bg-linear-to-r from-green-800 to-emerald-500 rounded-xl font-semibold text-lg glow disabled:opacity-50 hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Minting...
              </span>
            ) : (
              "Mint Now"
            )}
          </button>

          {/* Transaction Hash */}
          {txHash && (
            <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <p className="text-green-400 text-sm font-semibold mb-1">
                ✅ Transaction Sent!
              </p>
              <p className="text-xs font-mono truncate text-green-300">
                {txHash}
              </p>
              <a
                href={`https://polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-xs underline mt-1 inline-block"
              >
                View on Explorer
              </a>
            </div>
          )}
        </>
      )}

      {/* Errors */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
};

export default MintCard;
