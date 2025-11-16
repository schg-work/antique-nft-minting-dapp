// src/components/MyLinks.tsx
function MyLinks() {
  return (
    <div className="flex flex-col space-y-8">
      <a
        href="https://sepolia.etherscan.io/address/0xa3295ca72c1525689373f4ad08afa18c3543d35d#code"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl mx-auto opacity-80 text-white hover:text-blue-500 underline"
      >
        View on Etherscan: Contract
      </a>

      <a
        href="https://polygonscan.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl mx-auto opacity-80 text-white hover:text-blue-500 underline"
      >
        Link 2: Polygonscan
      </a>

      <a
        href="https://arbiscan.io"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xl mx-auto opacity-80 text-white hover:text-blue-500 underline"
      >
        Link 3: Arbiscan
      </a>
    </div>
  );
}

export default MyLinks;
