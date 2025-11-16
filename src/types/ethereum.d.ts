export {};

declare global {
  // В вашем глобальном файле .d.ts

  interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;

    // Уточняем, что chainChanged передает string
    on: (event: "chainChanged", handler: (chainId: string) => void) => void;
    // Уточняем, что accountsChanged передает string[]
    on: (
      event: "accountsChanged",
      handler: (accounts: string[]) => void,
    ) => void;
    // ... и оставляем общее определение для других событий
    on: (event: string, handler: (...args: unknown[]) => void) => void;

    // То же самое для removeListener
    removeListener: (
      event: "chainChanged",
      handler: (chainId: string) => void,
    ) => void;
    removeListener: (
      event: string,
      handler: (...args: unknown[]) => void,
    ) => void;
  }

  interface Window {
    ethereum?: EthereumProvider;
  }
}
