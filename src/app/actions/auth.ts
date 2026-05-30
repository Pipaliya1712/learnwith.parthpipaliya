"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendOTPEmail } from "@/lib/email";
import { createSession, clearSession, sign, verify } from "@/lib/session";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  serverLoginSchema,
  serverSignupSchema,
  forgotPasswordSchema,
  serverResetPasswordSchema,
  updateProfileSchema,
  updateEmailSchema,
  serverUpdatePasswordSchema,
} from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── OTP COOKIE HELPERS ─────────────────────────────────────────────
async function setOTPCookie(type: string, payload: any) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const data = JSON.stringify({ ...payload, expiresAt });
  const signed = await sign(Buffer.from(data).toString("base64"));
  cookieStore.set(`otp_${type}`, signed, {
    path: "/",
    maxAge: 10 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

async function verifyOTPCookie(type: string) {
  const cookieStore = await cookies();
  const cookieName = `otp_${type}`;
  const signed = cookieStore.get(cookieName)?.value;
  if (!signed) return null;

  const verifiedPayload = await verify(signed);
  if (!verifiedPayload) return null;

  try {
    const data = JSON.parse(Buffer.from(verifiedPayload, "base64").toString());
    if (data.expiresAt < Date.now()) {
      cookieStore.delete(cookieName);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

async function clearOTPCookie(type: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`otp_${type}`);
}

// ─── SIGNUP ──────────────────────────────────────────────────────────
// Creates profile directly. No Supabase Auth.
export async function signup(data: { email: string; password: string; confirmPassword: string }) {
  const validation = serverSignupSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const supabase = createAdminClient();

  // Check if email already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, email_verified")
    .eq("email", data.email)
    .maybeSingle();

  if (existing) {
    if (existing.email_verified) {
      return { success: false, error: "This email is already registered" };
    }
    // Unverified user — allow retry with new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_otp: otp,
        email_otp_expires_at: expiresAt.toISOString(),
        password_hash: passwordHash,
      })
      .eq("id", existing.id);

    if (updateError) {
      return { success: false, error: "Failed to generate verification code" };
    }

    try {
      await sendOTPEmail({ to: data.email, otp });
    } catch {
      return { success: false, error: "Failed to send verification email. Please try again." };
    }

    return { success: true, email: data.email };
  }

  // New user — create profile
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const { error: insertError } = await supabase.from("profiles").insert({
    email: data.email,
    password_hash: passwordHash,
    email_verified: false,
    role: data.email === process.env.SUPER_ADMIN_EMAIL ? "admin" : "developer",
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  const otp = generateOTP();
  await setOTPCookie("signup", { email: data.email, otp });

  try {
    await sendOTPEmail({ to: data.email, otp });
  } catch {
    return { success: false, error: "Failed to send verification email. Please try again." };
  }

  return { success: true, email: data.email };
}

// ─── VERIFY OTP ──────────────────────────────────────────────────────
export async function verifyOTP(email: string, otp: string) {
  if (!email || !otp) {
    return { success: false, error: "Email and verification code are required" };
  }

  const cookieData = await verifyOTPCookie("signup");
  if (!cookieData || cookieData.email !== email || cookieData.otp !== otp) {
    return { success: false, error: "Invalid or expired verification code" };
  }

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "No account found with this email" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ email_verified: true })
    .eq("email", email);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await clearOTPCookie("signup");
  return { success: true };
}

// ─── RESEND OTP ──────────────────────────────────────────────────────
export async function resendOTP(email: string) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email_verified")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "No account found with this email" };
  }

  if (profile.email_verified) {
    return { success: false, error: "Email is already verified. You can log in." };
  }

  const otp = generateOTP();
  await setOTPCookie("signup", { email, otp });
    
  try {
    await sendOTPEmail({ to: email, otp });
  } catch {
    // Best effort
  }

  return { success: true, requiresVerification: true };
}

// ─── LOGIN ───────────────────────────────────────────────────────────
export async function login(email: string, password: string, stayLoggedIn: boolean = false) {
  const validation = serverLoginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_blocked, email_verified, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "Invalid email or password" };
  }

  if (!profile.email_verified) {
    return { success: false, error: "Please verify your email before logging in.", needsVerification: true, email };
  }

  if (profile.is_blocked) {
    return { success: false, error: "Your account has been blocked. Contact support." };
  }

  if (!profile.password_hash || !(await bcrypt.compare(password, profile.password_hash))) {
    return { success: false, error: "Invalid email or password" };
  }

  // Create custom session
  const sessionDuration = stayLoggedIn ? 24 * 60 * 60 : 60 * 60;
  await createSession(
    { userId: profile.id, email, role: profile.role },
    sessionDuration
  );

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── LOGOUT ──────────────────────────────────────────────────────────
export async function logout() {
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────
// Uses Supabase Auth only for the reset email (no custom SMTP for this)
export async function resetPassword(email: string) {
  const validation = forgotPasswordSchema.safeParse({ email });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  // Check if user exists
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    // Don't reveal whether email exists
    return { success: true };
  }

  // Generate a reset token (OTP-style) and email it
  const otp = generateOTP();
  await setOTPCookie("reset", { email, otp });

  try {
    await sendOTPEmail({ to: email, otp, userName: "User" });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send reset email. Please try again." };
  }
}

// ─── UPDATE PASSWORD (after reset) ──────────────────────────────────
export async function updatePassword(email: string, otp: string, password: string, confirmPassword: string) {
  const validation = serverResetPasswordSchema.safeParse({ email, otp, password, confirmPassword });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const cookieData = await verifyOTPCookie("reset");
  if (!cookieData || cookieData.email !== email || cookieData.otp !== otp) {
    return { success: false, error: "Invalid or expired verification code" };
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    return { success: false, error: "No account found with this email" };
  }

  await supabase
    .from("profiles")
    .update({ password_hash: passwordHash })
    .eq("id", profile.id);

  await clearOTPCookie("reset");

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── UPDATE PROFILE ─────────────────────────────────────────────────
export async function updateProfile(display_name: string) {
  const validation = updateProfileSchema.safeParse({ display_name });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session) return { success: false, error: "You must be logged in" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name })
    .eq("id", session.userId);

  if (error) return { success: false, error: "Failed to update profile" };

  revalidatePath("/", "layout");
  return { success: true };
}

// ─── UPDATE EMAIL ───────────────────────────────────────────────────
export async function updateEmail(email: string) {
  const validation = updateEmailSchema.safeParse({ email });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session) return { success: false, error: "You must be logged in" };

  const otp = generateOTP();
  await setOTPCookie("update_email", { newEmail: email, otp });

  try {
    await sendOTPEmail({ to: email, otp });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to send verification email" };
  }
}

export async function verifyEmailUpdate(otp: string) {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session) return { success: false, error: "You must be logged in" };

  const data = await verifyOTPCookie("update_email");
  if (!data || data.otp !== otp) {
    return { success: false, error: "Invalid or expired verification code" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ email: data.newEmail, email_verified: true })
    .eq("id", session.userId);

  if (error) return { success: false, error: error.message };

  await clearOTPCookie("update_email");
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── CHANGE PASSWORD ────────────────────────────────────────────────
export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  const validation = serverUpdatePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session) return { success: false, error: "You must be logged in" };

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("password_hash")
    .eq("id", session.userId)
    .maybeSingle();

  if (!profile?.password_hash || !(await bcrypt.compare(currentPassword, profile.password_hash))) {
    return { success: false, error: "Current password is incorrect" };
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await supabase.from("profiles").update({ password_hash: passwordHash }).eq("id", session.userId);

  revalidatePath("/", "layout");
  return { success: true };
}

// ─── GET CURRENT SESSION (for AuthProvider) ──────────────────────────
export async function getCurrentUser() {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  if (!session) return null;

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.userId)
    .maybeSingle();

  return profile;
}
