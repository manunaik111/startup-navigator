"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, ShieldAlert, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/lib/auth-context";
import { resourcesApi, Resource, ApiError } from "@/lib/api";

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

const EMPTY_FORM = { title: "", url: "", description: "", category: CATEGORIES[0].slug };

export default function AdminResourcesPage() {
    const { user, token } = useAuth();

    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadResources = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await resourcesApi.list();
            setResources(data);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't load resources.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    function startCreate() {
        setForm(EMPTY_FORM);
        setFormError(null);
        setEditingId("new");
    }

    function startEdit(resource: Resource) {
        setForm({
            title: resource.title,
            url: resource.url || "",
            description: resource.description || "",
            category: resource.category || CATEGORIES[0].slug,
        });
        setFormError(null);
        setEditingId(resource.id);
    }

    function cancelEdit() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setFormError(null);
    }

    async function saveResource() {
        if (!token) return;
        if (!form.title.trim()) {
            setFormError("Title is required.");
            return;
        }

        setSaving(true);
        setFormError(null);
        try {
            if (editingId === "new") {
                await resourcesApi.create(form, token);
            } else if (editingId) {
                await resourcesApi.update(editingId, form, token);
            }
            cancelEdit();
            await loadResources();
        } catch (err) {
            setFormError(err instanceof ApiError ? err.message : "Couldn't save this resource.");
        } finally {
            setSaving(false);
        }
    }

    async function deleteResource(id: string) {
        if (!token) return;
        setDeletingId(id);
        try {
            await resourcesApi.delete(id, token);
            setResources((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't delete this resource.");
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
                        Manage Resources
                    </h1>
                    <Button variant="primary" onClick={startCreate}>
                        <Plus size={16} /> New resource
                    </Button>
                </div>

                {editingId && (
                    <Card className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold text-navy">
                                {editingId === "new" ? "New resource" : "Edit resource"}
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
                                    placeholder="Resource title"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-navy">URL</label>
                                <input
                                    type="url"
                                    value={form.url}
                                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                                    className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
                                    placeholder="https://example.com"
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
                                <label className="mb-1 block text-sm font-medium text-navy">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-xl border border-navy/15 px-4 py-2.5 text-sm outline-none focus:border-gold"
                                    placeholder="Short description of this resource"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={cancelEdit}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={saveResource} isLoading={saving}>
                                    Save resource
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {isLoading && <LoadingSpinner label="Loading resources..." />}
                {!isLoading && error && <ErrorMessage message={error} onRetry={loadResources} />}

                {!isLoading && !error && (
                    <div className="space-y-3">
                        {resources.map((resource) => (
              <Card key={resource.id} className="flex items-center justify-between gap-4">
                <div>
                  {resource.category && (
                    <span className="inline-block rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy">
                      {CATEGORIES.find((c) => c.slug === resource.category)?.label || resource.category}
                    </span>
                  )}
                  <h3 className="mt-2 font-medium text-navy">{resource.title}</h3>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-teal hover:underline"
                    >
                      {resource.url} <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => startEdit(resource)}
                    className="rounded-full p-2 text-slate-light hover:bg-navy-50 hover:text-navy"
                    aria-label="Edit resource"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteResource(resource.id)}
                    disabled={deletingId === resource.id}
                    className="rounded-full p-2 text-slate-light hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    aria-label="Delete resource"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
                ))}
            </div>
        )}
        </main >
            <Footer />
    </>
  );
}