// useCollection.ts — Fetch collection state from on-chain CollectionConfig
import { useCurrentClient } from "@mysten/dapp-kit-react";
import { useCallback, useEffect, useState } from "react";
import { CONTRACT_CONFIG } from "../config";

export interface CollectionState {
  currentSupply: number;
  maxSupply: number;
  mintPrice: number;
  isActive: boolean;
  name: string;
  description: string;
  admin: string;
}

export function useCollection() {
  const client = useCurrentClient();
  const [collection, setCollection] = useState<CollectionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    if (
      !client ||
      CONTRACT_CONFIG.collectionConfigId === "0x0"
    ) {
      // No contract deployed yet — use default values for demo
      setCollection({
        currentSupply: 0,
        maxSupply: 31,
        mintPrice: 100_000,
        isActive: true,
        name: "PULSAR",
        description:
          "Pulsar cosmic art — rotating neutron stars stored on Walrus decentralized storage",
        admin: "0x0",
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await client.getObject({
        id: CONTRACT_CONFIG.collectionConfigId,
        options: { showContent: true },
      });

      if (
        response.data?.content &&
        response.data.content.dataType === "moveObject"
      ) {
        const fields = response.data.content.fields as Record<
          string,
          unknown
        >;
        setCollection({
          currentSupply: Number(fields.current_supply) || 0,
          maxSupply: Number(fields.max_supply) || 31,
          mintPrice: Number(fields.mint_price) || 100_000,
          isActive: Boolean(fields.is_active),
          name: String(fields.name || "PULSAR"),
          description: String(
            fields.description || ""
          ),
          admin: String(fields.admin || "0x0"),
        });
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch collection:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch collection"
      );
      // Fall back to defaults
      setCollection({
        currentSupply: 0,
        maxSupply: 31,
        mintPrice: 100_000,
        isActive: true,
        name: "PULSAR",
        description:
          "Pulsar cosmic art — rotating neutron stars stored on Walrus decentralized storage",
        admin: "0x0",
      });
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  return {
    collection,
    isLoading,
    error,
    refetch: fetchCollection,
  };
}
