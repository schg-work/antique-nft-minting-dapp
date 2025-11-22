// src/components/MyLinks.tsx
function MyLinks() {
  return (
    <div className="flex flex-col space-y-8">
      <a
        href="https://optimistic.etherscan.io/address/0x24b8b90c6050dD066e595027831A863D0906c5A7"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl mx-auto opacity-80 text-white hover:text-blue-500 underline"
      >
        View on OP Mainnet: Optimism
      </a>
      <a
        href="https://arbiscan.io/address/0x24b8b90c6050dD066e595027831A863D0906c5A7"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl mx-auto opacity-80 text-white hover:text-blue-500 underline"
      >
        View on Arbiscan: Arbitrum
      </a>
    </div>
  );
}

export default MyLinks;
