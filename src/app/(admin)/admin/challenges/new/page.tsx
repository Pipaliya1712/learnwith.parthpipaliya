"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { challengesApi, projectsApi } from "@/lib/api-client";
import { Trophy, Code, Award, CheckCircle2, ChevronRight, AlertCircle, Sparkles, Loader2, ListTodo, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function NewChallengePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(250);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");
  const [criteria, setCriteria] = useState<string[]>(["Compiles without warnings", "Passes test suite verification"]);
  const [newCriterion, setNewCriterion] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsApi.dashboard({ limit: 100 });
        const projectList = (data.projects as any[]) || [];
        setProjects(projectList);
        if (projectList.length > 0) {
          setProjectId(projectList[0].id);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
        toast.error("Failed to load projects list.");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  // Sync Slug with Title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const addCriterion = () => {
    if (!newCriterion.trim()) return;
    setCriteria((prev) => [...prev, newCriterion.trim()]);
    setNewCriterion("");
  };

  const removeCriterion = (idx: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent, status: "draft" | "published") => {
    e.preventDefault();

    if (!title || !slug || !projectId || !description) {
      toast.error("Please fill in all core details.");
      return;
    }

    try {
      setSubmitting(true);
      await challengesApi.create({
        project_id: projectId,
        title,
        slug,
        description,
        difficulty,
        points: Number(points),
        estimated_hours: Number(estimatedHours),
        acceptance_criteria: criteria.join("\n"),
        status,
      });

      toast.success(`Challenge successfully created as ${status}!`);
      router.push("/challenges");
    } catch (err: any) {
      toast.error(err.message || "Failed to create challenge.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Navigation breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
        <span>Admin Console</span>
        <ChevronRight className="size-3" />
        <span className="text-primary text-glow-cyan">New Challenge</span>
      </nav>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Create New Challenge</h1>
          <p className="text-on-surface-variant text-sm mt-1">Configure challenge parameters, reward specifications, and tests.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.push("/dashboard")}
            disabled={submitting}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-outline-variant hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-all"
          >
            Discard
          </button>
          <button
            onClick={(e) => handleSubmit(e, "published")}
            disabled={submitting}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-on-primary-container font-bold text-sm rounded-xl active-glow transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="size-4" />
                Publish Challenge
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Editor column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Details */}
          <section className="glass-panel p-6 rounded-2xl bg-surface-container-low border-outline-variant/40 space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <Code className="size-5 text-primary" />
              Core Details
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Project Association</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant text-sm text-on-surface outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Advanced State Management with Rust"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Unique URL Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="advanced-state-management-rust"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm font-mono text-on-surface outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Objective Description</label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the challenge goal, guidelines, and what needs to be contributed..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all resize-y"
                />
              </div>
            </div>
          </section>

          {/* Acceptance Criteria */}
          <section className="glass-panel p-6 rounded-2xl bg-surface-container-low border-outline-variant/40 space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <CheckCircle2 className="size-5 text-primary" />
              Acceptance Criteria
            </h2>

            <div className="space-y-3">
              {criteria.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container-high/40 border border-outline-variant/30 rounded-xl">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span className="flex-1 text-sm text-on-surface">{c}</span>
                  <button
                    type="button"
                    onClick={() => removeCriterion(idx)}
                    className="p-1 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  placeholder="Add new acceptance verification step..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={addCriterion}
                  className="px-4 py-2.5 bg-surface-container-highest border border-outline-variant text-on-surface hover:bg-surface-container-high text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                >
                  <PlusCircle className="size-4" />
                  Add
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Configuration Specs Column */}
        <div className="space-y-6">
          {/* Rewards & Difficulty */}
          <section className="glass-panel p-6 rounded-2xl bg-surface-container-low border-outline-variant/40 space-y-4">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 pb-2 border-b border-outline-variant/20">
              <Trophy className="size-5 text-[#ffb95f]" />
              Specs & XP
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Experience Points (XP)</label>
                <input
                  type="number"
                  required
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm font-mono text-on-surface outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Est. Completion Hours</label>
                <input
                  type="number"
                  required
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant focus:border-primary text-sm font-mono text-on-surface outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Difficulty Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["beginner", "intermediate", "advanced", "expert"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        difficulty === diff
                          ? "bg-primary/10 border-primary text-primary active-glow"
                          : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface"
                      }`}
                    >
                      {diff.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Info Card */}
          <section className="glass-panel p-6 rounded-2xl bg-surface-container-low border-outline-variant/40 space-y-3">
            <h3 className="font-bold text-on-surface flex items-center gap-1.5 text-sm">
              <AlertCircle className="size-4 text-primary" />
              Guidelines
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Once published, challenges appear in the Challenges Explorer. Users can claim challenges to work on PR contributions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
