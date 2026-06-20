// dapp-kit.ts — Modern Sui dApp Kit configuration
import { createDAppKit } from "@mysten/dapp-kit-react";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";

const NODE_URLS: Record<string, string> = {
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
};

const defaultNetwork =
  (import.meta.env.VITE_SUI_NETWORK as "testnet" | "mainnet") || "testnet";

export const dAppKit = createDAppKit({
  networks: ["testnet", "mainnet"] as const,
  defaultNetwork,
  createClient: (network) =>
    new SuiJsonRpcClient({
      url: NODE_URLS[network] || NODE_URLS.testnet,
      network,
    }),
});

// Register types for hook type inference
declare module "@mysten/dapp-kit-react" {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}
