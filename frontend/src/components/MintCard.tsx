import { useState } from "react";
import { UploadStep } from "./UploadStep";
import { MintStep } from "./MintStep";
import { SuccessModal } from "./SuccessModal";
import { buildWalrusImageUrl, type WalrusSponsorUploadResult } from "../walrus";

interface MintCardProps {
  onMintSuccess: () => void;
}

type Step = "upload" | "mint" | "success";

interface MintData {
  uploadResult: WalrusSponsorUploadResult;
  file: File;
  nftName: string;
  nftDescription: string;
}

interface SuccessData {
  digest: string;
  objectId?: string;
  nftName: string;
  imageUrl: string;
}

export function MintCard({ onMintSuccess }: MintCardProps) {
  const [step, setStep] = useState<Step>("upload");
  const [mintData, setMintData] = useState<MintData | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  const handleUploadComplete = (
    result: WalrusSponsorUploadResult,
    file: File,
    name: string,
    description: string
  ) => {
    setMintData({ uploadResult: result, file, nftName: name, nftDescription: description });
    setStep("mint");
  };

  const handleMintSuccess = (digest: string, objectId?: string) => {
    if (mintData) {
      setSuccessData({
        digest,
        objectId,
        nftName: mintData.nftName,
        imageUrl: buildWalrusImageUrl(mintData.uploadResult.blob_id),
      });
    }
    setStep("success");
    onMintSuccess();
  };

  const handleReset = () => {
    setStep("upload");
    setMintData(null);
    setSuccessData(null);
  };

  return (
    <section className="mint-section" id="mint-card">
      {step === "upload" && (
        <UploadStep onUploadComplete={handleUploadComplete} />
      )}

      {step === "mint" && mintData && (
        <MintStep
          uploadResult={mintData.uploadResult}
          nftName={mintData.nftName}
          nftDescription={mintData.nftDescription}
          onMintSuccess={handleMintSuccess}
          onBack={() => setStep("upload")}
        />
      )}

      {step === "success" && successData && (
        <SuccessModal
          digest={successData.digest}
          objectId={successData.objectId}
          nftName={successData.nftName}
          imageUrl={successData.imageUrl}
          onClose={handleReset}
        />
      )}
    </section>
  );
}
