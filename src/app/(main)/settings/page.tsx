"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  updateEmailSchema,
  updatePasswordSchema,
  type UpdateProfileInput,
  type UpdateEmailInput,
  type UpdatePasswordInput,
} from "@/lib/validations/auth";
import { toast } from "sonner";
import { Pencil, Check, X, ShieldAlert, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarModal } from "@/components/ui/avatar-modal";

export default function SettingsPage() {
  const { profile, isLoading } = useAuth();

  if (isLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="shimmer h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfilePictureForm currentUrl={profile.avatar_url} displayName={profile.display_name} email={profile.email} />
          <Separator />
          <DisplayNameForm currentName={profile.display_name || ""} />
          <Separator />
          <EmailForm currentEmail={profile.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and account security.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function ProfilePictureForm({ currentUrl, displayName, email }: { currentUrl: string | null, displayName: string | null, email: string }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      await authApi.uploadAvatar(file);
      toast.success("Profile picture updated!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-muted-foreground">Profile Picture</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-3">
          Upload a profile picture for your account.
        </p>
        <div className="flex items-center gap-4">
          <AvatarModal 
            src={currentUrl} 
            alt={displayName || "Profile picture"} 
            fallback={getInitials(displayName || email)} 
            size="lg"
            className="ring-2 ring-primary/10"
          />
          <div className="flex flex-col gap-2">
            <Label 
              htmlFor="avatar-upload" 
              className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "Uploading..." : "Upload Photo"}
            </Label>
            <Input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
              disabled={isUploading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DisplayNameForm({ currentName }: { currentName: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { display_name: currentName },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      await authApi.updateProfile(data.display_name);
      toast.success("Display name updated");
      setIsEditing(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-muted-foreground">Username</Label>
          <p className="font-medium mt-1">{currentName || "No username set"}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="display_name">Username</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input id="display_name" {...register("display_name")} autoFocus />
          </div>
          <Button type="button" variant="outline" size="icon" onClick={() => { setIsEditing(false); reset(); }} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={isSubmitting}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
        {errors.display_name && (
          <p className="text-sm text-destructive">
            {errors.display_name.message}
          </p>
        )}
      </div>
    </form>
  );
}

function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateEmailInput>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: { email: currentEmail },
  });

  const onRequestSubmit = async (data: UpdateEmailInput) => {
    if (data.email === currentEmail) {
      setIsEditing(false);
      return;
    }
    try {
      await authApi.requestEmailUpdate(data.email);
      toast.success("Verification email sent. Please check your inbox for the code.");
      setStep("verify");
    } catch (error: any) {
      toast.error(error.message || "Failed to request email update");
    }
  };

  const onVerify = async () => {
    setIsVerifying(true);
    try {
      await authApi.verifyEmailUpdate(getValues().email, otp);
      toast.success("Email successfully updated!");
      setStep("request");
      setOtp("");
      setIsEditing(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to verify email update");
    }
    setIsVerifying(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-muted-foreground">Email Address</Label>
          <p className="font-medium mt-1">{currentEmail}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onRequestSubmit)}>
        <Label htmlFor="email">Email Address</Label>
        <div className="flex gap-2 mt-1">
          <div className="flex-1">
            <Input id="email" type="email" {...register("email")} disabled={step === "verify" || isSubmitting} autoFocus />
          </div>
          {step === "request" && (
            <>
              <Button type="button" variant="outline" size="icon" onClick={() => { setIsEditing(false); reset(); }} disabled={isSubmitting}>
                <X className="h-4 w-4" />
              </Button>
              <Button type="submit" size="icon" disabled={isSubmitting}>
                <Check className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        {errors.email && (
          <p className="text-sm text-destructive mt-2">
            {errors.email.message}
          </p>
        )}
      </form>

      {step === "verify" && (
        <div className="pl-4 border-l-2 border-primary/20 space-y-3">
          <Label htmlFor="otp" className="text-sm">Enter Verification Code</Label>
          <div className="flex gap-2">
            <Input
              id="otp"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="max-w-[150px]"
            />
            <Button type="button" onClick={onVerify} disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setStep("request"); setOtp(""); }} disabled={isVerifying}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code sent to your new email address.
          </p>
        </div>
      )}
    </div>
  );
}

function PasswordForm() {
  const [isEditing, setIsEditing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordInput) => {
    try {
      await authApi.changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword
      });
      toast.success("Password updated successfully");
      reset();
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    }
  };

  if (!isEditing) {
    return (
      <Button 
        variant="link" 
        className="text-destructive p-0 h-auto font-medium"
        onClick={() => setIsEditing(true)}
      >
        <ShieldAlert className="mr-2 h-4 w-4" />
        Change Password
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          autoFocus
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">
            {errors.currentPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">
            {errors.newPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Changing..." : "Update Password"}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(); }} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
