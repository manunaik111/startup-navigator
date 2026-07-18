"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trash2, Sparkles, LogIn } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/lib/auth-context";
import { searchApi, SearchHistoryEntry, ApiError } from "@/lib/api";

export default function DashboardPage() {
    const { user, token } = useAuth();

    const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clearing, setClearing] = useState(false);

    const loadHistory = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await searchApi.history(token);
            setHistory(data);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't load your history. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    async function deleteEntry(id: string) {
        if (!token) return;
        setHistory((prev) => prev.filter((e) => e.id !== id));
        try {
            await searchApi.deleteHistoryEntry(id, token);
        } catch {
            loadHistory(); // revert to server state if the delete failed
        }
    }

    async function clearAll() {
        if (!token) return;
        setClearing(true);
        try {
            await searchApi.clearHistory(token);
            setHistory([]);
        } catch {
            // keep existing history visible if this fails
        } finally {
            setClearing(false);
        }
    }

    if (!user) {
        return (
            <>
                <Navbar />
                <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
                    <h1 className="font-display text-2xl font-semibold text-navy">
                        Log in to view your dashboard
                    </h1>
                    <p className="mt-2 text-sm text-slate-light">
                        Track your search history and pick up where you left off.
                    </p>
                    <Link href="/login" className="mt-6">
                        <Button variant="primary" className="px-6 py-2.5">
                            <LogIn size={16} /> Log in
                        </Button>
                    </Link>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-3xl px-6 py-16">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-semibold text-navy md:text-3xl">
                            Welcome back, {user.name.split(" ")[0]}
                        </h1>
                        <p className="mt-1 text-sm text-slate-light">Your AI search history.</p>
                    </div>
                    {history.length > 0 && (
                        <Button variant="ghost" onClick={clearAll} isLoading={clearing}>
                            <Trash2 size={14} /> Clear all
                        </Button>
                    )}
                </div>

                {isLoading && <LoadingSpinner label="Loading your history..." />}
                {!isLoading && error && <ErrorMessage message={error} onRetry={loadHistory} />}

                {!isLoading && !error && history.length === 0 && (
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy/10 bg-white px-6 py-16 text-center">
                        <Sparkles size={28} className="text-gold" />
                        <p className="text-slate-light">
                            You haven&apos;t asked the AI assistant anything yet.
                        </p>
                        <Link href="/ai-search">
                            <Button variant="primary">Ask your first question</Button>
                        </Link>
                    </div>
                )}

                {!isLoading && !error && history.length > 0 && (
                    <div className="space-y-4">
                        {history.map((entry) => (
                            <Card key={entry.id}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-navy">{entry.query}</p>
                                        <p className="mt-1 text-xs text-slate-light">
                                            {new Date(entry.created_at).toLocaleString(undefined, {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => deleteEntry(entry.id)}
                                        className="shrink-0 text-slate-light hover:text-red-600"
                                        aria-label="Delete this search"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate">
                                    {entry.answer}
                                </p>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}