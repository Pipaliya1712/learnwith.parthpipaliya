"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { challengesApi } from "@/lib/api-client";
import { Loader2, CheckCircle, Clock, CheckCircle2, XCircle, Activity, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { SubmitModal } from "./submit-modal";

interface ClaimButtonProps {
  challengeId: string;
  initialStatus: string | null;
}

export function ClaimButton({ challengeId, initialStatus }: ClaimButtonProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [status, setStatus] = useState<string | null>(initialStatus);

  const handleClaim = async () => {
    try {
      setIsClaiming(true);
      await challengesApi.claim(challengeId);
      setStatus("in_progress");
      toast.success("Challenge claimed successfully! Good luck!");
    } catch (error: any) {
      toast.error(error.message || "Failed to claim challenge. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSubmissionSuccess = () => {
    setStatus("submitted");
  };

  // If the user has claimed it but not yet submitted the PR
  if (status === "in_progress") {
    return (
      <SubmitModal challengeId={challengeId} onSuccess={handleSubmissionSuccess}>
        <Button className="w-full font-semibold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700" size="lg">
          <UploadCloud className="mr-2 h-5 w-5" />
          Submit Solution
        </Button>
      </SubmitModal>
    );
  }

  if (status === "submitted") {
    return (
      <Link href="/my-challenges" className="w-full block">
        <Button className="w-full font-semibold bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" size="lg">
          <Clock className="mr-2 h-5 w-5" />
          Under Review
        </Button>
      </Link>
    );
  }

  if (status === "approved") {
    return (
      <Button className="w-full font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20" size="lg" disabled>
        <CheckCircle2 className="mr-2 h-5 w-5" />
        Approved
      </Button>
    );
  }

  if (status === "rejected") {
    return (
      <SubmitModal challengeId={challengeId} onSuccess={handleSubmissionSuccess}>
        <Button className="w-full font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20" size="lg">
          <XCircle className="mr-2 h-5 w-5" />
          Changes Requested (Resubmit)
        </Button>
      </SubmitModal>
    );
  }

  // Default state: not claimed yet
  return (
    <Button 
      className="w-full font-semibold" 
      size="lg" 
      onClick={handleClaim}
      disabled={isClaiming}
    >
      {isClaiming ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Claiming...
        </>
      ) : (
        "Start Challenge"
      )}
    </Button>
  );
}
