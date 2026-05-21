// useMintNFT.ts — Programmable Transaction Block for minting
import { useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useState } from "react";
import { CONTRACT_CONFIG, COLLECTION_META } from "../config";
import {
  uploadToWalrusSponsored,
  type WalrusSponsorUploadResult,
} from "../walrus";

export interface MintParams {
  imageFile: File;
  nftName: string;
  nftDescription: string;
  walrusApiKey: string;
  creatorAddress: string;
}

export interface MintResult {
  txDigest: string;
  nftObjectId?: string;
  walrusUpload: WalrusSponsorUploadResult;
}

export function useMintNFT() {
  const dAppKit = useDAppKit();
  const [isUploading, setIsUploading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] =
    useState<WalrusSponsorUploadResult | null>(null);

  const mint = useCallback(
    async (params: MintParams): Promise<MintResult> => {
      setError(null);

      // ── Step 1: Upload image to Walrus via Krilly Sponsor SDK ────────────
      setIsUploading(true);
      let walrusResult: WalrusSponsorUploadResult;
      try {
        walrusResult = await uploadToWalrusSponsored(params.imageFile, {
          apiKey: params.walrusApiKey,
          creatorAddress: params.creatorAddress,
          epochs: COLLECTION_META.walrusStorageEpochs,
        });
        setUploadResult(walrusResult);
        console.log("Walrus upload success:", walrusResult);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Walrus upload failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsUploading(false);
      }

      // ── Step 2: Build the PTB and mint on Sui ────────────────────────────
      setIsMinting(true);
      try {
        const tx = new Transaction();

        // Split the exact mint price from the gas coin
        const [mintPayment] = tx.splitCoins(tx.gas, [
          tx.pure.u64(COLLECTION_META.mintPriceMist),
        ]);

        // Call move function: mint_nft(config, payment, name, description, blob_id, sponsored_blob_id)
        tx.moveCall({
          target: `${CONTRACT_CONFIG.packageId}::${CONTRACT_CONFIG.module}::${CONTRACT_CONFIG.mintFunction}`,
          arguments: [
            tx.object(CONTRACT_CONFIG.collectionConfigId), // &mut CollectionConfig
            mintPayment, // Coin<SUI>
            tx.pure.vector(
              "u8",
              Array.from(new TextEncoder().encode(params.nftName))
            ),
            tx.pure.vector(
              "u8",
              Array.from(new TextEncoder().encode(params.nftDescription))
            ),
            tx.pure.vector(
              "u8",
              Array.from(new TextEncoder().encode(walrusResult.blob_id))
            ),
            tx.pure.vector(
              "u8",
              Array.from(
                new TextEncoder().encode(walrusResult.sponsored_blob_id)
              )
            ),
          ],
        });

        const result = await dAppKit.signAndExecuteTransaction({
          transaction: tx,
        });

        // Handle transaction result — check for failure
        if ("FailedTransaction" in result && result.FailedTransaction) {
          throw new Error(
            `Transaction failed: ${result.FailedTransaction.status?.error?.message || "Unknown error"}`
          );
        }

        // Extract digest from successful transaction
        const txResult = "Transaction" in result ? result.Transaction : null;
        const digest = txResult?.digest || "unknown";

        // Extract minted NFT object ID from effects
        const createdObjects = txResult?.effects?.created || [];
        const nftObject = createdObjects.find(
          (obj: Record<string, unknown>) =>
            obj.owner &&
            typeof obj.owner === "object" &&
            "AddressOwner" in (obj.owner as Record<string, unknown>)
        );

        return {
          txDigest: digest,
          nftObjectId: (nftObject as Record<string, unknown>)?.objectId as
            | string
            | undefined,
          walrusUpload: walrusResult,
        };
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Minting failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setIsMinting(false);
      }
    },
    [dAppKit]
  );

  return {
    mint,
    isUploading,
    isMinting,
    isLoading: isUploading || isMinting,
    error,
    uploadResult,
    step: isUploading
      ? ("uploading" as const)
      : isMinting
        ? ("minting" as const)
        : ("idle" as const),
  };
}
