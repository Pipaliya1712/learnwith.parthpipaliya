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
import { LWOverlayLoader } from "@/components/ui/lw-overlay-loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronRight, 
  ArrowLeft, 
  Edit3, 
  Award, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Terminal, 
  Sparkles, 
  HelpCircle,
  Clock,
  BookOpen,
  Eye
} from "lucide-react";

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

type FormValues = {
  title: string;
  slug: string;
  description: string;
  acceptance_criteria: string;
  difficulty: string;
  points: number;
  estimated_hours: number;
  status: string;
  project_id: string;
};

interface ChallengeFormProps {
  initialData?: any;
  projects: any[];
}

export function ChallengeForm({ initialData, projects }: ChallengeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [criteriaList, setCriteriaList] = useState<string[]>([
    "Compiles without warnings",
    "Zero memory leaks or deadlock occurrences in stress test"
  ]);
  const [newCriteria, setNewCriteria] = useState("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      acceptance_criteria: initialData?.acceptance_criteria || "",
      difficulty: initialData?.difficulty || "beginner",
      points: initialData?.points || 500,
      estimated_hours: initialData?.estimated_hours || 2,
      status: initialData?.status || "draft",
      project_id: initialData?.project_id || "",
    },
  });

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("title", value);
    if (!initialData && !form.formState.touchedFields.slug) {
      form.setValue("slug", generateSlug(value), { shouldValidate: true });
    }
  };

  // Sync initial acceptance criteria
  useEffect(() => {
    if (initialData?.acceptance_criteria) {
      const parsed = initialData.acceptance_criteria
        .split("\n")
        .map((line: string) => line.replace(/^-\s*/, "").trim())
        .filter(Boolean);
      if (parsed.length > 0) {
        setCriteriaList(parsed);
      }
    }
  }, [initialData]);

  // Sync criteria list state to form field
  useEffect(() => {
    const joined = criteriaList.map(c => `- ${c}`).join("\n");
    form.setValue("acceptance_criteria", joined, { shouldValidate: true });
  }, [criteriaList, form]);

  const handleAddCriteria = () => {
    if (!newCriteria.trim()) return;
    setCriteriaList([...criteriaList, newCriteria.trim()]);
    setNewCriteria("");
  };

  const handleRemoveCriteria = (index: number) => {
    const updated = criteriaList.filter((_, i) => i !== index);
    setCriteriaList(updated);
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

  const difficulty = form.watch("difficulty");
  const associatedProjectName = projects.find(p => p.id === form.watch("project_id"))?.name || "None Selected";

  return (
    <LWOverlayLoader loading={isLoading}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Navigation Breadcrumbs & Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#464554]/30 pb-5">
          <div>
            <nav className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground mb-1.5">
              <span>Admin</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#c0c1ff]">
                {initialData ? "Edit Challenge" : "New Challenge"}
              </span>
            </nav>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {initialData ? `Edit: ${initialData.title}` : "Create New Challenge"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="bg-[#1f1f27] border-[#464554]/40 hover:bg-[#13131b] hover:text-white"
              onClick={() => router.back()}
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] hover:brightness-110 hover:shadow-lg hover:shadow-[#8083ff]/15 text-white border-none font-semibold active:scale-95 transition-transform"
            >
              {initialData ? "Save Changes" : "Publish Challenge"}
            </Button>
          </div>
        </div>

        {/* 2-Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Inputs) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Core Details Section */}
            <section className="bg-[#1f1f27] border border-[#464554]/30 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[#464554]/20">
                <Edit3 className="h-4 w-4 text-[#c0c1ff]" />
                Core Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Challenge Title</Label>
                  <Input 
                    id="title" 
                    className="bg-[#13131b] border-[#464554]/40 text-white focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff]"
                    placeholder="e.g. Implement JWT Authentication" 
                    {...form.register("title", {
                      onChange: handleTitleChange
                    })} 
                  />
                  {form.formState.errors.title && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">URL Slug</Label>
                  <Input 
                    id="slug" 
                    className="bg-[#13131b] border-[#464554]/40 text-white focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff]"
                    placeholder="e.g. implement-jwt-authentication" 
                    {...form.register("slug")} 
                  />
                  {form.formState.errors.slug && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="project_id" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Associated Project</Label>
                  <Select 
                    value={form.watch("project_id")}
                    onValueChange={(val) => form.setValue("project_id", val ?? "", { shouldValidate: true })}
                  >
                    <SelectTrigger className="bg-[#13131b] border-[#464554]/40 text-white">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f27] border-[#464554] text-white">
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id} className="hover:bg-[#13131b] focus:bg-[#13131b]">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.project_id && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.project_id.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Status</Label>
                  <Select 
                    value={form.watch("status")}
                    onValueChange={(val) => form.setValue("status", val ?? "", { shouldValidate: true })} 
                  >
                    <SelectTrigger className="bg-[#13131b] border-[#464554]/40 text-white">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f27] border-[#464554] text-white">
                      <SelectItem value="draft" className="hover:bg-[#13131b] focus:bg-[#13131b]">Draft</SelectItem>
                      <SelectItem value="published" className="hover:bg-[#13131b] focus:bg-[#13131b]">Published</SelectItem>
                      <SelectItem value="archived" className="hover:bg-[#13131b] focus:bg-[#13131b]">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Challenge Description (Markdown supported)</Label>
                <Textarea 
                  id="description" 
                  className="min-h-[120px] bg-[#13131b] border-[#464554]/40 text-white focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff]" 
                  placeholder="Describe the task and concurrent requirements..." 
                  {...form.register("description")} 
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>
            </section>

            {/* Configuration Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rewards & XP Card */}
              <section className="bg-[#1f1f27] border border-[#464554]/30 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[#464554]/20">
                    <Award className="h-4 w-4 text-amber-500" />
                    Rewards & XP
                  </h3>
                  
                  <div className="space-y-4 mt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="points" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Base XP</Label>
                        <div className="relative flex items-center">
                          <Input 
                            type="number" 
                            id="points" 
                            className="bg-[#13131b] border-[#464554]/40 text-white focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff] pr-8"
                            {...form.register("points")} 
                          />
                          <span className="absolute right-3 font-mono text-[10px] font-bold text-amber-500">XP</span>
                        </div>
                        {form.formState.errors.points && (
                          <p className="text-xs text-destructive mt-1">{form.formState.errors.points.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="estimated_hours" className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Est. Hours</Label>
                        <div className="relative flex items-center">
                          <Input 
                            type="number" 
                            step="0.5" 
                            id="estimated_hours" 
                            className="bg-[#13131b] border-[#464554]/40 text-white focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff] pr-10"
                            {...form.register("estimated_hours")} 
                          />
                          <span className="absolute right-3 font-mono text-[10px] font-bold text-muted-foreground">HRS</span>
                        </div>
                        {form.formState.errors.estimated_hours && (
                          <p className="text-xs text-destructive mt-1">{form.formState.errors.estimated_hours.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Challenge Difficulty</Label>
                      <div className="flex gap-1.5">
                        {[
                          { value: "beginner", label: "NOVICE", activeClass: "border-[#4cd7f6] bg-[#4cd7f6]/10 text-[#4cd7f6]" },
                          { value: "intermediate", label: "ADEPT", activeClass: "border-amber-500 bg-amber-500/10 text-amber-500" },
                          { value: "advanced", label: "EXPERT", activeClass: "border-indigo-400 bg-indigo-400/10 text-indigo-400" },
                          { value: "expert", label: "MASTER", activeClass: "border-red-500 bg-red-500/10 text-red-500" },
                        ].map((d) => (
                          <button
                            key={d.value}
                            type="button"
                            onClick={() => form.setValue("difficulty", d.value, { shouldValidate: true })}
                            className={`flex-1 py-2 rounded-lg border text-[10px] font-bold tracking-wider transition-all ${
                              difficulty === d.value
                                ? `border-2 ${d.activeClass}`
                                : "border-[#464554]/40 text-muted-foreground hover:border-white hover:text-white"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Acceptance Criteria Card */}
              <section className="bg-[#1f1f27] border border-[#464554]/30 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-[#464554]/20">
                    <CheckCircle2 className="h-4 w-4 text-[#4cd7f6]" />
                    Acceptance Criteria
                  </h3>

                  <div className="space-y-2 mt-3 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
                    {criteriaList.map((criteria, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-[#13131b] border border-[#464554]/30 rounded-lg">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs text-white truncate flex-1">{criteria}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCriteria(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Input
                    className="bg-[#13131b] border-[#464554]/40 text-xs text-white focus:border-[#c0c1ff] focus:ring-1 focus:ring-[#c0c1ff]"
                    placeholder="Add approval requirement..."
                    value={newCriteria}
                    onChange={(e) => setNewCriteria(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCriteria();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="xs"
                    onClick={handleAddCriteria}
                    className="bg-[#13131b] hover:bg-[#1f1f27] border border-[#464554]/40 text-white font-bold h-8 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
              </section>
            </div>

            {/* Technical Specs Panel */}
            <section className="bg-[#1f1f27] border border-[#464554]/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#464554]/20">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-muted-foreground" />
                  Runtime Environment Specs
                </h3>
                <div className="flex gap-1.5">
                  <span className="px-2 py-0.5 bg-[#13131b] rounded font-mono text-[9px] text-muted-foreground uppercase border border-[#464554]/40">
                    Docker Sandbox
                  </span>
                  <span className="px-2 py-0.5 bg-[#13131b] rounded font-mono text-[9px] text-muted-foreground uppercase border border-[#464554]/40">
                    60s Timeout
                  </span>
                </div>
              </div>

              <div className="bg-[#0d0d15] rounded-lg border border-[#464554]/40 overflow-hidden font-mono">
                <div className="flex items-center px-4 py-2 bg-[#1f1f27] border-b border-[#464554]/40 gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">challenge_config.json</span>
                </div>
                <pre className="p-4 text-xs text-[#c0c1ff] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  <code>{`{
  "project": "${associatedProjectName}",
  "runtime": "node-v18 / python-3.11",
  "memory_limit": "256MB",
  "test_suite": "npm run test / pytest",
  "entrypoint": "solution_submission.html"
}`}</code>
                </pre>
              </div>
            </section>
          </div>

          {/* Right Column (Sidebar Analytics) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Analytics Preview Card */}
            <div className="bg-[#1f1f27] border border-[#464554]/30 rounded-xl p-5 space-y-4">
              <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase pb-2 border-b border-[#464554]/20">
                Analytics Preview
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-[#13131b] rounded-lg border border-[#464554]/30">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Estimated Difficulty</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-[#8083ff] tracking-tight">
                      {difficulty === "expert" && "Master (Hard)"}
                      {difficulty === "advanced" && "Expert (Hard)"}
                      {difficulty === "intermediate" && "Adept (Medium)"}
                      {difficulty === "beginner" && "Novice (Easy)"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {difficulty === "expert" ? "+24% vs Avg" : "+8% vs Avg"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#13131b] rounded-lg border border-[#464554]/30">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Avg. Completion Time</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-white tracking-tight">
                      {difficulty === "expert" && "1h 45m"}
                      {difficulty === "advanced" && "1h 10m"}
                      {difficulty === "intermediate" && "45m"}
                      {difficulty === "beginner" && "20m"}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">Top 5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar Challenges */}
            <div className="bg-[#1f1f27] border border-[#464554]/30 rounded-xl p-5 space-y-4">
              <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase pb-2 border-b border-[#464554]/20">
                Similar Challenges
              </h3>

              <div className="space-y-4">
                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-[#8083ff] transition-colors flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-[#4cd7f6]" />
                      Async Patterns in Go
                    </span>
                    <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1 border border-amber-500/20 rounded">
                      800 XP
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#13131b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] w-[74%]" />
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground mt-1">74% Completion Rate</p>
                </div>

                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-[#8083ff] transition-colors flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-[#4cd7f6]" />
                      Smart Contract Auditing
                    </span>
                    <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1 border border-amber-500/20 rounded">
                      1200 XP
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#13131b] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#8083ff] to-[#4cd7f6] w-[28%]" />
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground mt-1">28% Completion Rate</p>
                </div>
              </div>
            </div>

            {/* AI Assistant Promo Widget */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#8083ff]/10 to-[#4cd7f6]/10 border border-[#8083ff]/20 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-[#8083ff] to-[#4cd7f6]" />
              <p className="relative z-10 text-sm text-[#8083ff] font-bold mb-1 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Need Help?
              </p>
              <p className="relative z-10 text-xs text-muted-foreground mb-4">
                Our AI Copilot can review your challenge description and draft optimal test parameters.
              </p>
              <Button
                type="button"
                onClick={() => {
                  const currentDesc = form.getValues("description");
                  if (currentDesc) {
                    toast.success("AI description optimizer initiated!");
                  } else {
                    toast.error("Please enter a description first");
                  }
                }}
                className="relative z-10 w-full py-2 bg-[#8083ff] text-white font-mono text-xs rounded-lg hover:brightness-110 active:scale-95 transition-transform"
              >
                Optimize Description
              </Button>
            </div>

            {/* Saving status metadata */}
            <div className="p-4 bg-[#1f1f27] border border-[#464554]/30 rounded-xl flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Status
              </span>
              <span className="font-mono text-[10px] uppercase font-bold text-white bg-[#13131b] px-2 py-0.5 rounded border border-[#464554]/40">
                {initialData ? "SAVED DRAFT" : "NEW ENTRY"}
              </span>
            </div>

          </aside>
        </div>
      </form>
    </LWOverlayLoader>
  );
}

