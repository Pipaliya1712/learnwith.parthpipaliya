"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createProject, updateProject, createTag, uploadProjectImage, deleteProjectImage } from "@/app/actions/projects";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";
import type { Project, Feature, Improvement, Bug, ProjectImage, Tag } from "@/types";
import { Plus, X, Upload, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";

type InitialData = {
  project: Project;
  features: Feature[];
  improvements: Improvement[];
  bugs: Bug[];
  images: ProjectImage[];
  selectedTagIds: string[];
  allTags: { id: string; name: string; slug: string; created_at?: string }[];
};

type ProjectFormProps = {
  initialData?: InitialData;
};

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const projectId = initialData?.project.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: isEditing
      ? {
          name: initialData.project.name,
          summary: initialData.project.summary,
          live_link: initialData.project.live_link || "",
          repo_link: initialData.project.repo_link,
          additional_info: initialData.project.additional_info || "",
          is_visible: initialData.project.is_visible,
        }
      : { is_visible: false },
  });

  const isVisible = watch("is_visible");

  const [features, setFeatures] = useState<{ title: string; description: string }[]>(
    initialData?.features.map((f) => ({ title: f.title, description: f.description })) || []
  );
  const [improvements, setImprovements] = useState<{ title: string; description?: string }[]>(
    initialData?.improvements.map((i) => ({ title: i.title, description: i.description || undefined })) || []
  );
  const [bugs, setBugs] = useState<{ title: string; description?: string; severity: string }[]>(
    initialData?.bugs.map((b) => ({ title: b.title, description: b.description || undefined, severity: b.severity })) || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.selectedTagIds || []
  );
  const [allTags, setAllTags] = useState<Tag[]>(initialData?.allTags || []);
  const [images, setImages] = useState<ProjectImage[]>(initialData?.images || []);
  const [newTagName, setNewTagName] = useState("");
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (data: ProjectInput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("summary", data.summary);
    formData.append("live_link", data.live_link || "");
    formData.append("repo_link", data.repo_link);
    formData.append("additional_info", data.additional_info || "");
    formData.append("is_visible", String(data.is_visible));
    formData.append("features", JSON.stringify(features));
    formData.append("improvements", JSON.stringify(improvements));
    formData.append("bugs", JSON.stringify(bugs));
    formData.append("tag_ids", JSON.stringify(selectedTagIds));

    if (isEditing && projectId) {
      const result = await updateProject(projectId, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Project updated");
        router.push("/admin/projects");
        router.refresh();
      }
    } else {
      await createProject(formData);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    const result = await createTag(newTagName);
    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setAllTags((prev) => [...prev, result.data]);
      setSelectedTagIds((prev) => [...prev, result.data.id]);
      setNewTagName("");
      toast.success("Tag created");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !projectId) return;
    setUploading(true);
    for (const file of Array.from(e.target.files)) {
      const result = await uploadProjectImage(projectId, file);
      if (result.error) {
        toast.error(result.error);
      }
    }
    setUploading(false);
    router.refresh();
  };

  const handleDeleteImage = async (imageId: string) => {
    const result = await deleteProjectImage(imageId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      toast.success("Image deleted");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="basic">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="features">Features ({features.length})</TabsTrigger>
          <TabsTrigger value="improvements">Improvements ({improvements.length})</TabsTrigger>
          <TabsTrigger value="bugs">Bugs ({bugs.length})</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" {...register("name")} placeholder="My Awesome Project" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" {...register("summary")} rows={4} placeholder="Brief description of the project..." />
                {errors.summary && <p className="text-sm text-destructive">{errors.summary.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="live_link">Live Link</Label>
                <Input id="live_link" {...register("live_link")} placeholder="https://..." />
                {errors.live_link && <p className="text-sm text-destructive">{errors.live_link.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="repo_link">Repository Link</Label>
                <Input id="repo_link" {...register("repo_link")} placeholder="https://github.com/..." />
                {errors.repo_link && <p className="text-sm text-destructive">{errors.repo_link.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_info">Additional Information</Label>
                <Textarea id="additional_info" {...register("additional_info")} rows={4} placeholder="Any extra details..." />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isVisible} onCheckedChange={(v) => setValue("is_visible", v)} />
                <Label>Visible on landing page</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Project Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <p className="text-sm text-muted-foreground">
                  Save the project first to upload images.
                </p>
              ) : (
                <>
                  <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Click to upload images
                        </p>
                      </div>
                    )}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border aspect-video">
                        <Image src={img.image_url} alt={img.alt_text || ""} fill className="object-cover" sizes="200px" />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features Implemented</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={feature.title}
                    onChange={(e) => {
                      const next = [...features];
                      next[i] = { ...next[i], title: e.target.value };
                      setFeatures(next);
                    }}
                    placeholder="Feature title"
                    className="flex-1"
                  />
                  <Input
                    value={feature.description}
                    onChange={(e) => {
                      const next = [...features];
                      next[i] = { ...next[i], description: e.target.value };
                      setFeatures(next);
                    }}
                    placeholder="How it was implemented"
                    className="flex-[2]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFeatures((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setFeatures((prev) => [...prev, { title: "", description: "" }])}
              >
                <Plus className="h-4 w-4" /> Add Feature
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements">
          <Card>
            <CardHeader>
              <CardTitle>Improvements Needed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {improvements.map((imp, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={imp.title}
                    onChange={(e) => {
                      const next = [...improvements];
                      next[i] = { ...next[i], title: e.target.value };
                      setImprovements(next);
                    }}
                    placeholder="Improvement title"
                    className="flex-1"
                  />
                  <Input
                    value={imp.description || ""}
                    onChange={(e) => {
                      const next = [...improvements];
                      next[i] = { ...next[i], description: e.target.value };
                      setImprovements(next);
                    }}
                    placeholder="Description (optional)"
                    className="flex-[2]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setImprovements((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setImprovements((prev) => [...prev, { title: "" }])}
              >
                <Plus className="h-4 w-4" /> Add Improvement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bugs Tab */}
        <TabsContent value="bugs">
          <Card>
            <CardHeader>
              <CardTitle>Known Bugs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bugs.map((bug, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={bug.title}
                    onChange={(e) => {
                      const next = [...bugs];
                      next[i] = { ...next[i], title: e.target.value };
                      setBugs(next);
                    }}
                    placeholder="Bug title"
                    className="flex-1"
                  />
                  <select
                    value={bug.severity}
                    onChange={(e) => {
                      const next = [...bugs];
                      next[i] = { ...next[i], severity: e.target.value };
                      setBugs(next);
                    }}
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setBugs((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setBugs((prev) => [...prev, { title: "", severity: "medium" }])}
              >
                <Plus className="h-4 w-4" /> Add Bug
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedTagIds((prev) =>
                          isSelected
                            ? prev.filter((t) => t !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                />
                <Button type="button" variant="outline" onClick={handleCreateTag} className="gap-1">
                  <Plus className="h-4 w-4" /> Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
