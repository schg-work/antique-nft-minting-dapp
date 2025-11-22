import { useEffect, useState } from "react";
import { CONTRACT_CONFIG, type AllowedNetwork } from "./config";
import type { Abi } from "viem";
import MyLinks from "./components/MyLinks";
import MediaViewer from "./components/MediaViewer";
import MintCard from "./components/MintCard";

function App() {
  // 🔹 ИЗМЕНЕНИЕ: Дефолтная сеть теперь Optimism
  const [selectedNetwork, setSelectedNetwork] =
    useState<AllowedNetwork>("Optimism");

  const [contractAddress, setContractAddress] = useState<`0x${string}` | null>(
    null,
  );
  const [abi, setAbi] = useState<Abi | null>(null);
  const [requiredChainIdHex, setRequiredChainIdHex] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Логика остается прежней, так как CONTRACT_CONFIG уже обновлен в config.ts
    const config = CONTRACT_CONFIG[selectedNetwork];
    if (config) {
      setContractAddress(config.address as `0x${string}`);
      setAbi(config.abi);
      setRequiredChainIdHex(config.chainId);
    } else {
      setContractAddress(null);
      setAbi(null);
      setRequiredChainIdHex(null);
    }
  }, [selectedNetwork]);

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl sm:text-3xl font-bold mb-4">
          🪙 From mint to wallet in one safe step — secured with ERC721A
          technology
        </h1>
        {/* 🔹 ИЗМЕНЕНИЕ: Обновлен текст описания */}
        <p className="text-lg max-w-xl mx-auto opacity-80">
          NFT minting interface integrated with MetaMask on Optimism and
          Arbitrum
        </p>
      </div>

      <div className="w-full mb-8">
        <MediaViewer />
      </div>

      <div className="p-6 mb-8">
        <MyLinks />
      </div>

      <div className="w-full flex justify-center">
        <MintCard
          contractAddress={contractAddress}
          abi={abi}
          currentNetwork={null} /* MintCard сам определит MetaMask сеть */
          requiredChainIdHex={requiredChainIdHex}
          selectedNetwork={selectedNetwork}
          onNetworkChange={setSelectedNetwork}
        />
      </div>

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
