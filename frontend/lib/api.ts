const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {},
    token?: string | null
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        let detail = "Something went wrong. Please try again.";
        try {
            const body = await res.json();
            detail = body.detail || detail;
        } catch {
            // response wasn't JSON; keep default message
        }
        throw new ApiError(res.status, detail);
    }

    if (res.status === 204) {
        return undefined as T;
    }
    return res.json();
}

// ---------- Types ----------

export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    created_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface Article {
    id: string;
    title: string;
    category: string;
    content: string;
    summary: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface Resource {
    id: string;
    title: string;
    url: string | null;
    description: string | null;
    category: string | null;
    created_by: string | null;
    created_at: string;
}

export interface SearchSource {
    article_id: string;
    article_title: string;
    similarity: number;
}

export interface SearchResponse {
    answer: string;
    sources: SearchSource[];
}

export interface SearchHistoryEntry {
    id: string;
    query: string;
    answer: string;
    source_article_ids: string[] | null;
    created_at: string;
}

export interface AdminStats {
    total_users: number;
    total_articles: number;
    total_resources: number;
    total_searches: number;
    articles_by_category: { category: string; count: number }[];
    searches_last_7_days: number;
}

// ---------- Auth ----------

export const authApi = {
    signup: (name: string, email: string, password: string) =>
        request<AuthResponse>("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
        }),

    login: (email: string, password: string) =>
        request<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        }),
};

// ---------- Articles ----------

export const articlesApi = {
    list: (category?: string) =>
        request<Article[]>(`/articles${category ? `?category=${category}` : ""}`),

    get: (id: string) => request<Article>(`/articles/${id}`),

    create: (
        data: { title: string; category: string; content: string; summary?: string },
        token: string
    ) =>
        request<Article>("/articles", { method: "POST", body: JSON.stringify(data) }, token),

    update: (id: string, data: Partial<Article>, token: string) =>
        request<Article>(`/articles/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),

    delete: (id: string, token: string) =>
        request<void>(`/articles/${id}`, { method: "DELETE" }, token),
};

// ---------- Resources ----------

export const resourcesApi = {
    list: (category?: string) =>
        request<Resource[]>(`/resources${category ? `?category=${category}` : ""}`),

    create: (
        data: { title: string; url?: string; description?: string; category?: string },
        token: string
    ) =>
        request<Resource>("/resources", { method: "POST", body: JSON.stringify(data) }, token),

    update: (id: string, data: Partial<Resource>, token: string) =>
        request<Resource>(`/resources/${id}`, { method: "PUT", body: JSON.stringify(data) }, token),

    delete: (id: string, token: string) =>
        request<void>(`/resources/${id}`, { method: "DELETE" }, token),
};

// ---------- AI Search ----------

export const searchApi = {
    ask: (query: string, token: string) =>
        request<SearchResponse>("/search", { method: "POST", body: JSON.stringify({ query }) }, token),

    history: (token: string) => request<SearchHistoryEntry[]>("/history", {}, token),

    deleteHistoryEntry: (id: string, token: string) =>
        request<void>(`/history/${id}`, { method: "DELETE" }, token),

    clearHistory: (token: string) => request<void>("/history", { method: "DELETE" }, token),
};

// ---------- Admin ----------

export const adminApi = {
    stats: (token: string) => request<AdminStats>("/admin/stats", {}, token),
};

// ---------- Contact ----------

export const contactApi = {
    submit: (data: { name: string; email: string; message: string }) =>
        request<{ id: string }>("/contact", { method: "POST", body: JSON.stringify(data) }),
};