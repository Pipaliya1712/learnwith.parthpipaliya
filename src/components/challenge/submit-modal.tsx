"use client";

import React, { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submissionsApi } from "@/lib/api-client";
import { GitPullRequest, Link as LinkIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { LWButtonLoader } from "@/components/ui/lw-loader";

const submissionSchema = z.object({
  github_pr_url: z.string().url({ message: "Please enter a valid GitHub PR URL." }).includes("github.com", { message: "URL must be from GitHub." }),
  github_repo_url: z.string().url({ message: "Please enter a valid Repository URL." }).optional().or(z.literal("")),
  notes: z.string().max(500, { message: "Notes cannot exceed 500 characters." }).optional(),
});

interface SubmitModalProps {
  challengeId: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

export function SubmitModal({ challengeId, onSuccess, children }: SubmitModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    github_pr_url: "",
    github_repo_url: "",
    notes: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = submissionSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          formattedErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      
      await submissionsApi.submit({
        challenge_id: challengeId,
        github_pr_url: result.data.github_pr_url,
        github_repo_url: result.data.github_repo_url || undefined,
        notes: result.data.notes || undefined,
      });
      
      toast.success("Solution submitted successfully! It is now under review.");
      setOpen(false);
      onSuccess();
      
    } catch (error: any) {
      toast.error(error.message || "Failed to submit solution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={React.isValidElement(children) ? children : <button>{children}</button>} />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Submit Solution</DialogTitle>
          <DialogDescription>
            Ready for review? Provide your pull request details below. Our system and admins will review your code.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="github_pr_url" className="text-sm font-semibold">GitHub PR URL <span className="text-red-500">*</span></Label>
            <div className="relative">
              <GitPullRequest className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="github_pr_url" 
                name="github_pr_url"
                placeholder="https://github.com/username/repo/pull/1" 
                className={`pl-9 ${errors.github_pr_url ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                value={formData.github_pr_url}
                onChange={handleChange}
              />
            </div>
            {errors.github_pr_url && <p className="text-xs text-red-500">{errors.github_pr_url}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="github_repo_url" className="text-sm font-semibold">Repository URL (Optional)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="github_repo_url" 
                name="github_repo_url"
                placeholder="https://github.com/username/repo" 
                className={`pl-9 ${errors.github_repo_url ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                value={formData.github_repo_url}
                onChange={handleChange}
              />
            </div>
            {errors.github_repo_url && <p className="text-xs text-red-500">{errors.github_repo_url}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-semibold">Implementation Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              name="notes"
              placeholder="Briefly describe your approach or any challenges you faced..." 
              className={`resize-none min-h-[100px] ${errors.notes ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              value={formData.notes}
              onChange={handleChange}
            />
            {errors.notes && <p className="text-xs text-red-500">{errors.notes}</p>}
            <p className="text-xs text-muted-foreground text-right">
              {formData.notes.length}/500
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <><LWButtonLoader /> Submitting...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Submit for Review</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
