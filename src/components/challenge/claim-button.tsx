"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { challengesApi } from "@/lib/api-client";
import { Clock, CheckCircle2, XCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { LWButtonLoader } from "@/components/ui/lw-loader";

interface ClaimButtonProps {
  challengeId: string;
  challengeSlug: string;
  initialStatus: string | null;
}

export function ClaimButton({ challengeId, challengeSlug, initialStatus }: ClaimButtonProps) {
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

  // If the user has claimed it, redirect them to the dedicated submission page
  if (status === "in_progress") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-mono font-bold uppercase tracking-wider">
          <span>Status</span>
          <span>Claimed</span>
        </div>
        <Link href={`/challenges/${challengeSlug}/submit`} className="w-full block">
          <Button className="w-full font-semibold" variant="gradient" size="lg">
            <UploadCloud className="mr-2 h-5 w-5" />
            Submit Solution
          </Button>
        </Link>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-mono font-bold uppercase tracking-wider">
          <span>Status</span>
          <span>Under Review</span>
        </div>
        <Link href="/my-journey" className="w-full block">
          <Button className="w-full font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" size="lg" variant="outline">
            <Clock className="mr-2 h-5 w-5" />
            Track Submissions
          </Button>
        </Link>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-mono font-bold uppercase tracking-wider">
          <span>Status</span>
          <span>Approved</span>
        </div>
        <Button className="w-full font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20" size="lg" disabled>
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Completed
        </Button>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono font-bold uppercase tracking-wider">
          <span>Status</span>
          <span>Changes Requested</span>
        </div>
        <Link href={`/challenges/${challengeSlug}/submit`} className="w-full block">
          <Button className="w-full font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20" size="lg">
            <XCircle className="mr-2 h-5 w-5" />
            Resubmit Solution
          </Button>
        </Link>
      </div>
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
          <LWButtonLoader />
          Claiming...
        </>
      ) : (
        "Start Challenge"
      )}
    </Button>
  );
}
