"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/lib/auth-context";
import { articlesApi, Article, ApiError } from "@/lib/api";

const CATEGORIES = [
    { slug: "registration", label: "Registration" },
    { slug: "funding", label: "Funding" },
    { slug: "legal", label: "Legal" },
    { slug: "hiring", label: "Hiring" },
    { slug: "branding", label: "Branding" },
    { slug: "marketing", label: "Marketing" },
    { slug: "taxation", label: "Taxation" },
    { slug: "fundraising", label: "Fundraising" },
    { slug: "ai-tools", label: "AI Tools" },
    { slug: "growth", label: "Growth" },
];

const EMPTY_FORM = { title: "", category: CATEGORIES[0].slug, summary: "", content: "" };

export default function AdminArticlesPage() {
    const { user, token } = useAuth();

    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null); // null = not editing, "new" = creating
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await articlesApi.list();
            setArticles(data);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't load articles.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    function startCreate() {
        setForm(EMPTY_FORM);
        setFormError(null);
        setEditingId("new");
    }

    function startEdit(article: Article) {
        setForm({
            title: article.title,
            category: article.category,
            summary: article.summary || "",
            content: article.content,
        });
        setFormError(null);
        setEditingId(article.id);
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormError(null);
    }

    async function saveArticle() {
        if (!token) return;
        if (!form.title.trim() || !form.content.trim()) {
            setFormError("Title and content are required.");
            return;
        }

        setSaving(true);
        setFormError(null);
        try {
            if (editingId === "new") {
                await articlesApi.create(form, token);
            } else if (editingId) {
                await articlesApi.update(editingId, form, token);
            }
            cancelEdit();
            await loadArticles();
        } catch (err) {
            setFormError(err instanceof ApiError ? err.message : "Couldn't save this article.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteArticle(id: string) {
        if (!token) return;
        setDeletingId(id);
        try {
            await articlesApi.delete(id, token);
            setArticles((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't delete this article.");
        } finally {
            setDeletingId(null);
        }
    }

    if (!user || user.role !== "admin") {
        return (
            <>
                <Navbar />
                <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
                    <ShieldAlert size={32} className="text-red-500" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-navy">
                        Admin access required
                    </h1>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-4xl px-6 py-16">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="font-display text-2xl font-semibold text-navy md:text-3xl">
                        Manage Articles
                    </h1>
                    <Button variant="primary" onClick={startCreate}>
                        <Plus size={16} /> New article
                    </Button>
                </div>

                {editingId && (
                    <Card className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold text-navy">
                                {editingId === "new" ? "New article" : "Edit article"}
                            </h2>
                            <button onClick={cancelEdit} aria-label="Close form" className="text-slate-light hover:text-navy">
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-navy">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                    className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
                                    placeholder="Article title"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-navy">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                    className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c.slug} value={c.slug}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-navy">
                                    Summary (shown on cards)
                                </label>
                                <input
                                    type="text"
                                    value={form.summary}
                                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                                    className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
                                    placeholder="Short one-line summary"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-navy">Content</label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                    rows={8}
                                    className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
                                    placeholder="Full article content..."
                                />
                                <p className="mt-1 text-xs text-slate-light">
                                    Saving will automatically re-index this article for AI Search.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={cancelEdit}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={saveArticle} isLoading={saving}>
                                    Save article
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {isLoading && <LoadingSpinner label="Loading articles..." />}
                {!isLoading && error && <ErrorMessage message={error} onRetry={loadArticles} />}

                {!isLoading && !error && (
                    <div className="space-y-3">
                        {articles.map((article) => (
                            <Card key={article.id} className="flex items-center justify-between gap-4">
                                <div>
                                    <span className="inline-block rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy">
                                        {CATEGORIES.find((c) => c.slug === article.category)?.label || article.category}
                                    </span>
                                    <h3 className="mt-2 font-medium text-navy">{article.title}</h3>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        onClick={() => startEdit(article)}
                                        className="rounded-full p-2 text-slate-light hover:bg-navy-50 hover:text-navy"
                                        aria-label="Edit article"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteArticle(article.id)}
                                        disabled={deletingId === article.id}
                                        className="rounded-full p-2 text-slate-light hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                        aria-label="Delete article"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}