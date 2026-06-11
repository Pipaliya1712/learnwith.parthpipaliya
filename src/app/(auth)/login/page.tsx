"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { LWButtonLoader } from "@/components/ui/lw-loader";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { authApi } from "@/lib/api-client";
import { CaptchaField } from "@/components/auth/captcha-field";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", captchaAnswer: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        captcha_answer: data.captchaAnswer,
        captcha_token: captchaToken,
        stay_logged_in: stayLoggedIn
      });
      
      // If successful, redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      if (error.message.includes("verify your email")) {
        toast.error("Please verify your email first");
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(error.message || "Failed to login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <CaptchaField 
            onTokenChange={setCaptchaToken}
            error={errors.captchaAnswer?.message}
            registerProps={register("captchaAnswer")}
            disabled={isLoading}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="stayLoggedIn"
              checked={stayLoggedIn}
              onCheckedChange={(checked) => setStayLoggedIn(checked === true)}
            />
            <Label htmlFor="stayLoggedIn" className="text-sm text-muted-foreground cursor-pointer">
              Stay logged in for 24 hours
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <LWButtonLoader />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Sign in
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
