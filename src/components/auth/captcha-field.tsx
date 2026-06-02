"use client";

import { useState, useEffect } from "react";
import { authApi } from "@/lib/api-client";
import { RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CaptchaFieldProps {
  onTokenChange: (token: string) => void;
  error?: string;
  registerProps: any; // Props from react-hook-form register
  disabled?: boolean;
}

export function CaptchaField({ onTokenChange, error, registerProps, disabled }: CaptchaFieldProps) {
  const [question, setQuestion] = useState<string>("Loading CAPTCHA...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchCaptcha = async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getCaptcha();
      setQuestion(data.question);
      onTokenChange(data.captcha_token);
    } catch (err) {
      setQuestion("Failed to load CAPTCHA");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRefreshing(true);
    fetchCaptcha();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="captchaAnswer">Captcha</Label>
      <div className="flex items-stretch rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <Input
          id="captchaAnswer"
          type="text"
          placeholder="Solve the math problem"
          autoComplete="off"
          disabled={isLoading || disabled}
          className="flex-1 border-0 rounded-none bg-primary/5 focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
          {...registerProps}
        />
        <div className="flex items-center justify-center border-l px-4 min-w-[80px] bg-background text-sm font-medium">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            question
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing || disabled}
          title="Refresh CAPTCHA"
          className="flex items-center justify-center border-l px-3 bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
