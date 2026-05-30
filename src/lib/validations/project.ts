import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  summary: z.string().min(1, "Summary is required").max(2000),
  live_link: z.string().url("Must be a valid URL").or(z.literal("")),
  repo_link: z.string().url("Must be a valid URL"),
  additional_info: z.string().optional(),
  is_visible: z.boolean().default(false),
  landing_page_order: z.number().nullable().optional(),
});

export const featureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export const improvementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export const bugSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
});

export type ProjectInput = z.input<typeof projectSchema>;
export type FeatureInput = z.infer<typeof featureSchema>;
export type ImprovementInput = z.infer<typeof improvementSchema>;
export type BugInput = z.infer<typeof bugSchema>;
export type TagInput = z.infer<typeof tagSchema>;
