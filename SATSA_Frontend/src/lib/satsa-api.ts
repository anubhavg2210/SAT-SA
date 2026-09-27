// Client for the user's own SATSA backend (Python + Pandas + scikit-learn + PostgreSQL).
// Base URL is configurable; defaults to a locally running backend.
export const API_BASE =
  (import.meta.env["VITE_SATSA_API_URL"] as string | undefined) ?? "http://localhost:8000";

const TOKEN_KEY = "satsa_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  } catch {
    throw new Error(`Cannot reach the SATSA backend at ${API_BASE}. Is it running?`);
  }
  if (res.status === 401) {
    setToken(null);
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const ct = res.headers.get("content-type") ?? "";
  return (ct.includes("json") ? res.json() : res.text()) as Promise<T>;
}

export async function login(username: string, password: string) {
  const data = await apiFetch<{ access_token?: string; token?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const token = data.access_token ?? data.token;
  if (!token) throw new Error("Login response did not include a token.");
  setToken(token);
}

/** Normalise list responses: accepts arrays or { items|results|data: [] }. */
export function asList(d: unknown): Record<string, unknown>[] {
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    for (const k of ["items", "results", "data"]) if (Array.isArray(o[k])) return o[k] as Record<string, unknown>[];
  }
  return [];
}

export type UploadResult = {
  message?: string;
  dataset_status?: "partial" | "ready" | "invalid";
  uploaded_files?: string[];
  files_available?: number;
  files_required?: number;
  missing_files?: string[];
  validation?: unknown;
  validation_error?: string;
};

export async function checkBackend() {
  return apiFetch<{ message: string }>("/");
}

export async function uploadDataset(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return apiFetch<UploadResult>("/upload", {
    method: "POST",
    body: formData,
  });
}

export async function analyzeDataset() {
  return apiFetch<Record<string, unknown>>("/analyze/dataset");
}

export async function analyzeAll() {
  return apiFetch<Record<string, unknown>>("/analyze/all");
}

export async function analyzeCase(caseId: string) {
  return apiFetch<Record<string, unknown>>(
    `/analyze/${encodeURIComponent(caseId)}`
  );
}