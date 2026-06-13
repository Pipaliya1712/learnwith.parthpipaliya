export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "admin" | "developer" | "super_admin";
  is_blocked: boolean;
  email_verified: boolean;
  email_otp: string | null;
  email_otp_expires_at: string | null;
  password_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  live_link: string | null;
  repo_link: string;
  additional_info: string | null;
  is_visible: boolean;
  is_deleted: boolean;
  landing_page_order: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

export type ProjectTag = {
  project_id: string;
  tag_id: string;
  tags: Tag;
};

export type Feature = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  display_order: number;
};

export type Improvement = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  display_order: number;
};

export type Bug = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  display_order: number;
};

export type Comment = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type ProjectWithDetails = Project & {
  images: ProjectImage[];
  tags: Tag[];
  features: Feature[];
  improvements: Improvement[];
  bugs: Bug[];
};

export type PublicUser = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "admin" | "developer";
  created_at: string;
};
