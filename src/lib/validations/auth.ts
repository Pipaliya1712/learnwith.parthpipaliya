import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(40, "Username must be 40 characters or fewer")
      .regex(
        /^[a-zA-Z0-9_ ]+$/,
        "Username can only use letters, numbers, spaces, and underscores"
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    otp: z.string().length(6, "Verification code must be 6 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username must be 40 characters or fewer")
    .regex(
      /^[a-zA-Z0-9_ ]+$/,
      "Username can only use letters, numbers, spaces, and underscores"
    ),
});

export const updateEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Server-side schemas — passwords arrive as SHA-256 hashes (64-char hex)
export const serverLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().length(64, "Invalid password format"),
});

export const serverSignupSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(40, "Username must be 40 characters or fewer")
      .regex(
        /^[a-zA-Z0-9_ ]+$/,
        "Username can only use letters, numbers, spaces, and underscores"
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().length(64, "Invalid password format"),
    confirmPassword: z.string().length(64, "Invalid password format"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const serverResetPasswordSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().length(6, "Verification code must be 6 characters"),
    password: z.string().length(64, "Invalid password format"),
    confirmPassword: z.string().length(64, "Invalid password format"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const serverUpdatePasswordSchema = z
  .object({
    currentPassword: z.string().length(64, "Invalid password format"),
    newPassword: z.string().length(64, "Invalid password format"),
    confirmPassword: z.string().length(64, "Invalid password format"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
