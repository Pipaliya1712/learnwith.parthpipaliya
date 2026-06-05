import { cookies } from "next/headers";
import type { Profile } from "@/types";

const FASTAPI_BASE = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";

async function fetchFromApi(endpoint: string, cacheConfig: RequestInit = { cache: "no-store" }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("learnwith_jwt")?.value;
  
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(`${FASTAPI_BASE}${endpoint}`, {
      ...cacheConfig,
      headers: {
        ...cacheConfig.headers,
        ...headers
      },
    });
    
    if (!res.ok) {
      console.error(`API Error on ${endpoint}: ${res.status} ${res.statusText}`);
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export async function getCurrentUserServer(): Promise<Profile | null> {
  const data = await fetchFromApi("/auth/me");
  return data as Profile | null;
}

export async function getLandingProjectsServer() {
  const data = await fetchFromApi("/projects/landing", { next: { revalidate: 60 } });
  return data || { projects: [], tags: [] };
}

export async function getDashboardProjectsServer() {
  const data = await fetchFromApi("/projects/dashboard?skip=0&limit=12");
  return data || { projects: [], total: 0, page: 1 };
}

export async function getAdminProjectsServer(params: { [key: string]: string | string[] | undefined } = {}) {
  const query = new URLSearchParams();

  const page = parseInt((params.page as string) || "1");
  const limit = parseInt((params.limit as string) || "10");
  query.set("skip", ((page - 1) * limit).toString());
  query.set("limit", limit.toString());

  if (params.sort_by) query.set("sort_by", params.sort_by as string);
  if (params.sort_desc) query.set("sort_desc", params.sort_desc as string);
  if (params.q_name) query.set("name", params.q_name as string);
  if (params.q_status) query.set("status", params.q_status as string);

  const data = await fetchFromApi(`/projects/admin?${query.toString()}`);
  return data || { projects: [], total: 0, page: 1 };
}

export async function getProjectBySlugServer(slug: string) {
  const data = await fetchFromApi(`/projects/slug/${slug}`);
  return data;
}

export async function getProjectByIdServer(id: string) {
  const data = await fetchFromApi(`/projects/id/${id}`);
  return data;
}

export async function getAdminUsersServer(params: { [key: string]: string | string[] | undefined } = {}) {
  const query = new URLSearchParams();

  const page = parseInt((params.page as string) || "1");
  const limit = parseInt((params.limit as string) || "10");
  query.set("skip", ((page - 1) * limit).toString());
  query.set("limit", limit.toString());

  if (params.sort_by) {
    query.set("sort_by", params.sort_by === "user" ? "display_name" : params.sort_by as string);
  }
  if (params.sort_desc) query.set("sort_desc", params.sort_desc as string);
  if (params.q_user) query.set("user", params.q_user as string);
  if (params.q_role) query.set("role", params.q_role as string);
  if (params.q_status) query.set("status", params.q_status as string);

  const data = await fetchFromApi(`/users?${query.toString()}`);
  return data || { users: [], total: 0, page: 1 };
}

export async function getAdminCommentsServer(params: { [key: string]: string | string[] | undefined } = {}) {
  const query = new URLSearchParams();
  
  const page = parseInt(params.page as string || "1");
  const limit = parseInt(params.limit as string || "10");
  query.set("skip", ((page - 1) * limit).toString());
  query.set("limit", limit.toString());
  
  if (params.sort_by) query.set("sort_by", params.sort_by as string);
  if (params.sort_desc) query.set("sort_desc", params.sort_desc as string);
  
  if (params.q_content) query.set("content", params.q_content as string);
  if (params.q_user_email) query.set("user_email", params.q_user_email as string);
  if (params.q_project_name) query.set("project_name", params.q_project_name as string);
  if (params.q_status) query.set("status", params.q_status as string);

  const data = await fetchFromApi(`/comments/admin?${query.toString()}`);
  return data || { data: [], total: 0, page: 1 };
}

export async function getUserProfileServer(userId: string) {
  const data = await fetchFromApi(`/users/${userId}/profile`);
  return data;
}

export async function getTagsServer() {
  const data = await fetchFromApi("/projects/tags");
  return data || [];
}
