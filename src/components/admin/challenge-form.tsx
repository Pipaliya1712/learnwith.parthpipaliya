"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { challengesAdminApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAdminProjectsServer } from "@/lib/server-api";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  acceptance_criteria: z.string().min(10, "Acceptance criteria must be at least 10 characters"),
  difficulty: z.string(),
  points: z.coerce.number().min(0, "Points must be positive"),
  estimated_hours: z.coerce.number().min(0.5, "Minimum 0.5 hours"),
  status: z.string(),
  project_id: z.string().uuid("Please select a project"),
});

type FormValues = z.infer<typeof formSchema>;

interface ChallengeFormProps {
  initialData?: any;
  projects: any[];
}

export function ChallengeForm({ initialData, projects }: ChallengeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate slug from title if not explicitly set
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      acceptance_criteria: initialData?.acceptance_criteria || "",
      difficulty: initialData?.difficulty || "beginner",
      points: initialData?.points || 10,
      estimated_hours: initialData?.estimated_hours || 1,
      status: initialData?.status || "draft",
      project_id: initialData?.project_id || "",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("title", value);
    if (!initialData && !form.formState.touchedFields.slug) {
      form.setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  };

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      if (initialData) {
        await challengesAdminApi.update(initialData.id, data);
        toast.success("Challenge updated successfully!");
      } else {
        await challengesAdminApi.create(data);
        toast.success("Challenge created successfully!");
      }
      router.push("/admin/challenges");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save challenge.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Challenge Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Implement JWT Authentication" 
            {...form.register("title", {
              onChange: handleTitleChange
            })} 
          />
          {form.formState.errors.title && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input 
            id="slug" 
            placeholder="e.g. implement-jwt-authentication" 
            {...form.register("slug")} 
          />
          {form.formState.errors.slug && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="project_id">Associated Project</Label>
          <Select 
            value={form.watch("project_id")}
            onValueChange={(val) => form.setValue("project_id", val, { shouldValidate: true })} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project">
                {form.watch("project_id") 
                  ? projects.find(p => p.id === form.watch("project_id"))?.name 
                  : "Select a project"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.project_id && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.project_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={form.watch("status")}
            onValueChange={(val) => form.setValue("status", val, { shouldValidate: true })} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a status">
                {form.watch("status") === "draft" && "Draft"}
                {form.watch("status") === "published" && "Published"}
                {form.watch("status") === "archived" && "Archived"}
                {!form.watch("status") && "Select a status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select 
            value={form.watch("difficulty")}
            onValueChange={(val) => form.setValue("difficulty", val, { shouldValidate: true })} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a difficulty">
                {form.watch("difficulty") === "beginner" && "Beginner"}
                {form.watch("difficulty") === "intermediate" && "Intermediate"}
                {form.watch("difficulty") === "advanced" && "Advanced"}
                {form.watch("difficulty") === "expert" && "Expert"}
                {!form.watch("difficulty") && "Select a difficulty"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="points">Points Value</Label>
            <Input type="number" id="points" {...form.register("points")} />
            {form.formState.errors.points && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.points.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_hours">Est. Hours</Label>
            <Input type="number" step="0.5" id="estimated_hours" {...form.register("estimated_hours")} />
            {form.formState.errors.estimated_hours && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.estimated_hours.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Challenge Description (Markdown supported)</Label>
        <Textarea 
          id="description" 
          className="min-h-[150px]" 
          placeholder="Describe the task..." 
          {...form.register("description")} 
        />
        {form.formState.errors.description && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="acceptance_criteria">Acceptance Criteria (Markdown supported)</Label>
        <Textarea 
          id="acceptance_criteria" 
          className="min-h-[150px]" 
          placeholder="List the requirements for approval..." 
          {...form.register("acceptance_criteria")} 
        />
        {form.formState.errors.acceptance_criteria && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.acceptance_criteria.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Save Changes" : "Create Challenge"}
        </Button>
      </div>
    </form>
  );
}
