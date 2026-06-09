// Central typed API client.
// ALL calls from the browser go to Next.js /api/* routes (same origin).
// Next.js /api/* routes proxy the request to FastAPI with the JWT token.

const API_BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // always send cookies
  });

  if (!res.ok) {
    let error = "An unexpected error occurred";
    try {
      const body = await res.json();
      error = body.detail || body.error || error;
    } catch {}
    throw new Error(error);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    confirm_password: string;
    display_name: string;
    captcha_answer?: string;
    captcha_token?: string;
  }) => request("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

  verifyOtp: (email: string, otp: string) =>
    request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),

  resendOtp: (email: string) =>
    request("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),

  login: (data: { email: string; password: string; captcha_answer?: string; captcha_token?: string; stay_logged_in?: boolean }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  logout: () => request("/auth/logout", { method: "POST" }),

  forgotPassword: (email: string) =>
    request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (data: {
    email: string;
    otp: string;
    password: string;
    confirm_password: string;
  }) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => request("/auth/me"),

  getCaptcha: () => request<{ question: string; captcha_token: string }>("/auth/captcha"),

  updateProfile: (display_name: string) =>
    request("/auth/profile", { method: "PATCH", body: JSON.stringify({ display_name }) }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE}/auth/avatar`, {
      method: "POST",
      body: form,
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        let error = "An unexpected error occurred";
        try {
          const body = await res.json();
          error = body.detail || body.error || error;
        } catch {}
        throw new Error(error);
      }
      return res.json();
    });
  },

  requestEmailUpdate: (email: string) =>
    request("/auth/email", { method: "PATCH", body: JSON.stringify({ email }) }),

  verifyEmailUpdate: (email: string, otp: string) =>
    request("/auth/email/verify", { method: "POST", body: JSON.stringify({ email, otp }) }),

  changePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => request("/auth/password", { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
export const projectsApi = {
  dashboard: (params: {
    skip?: number;
    limit?: number;
    search?: string;
    tagIds?: string[];
    sortBy?: string;
    sortDesc?: boolean;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set("skip", params.skip.toString());
    if (params.limit !== undefined) query.set("limit", params.limit.toString());
    if (params.search) query.set("search", params.search);
    if (params.tagIds?.length) query.set("tag_ids", params.tagIds.join(","));
    if (params.sortBy) query.set("sort_by", params.sortBy);
    if (params.sortDesc !== undefined) query.set("sort_desc", params.sortDesc.toString());
    return request<{ projects: unknown[]; total: number; page: number }>(
      `/projects/dashboard?${query.toString()}`
    );
  },

  create: (data: object) =>
    request("/projects", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: object) =>
    request(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) =>
    request(`/projects/${id}`, { method: "DELETE" }),

  toggleVisibility: (id: string, visible: boolean) =>
    request(`/projects/${id}/visibility`, { method: "PATCH", body: JSON.stringify({ visible }) }),

  reorder: (ordered_ids: string[]) =>
    request("/projects/reorder", { method: "POST", body: JSON.stringify({ ordered_ids }) }),

  uploadImage: (projectId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE}/projects/${projectId}/images`, {
      method: "POST",
      body: form,
      credentials: "include",
    }).then((r) => r.json());
  },

  deleteImage: (imageId: string) =>
    request(`/projects/images/${imageId}`, { method: "DELETE" }),

  createTag: (name: string) => request("/projects/tags", { method: "POST", body: JSON.stringify({ name }) }),

  deleteTag: (id: string) => request(`/projects/tags/${id}`, { method: "DELETE" }),
};

// ─── CHALLENGES ───────────────────────────────────────────────────────────────
export const challengesApi = {
  getBySlug: (slug: string) => request<any>(`/challenges/slug/${slug}`),
  claim: (id: string) => request(`/challenges/${id}/claim`, { method: "POST" }),
};

// ─── COMMENTS ────────────────────────────────────────────────────────────────
export const commentsApi = {
  listByProject: (projectId: string, params: { skip?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set("skip", params.skip.toString());
    if (params.limit !== undefined) query.set("limit", params.limit.toString());
    return request<{ comments: unknown[]; total: number; page: number }>(
      `/comments/project/${projectId}?${query.toString()}`
    );
  },

  add: (project_id: string, content: string) =>
    request("/comments", { method: "POST", body: JSON.stringify({ project_id, content }) }),

  updateOwn: (commentId: string, content: string) =>
    request(`/comments/${commentId}/own`, { method: "PATCH", body: JSON.stringify({ content }) }),

  deleteOwn: (commentId: string) =>
    request(`/comments/${commentId}/own`, { method: "DELETE" }),

  adminSoftDelete: (commentId: string) =>
    request(`/comments/${commentId}/soft`, { method: "DELETE" }),

  adminHardDelete: (commentId: string) =>
    request(`/comments/${commentId}`, { method: "DELETE" }),
};

// ─── USERS ───────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params: { skip?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.skip !== undefined) query.set("skip", params.skip.toString());
    if (params.limit !== undefined) query.set("limit", params.limit.toString());
    return request(`/users?${query.toString()}`);
  },

  search: (params: { search?: string; skip?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.skip !== undefined) query.set("skip", params.skip.toString());
    if (params.limit !== undefined) query.set("limit", params.limit.toString());
    return request<{ users: unknown[]; total: number }>(`/users/search?${query.toString()}`);
  },

  block: (userId: string) =>
    request(`/users/${userId}/block`, { method: "PATCH" }),

  unblock: (userId: string) =>
    request(`/users/${userId}/unblock`, { method: "PATCH" }),

  updateRole: (userId: string, role: "admin" | "developer") =>
    request(`/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
};
