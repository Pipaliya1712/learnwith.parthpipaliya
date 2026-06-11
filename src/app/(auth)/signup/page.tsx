"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
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
import { signupSchema, type SignupInput } from "@/lib/validations/auth";
import { authApi } from "@/lib/api-client";
import { CaptchaField } from "@/components/auth/captcha-field";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { display_name: "", email: "", password: "", confirmPassword: "", captchaAnswer: "" },
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);

    try {
      await authApi.signup({
        display_name: data.display_name,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        captcha_answer: data.captchaAnswer,
        captcha_token: captchaToken,
      });

      // Redirect to verify-email with the email
      toast.success("Verification code sent to your email");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your details to get started
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Username</Label>
            <Input
              id="display_name"
              type="text"
              placeholder="Your public username"
              autoComplete="username"
              disabled={isLoading}
              {...register("display_name")}
            />
            {errors.display_name && (
              <p className="text-sm text-destructive">{errors.display_name.message}</p>
            )}
          </div>

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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <CaptchaField 
            onTokenChange={setCaptchaToken}
            error={errors.captchaAnswer?.message}
            registerProps={register("captchaAnswer")}
            disabled={isLoading}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <LWButtonLoader />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Create account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-primary hover:text-primary/80">
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
