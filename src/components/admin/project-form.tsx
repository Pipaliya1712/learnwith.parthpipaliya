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
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { projectsApi } from "@/lib/api-client";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";
import type { Project, Feature, Improvement, Bug, ProjectImage, Tag } from "@/types";
import { Plus, X, Upload, Trash2, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn, cleanImageUrl } from "@/lib/utils";
import { LWButtonLoader, LWLoader } from "@/components/ui/lw-loader";
import { LWOverlayLoader } from "@/components/ui/lw-overlay-loader";
  
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

const STEPS = [
  { id: "basic", label: "Basic Info", optional: false },
  { id: "images", label: "Images", optional: true },
  { id: "features", label: "Features", optional: true },
  { id: "improvements", label: "Improvements", optional: true },
  { id: "bugs", label: "Bugs", optional: true },
  { id: "tags", label: "Tags", optional: true },
];

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const projectId = initialData?.project.id;

  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
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
  // In edit mode, buffer changes until Save is clicked
  const [localImages, setLocalImages] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { confirm } = useConfirm();

  const handleNext = async () => {
    // Validate Basic Info step before proceeding
    if (currentStep === 0) {
      const isValid = await trigger(["name", "summary", "repo_link"]);
      if (!isValid) {
        toast.error("Please fill in all required basic info fields.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: ProjectInput) => {
    // Extra validation fallback
    if (currentStep !== STEPS.length - 1) return;

    const payload = {
      name: data.name,
      summary: data.summary,
      live_link: data.live_link || "",
      repo_link: data.repo_link,
      additional_info: data.additional_info || "",
      is_visible: data.is_visible,
      features,
      improvements,
      bugs,
      tag_ids: selectedTagIds,
    };

    try {
      setIsProcessing(true);
      if (isEditing && projectId) {
        // Step 1: Apply buffered image deletions
        for (const imgId of pendingDeleteIds) {
          try {
            await projectsApi.deleteImage(imgId);
          } catch (err: any) {
            toast.error(`Failed to delete image: ${err.message}`);
          }
        }
        // Step 2: Upload new images
        if (localImages.length > 0) {
          toast.info(`Uploading ${localImages.length} new image(s)...`);
          for (const localImg of localImages) {
            try {
              await projectsApi.uploadImage(projectId, localImg.file);
            } catch (err: any) {
              toast.error(`Failed to upload ${localImg.file.name}: ${err.message}`);
            }
          }
        }
        // Step 3: Save project data
        await projectsApi.update(projectId, payload);
        toast.success("Project updated");
        router.push("/admin/projects");
        router.refresh();
      } else {
        const res = (await projectsApi.create(payload)) as { id: string; success: boolean };
        
        // Upload local images sequentially
        if (localImages.length > 0) {
          toast.info(`Uploading ${localImages.length} images...`);
          for (const localImg of localImages) {
            try {
              await projectsApi.uploadImage(res.id, localImg.file);
            } catch (err: any) {
              toast.error(`Failed to upload ${localImg.file.name}: ${err.message}`);
            }
          }
        }
        
        toast.success("Project created successfully");
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save project");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const data = (await projectsApi.createTag(newTagName)) as Tag;
      setAllTags((prev) => [...prev, data]);
      setSelectedTagIds((prev) => [...prev, data.id]);
      setNewTagName("");
      toast.success("Tag created");
    } catch (error: any) {
      toast.error(error.message || "Failed to create tag");
    }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    confirm({
      title: "Delete Tag",
      description: `Are you sure you want to delete the tag "${tagName}"? This will permanently remove it from ALL projects.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await projectsApi.deleteTag(tagId);
          setAllTags((prev) => prev.filter((t) => t.id !== tagId));
          setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
          toast.success("Tag deleted");
        } catch (error: any) {
          toast.error(error.message || "Failed to delete tag");
        }
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    // Count visible images: in edit mode, existing (not pending delete) + new local
    const visibleExisting = images.filter(img => !pendingDeleteIds.includes(img.id)).length;
    const totalCount = visibleExisting + localImages.length;

    if (totalCount + files.length > 5) {
      toast.error("Maximum limit of 5 images per project reached.");
      return;
    }
    
    const newLocalImages = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setLocalImages(prev => [...prev, ...newLocalImages]);
  };

  const handleRemoveLocalImage = (idToRemove: string) => {
    setLocalImages(prev => {
      const img = prev.find(i => i.id === idToRemove);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter(i => i.id !== idToRemove);
    });
  };

  // Mark an existing uploaded image for deletion (buffered - applied on save)
  const handleDeleteImage = (imageId: string) => {
    setPendingDeleteIds(prev => [...prev, imageId]);
  };

  return (
    <LWOverlayLoader loading={isProcessing}>
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Stepper Header */}
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full overflow-hidden z-0">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} 
          />
        </div>
        
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  // Allow jumping back, but jumping forward requires validation of step 0
                  if (idx < currentStep) {
                    setCurrentStep(idx);
                  } else if (idx > currentStep && currentStep === 0) {
                    const isValid = await trigger(["name", "summary", "repo_link"]);
                    if (!isValid) {
                      toast.error("Please fill in all required basic info fields.");
                      return;
                    }
                    setCurrentStep(idx);
                  } else {
                    setCurrentStep(idx);
                  }
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium border-2 transition-all duration-300",
                  isActive ? "border-primary text-primary bg-background shadow-md" : 
                  isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                  "border-muted bg-background text-muted-foreground hover:border-primary/50"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
              </button>
              <span className={cn(
                "text-xs font-medium hidden sm:block absolute -bottom-6 w-max text-center transition-colors duration-300",
                isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-12">
        <div className="min-h-[400px]">
          {/* STEP 0: Basic Info */}
          {currentStep === 0 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-md">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <p className="text-sm text-muted-foreground">The core details of your project.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                  <Input id="name" {...register("name")} placeholder="My Awesome Project" className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""} />
                  {errors.name && <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary <span className="text-destructive">*</span></Label>
                  <Textarea id="summary" {...register("summary")} rows={4} placeholder="Brief description of the project..." className={errors.summary ? "border-destructive focus-visible:ring-destructive" : ""} />
                  {errors.summary && <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1">{errors.summary.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo_link">Repository Link <span className="text-destructive">*</span></Label>
                  <Input id="repo_link" {...register("repo_link")} placeholder="https://github.com/..." className={errors.repo_link ? "border-destructive focus-visible:ring-destructive" : ""} />
                  {errors.repo_link && <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1">{errors.repo_link.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="live_link">Live Link</Label>
                  <Input id="live_link" {...register("live_link")} placeholder="https://..." />
                  {errors.live_link && <p className="text-sm text-destructive">{errors.live_link.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional_info">Additional Information</Label>
                  <Textarea id="additional_info" {...register("additional_info")} rows={4} placeholder="Any extra details..." />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Switch checked={isVisible} onCheckedChange={(v) => setValue("is_visible", v)} />
                  <Label className="cursor-pointer" onClick={() => setValue("is_visible", !isVisible)}>Visible on landing page</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 1: Images */}
          {currentStep === 1 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-md">
              <CardHeader>
                <CardTitle>Project Images</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload up to 5 images showcasing your project. Allowed formats: JPG, PNG, WEBP.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 transition-all">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {uploading ? (
                    <LWLoader size="md" className="text-muted-foreground" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground transition-transform hover:scale-110 duration-200" />
                      <p className="mt-2 text-sm font-medium text-foreground">Click to select images</p>
                      <p className="text-xs text-muted-foreground mt-1">Recommended size: 1200x800px</p>
                    </div>
                  )}
                </label>

                {/* Existing uploaded images */}
                {images.filter(img => !pendingDeleteIds.includes(img.id)).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      Saved Images ({images.filter(img => !pendingDeleteIds.includes(img.id)).length}/5)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.filter(img => !pendingDeleteIds.includes(img.id)).map((img) => (
                        <div key={img.id} className="relative group rounded-lg overflow-hidden border aspect-video shadow-sm">
                          <Image src={cleanImageUrl(img.image_url)} alt={img.alt_text || ""} fill className="object-cover" sizes="200px" />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute right-1.5 top-1.5 rounded-md bg-background/80 p-1.5 text-destructive opacity-0 backdrop-blur transition-all hover:bg-destructive/15 group-hover:opacity-100 shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {localImages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Queued for Upload ({localImages.length})</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {localImages.map((img) => (
                        <div key={img.id} className="relative group rounded-lg overflow-hidden border aspect-video shadow-sm">
                          <Image src={img.previewUrl} alt="Preview" fill className="object-cover" sizes="200px" />
                          <button
                            type="button"
                            onClick={() => handleRemoveLocalImage(img.id)}
                            className="absolute right-1.5 top-1.5 rounded-md bg-background/80 p-1.5 text-destructive opacity-0 backdrop-blur transition-all hover:bg-destructive/15 group-hover:opacity-100 shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending delete badges */}
                {pendingDeleteIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {pendingDeleteIds.length} image(s) marked for removal — will be deleted on Save.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Features */}
          {currentStep === 2 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-md">
              <CardHeader>
                <CardTitle>Features Implemented</CardTitle>
                <p className="text-sm text-muted-foreground">Highlight the key capabilities of your project.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={feature.title}
                        onChange={(e) => {
                          const next = [...features];
                          next[i] = { ...next[i], title: e.target.value };
                          setFeatures(next);
                        }}
                        placeholder="Feature Title (e.g. Real-time Chat)"
                      />
                      <Input
                        value={feature.description}
                        onChange={(e) => {
                          const next = [...features];
                          next[i] = { ...next[i], description: e.target.value };
                          setFeatures(next);
                        }}
                        placeholder="Brief description of the feature..."
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFeatures((prev) => prev.filter((_, j) => j !== i))}
                      className="mt-1 opacity-50 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFeatures((prev) => [...prev, { title: "", description: "" }])}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Feature
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Improvements */}
          {currentStep === 3 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-md">
              <CardHeader>
                <CardTitle>Future Improvements</CardTitle>
                <p className="text-sm text-muted-foreground">What do you plan to add next? This helps others see the roadmap.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {improvements.map((imp, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={imp.title}
                        onChange={(e) => {
                          const next = [...improvements];
                          next[i] = { ...next[i], title: e.target.value };
                          setImprovements(next);
                        }}
                        placeholder="Improvement Area (e.g. Add OAuth Login)"
                      />
                      <Input
                        value={imp.description || ""}
                        onChange={(e) => {
                          const next = [...improvements];
                          next[i] = { ...next[i], description: e.target.value };
                          setImprovements(next);
                        }}
                        placeholder="Description (optional)"
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setImprovements((prev) => prev.filter((_, j) => j !== i))}
                      className="mt-1 opacity-50 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setImprovements((prev) => [...prev, { title: "" }])}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Improvement
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: Bugs */}
          {currentStep === 4 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-md">
              <CardHeader>
                <CardTitle>Known Bugs</CardTitle>
                <p className="text-sm text-muted-foreground">Document any current issues that contributors could help with.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {bugs.map((bug, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={bug.title}
                        onChange={(e) => {
                          const next = [...bugs];
                          next[i] = { ...next[i], title: e.target.value };
                          setBugs(next);
                        }}
                        placeholder="Bug Summary"
                      />
                      <select
                        value={bug.severity}
                        onChange={(e) => {
                          const next = [...bugs];
                          next[i] = { ...next[i], severity: e.target.value };
                          setBugs(next);
                        }}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="low">Low Severity</option>
                        <option value="medium">Medium Severity</option>
                        <option value="high">High Severity</option>
                        <option value="critical">Critical Severity</option>
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setBugs((prev) => prev.filter((_, j) => j !== i))}
                      className="mt-1 opacity-50 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBugs((prev) => [...prev, { title: "", severity: "medium" }])}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Bug
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 5: Tags */}
          {currentStep === 5 && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-md">
              <CardHeader>
                <CardTitle>Project Tags</CardTitle>
                <p className="text-sm text-muted-foreground">Select or create tags so developers can find your project easily.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3 bg-muted/30 p-4 rounded-lg border">
                  <Input
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="E.g. Next.js, Python, Supabase"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                    className="bg-background"
                  />
                  <Button type="button" onClick={handleCreateTag}>
                    <Plus className="h-4 w-4 mr-2" /> Create Tag
                  </Button>
                </div>
                
                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Available Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allTags.map((tag) => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                          <Badge
                            key={tag.id}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "cursor-pointer group flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all shadow-sm",
                              isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted"
                            )}
                            onClick={() =>
                              setSelectedTagIds((prev) =>
                                isSelected
                                  ? prev.filter((t) => t !== tag.id)
                                  : [...prev, tag.id]
                              )
                            }
                          >
                            {tag.name}
                            <span
                              role="button"
                              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground ml-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTag(tag.id, tag.name);
                              }}
                              title="Delete tag globally"
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={currentStep === 0 || isProcessing}
          >
            Back
          </Button>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/admin/projects")}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} className="min-w-[100px]">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isProcessing} className="min-w-[140px] shadow-md">
                {isEditing ? "Save Changes" : "Create Project"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
    </LWOverlayLoader>
  );
}
