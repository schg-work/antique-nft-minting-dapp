import { useState, useEffect } from "react";
import MintCard from "./components/MintCard";
import contractAbi from "./abi/contractAbi.json";
import type { Abi } from "viem";
import MyLinks from "./components/MyLinks";
// MediaViewer (components)
import MediaViewer from "./components/MediaViewer";

function App() {
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);

  useEffect(() => {
    const getNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = (await window.ethereum.request({
            method: "eth_chainId",
          })) as string;
          setCurrentNetwork(chainId);
        } catch (error) {
          console.error("Failed to get Chain ID:", error);
        }
      }
    };
    getNetwork();

    // Network change tracking (no change)
    if (window.ethereum && window.ethereum.on) {
      const handler = (chainId: string) => setCurrentNetwork(chainId);
      window.ethereum.on("chainChanged", handler);
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener("chainChanged", handler);
        }
      };
    }
  }, []);

  // Contract configuration
  const contractAddress: `0x${string}` =
    "0xa3295ca72C1525689373f4aD08AFa18C3543D35d";
  const abi = contractAbi as Abi;
  const requiredChainIdHex = "0x89";

  return (
    // Main container with centering
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      {/* Headline */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          🪙 Minting house
        </h1>
        <p className="text-lg max-w-xl mx-auto opacity-80">
          NFT minting interface integrated with MetaMask on Polygon and Arbitrum
        </p>
      </div>

      {/* MediaViewer */}
      <div className="w-full mb-8">
        <MediaViewer />
      </div>

      <div className="p-6 mb-8">
        <div>
          <MyLinks />
        </div>
      </div>

      {/* MintCard */}
      <div className="w-full flex justify-center">
        <MintCard
          contractAddress={contractAddress}
          abi={abi}
          currentNetwork={currentNetwork}
          requiredChainIdHex={requiredChainIdHex}
        />
      </div>
      {/* Footer */}
      <div className="w-full mt-12">
        <footer className="text-center text-sm text-slate-400 py-4 border-t border-slate-700">
          © 2025 <a className="text-purple-400">SCHG NFT</a>
          <div className="mt-2 space-x-4">
            <a
              href="mailto:SCHG_work@proton.me"
              className="text-purple-400 hover:text-purple-300"
            >
              📩 Email (SCHG_work@proton.me)
            </a>
            <a
              href="https://x.com/SchgWork"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              🐦 X (Twitter)
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
