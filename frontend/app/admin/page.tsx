"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Users,
    FileText,
    Link2,
    MessagesSquare,
    TrendingUp,
    ArrowRight,
    ShieldAlert,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useAuth } from "@/lib/auth-context";
import { adminApi, AdminStats, ApiError } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
    registration: "Registration",
    funding: "Funding",
    legal: "Legal",
    hiring: "Hiring",
    branding: "Branding",
    marketing: "Marketing",
    taxation: "Taxation",
    fundraising: "Fundraising",
    "ai-tools": "AI Tools",
    growth: "Growth",
};

export default function AdminDashboardPage() {
    const { user, token } = useAuth();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await adminApi.stats(token);
            setStats(data);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't load dashboard stats.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    if (!user || user.role !== "admin") {
        return (
            <>
                <Navbar />
                <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
                    <ShieldAlert size={32} className="text-red-500" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-navy">
                        Admin access required
                    </h1>
                    <p className="mt-2 text-sm text-slate-light">
                        This area is restricted to admin accounts.
                    </p>
                </main>
                <Footer />
            </>
        );
    }

    const statCards = stats
        ? [
            { icon: Users, label: "Total users", value: stats.total_users },
            { icon: FileText, label: "Total articles", value: stats.total_articles },
            { icon: Link2, label: "Total resources", value: stats.total_resources },
            { icon: MessagesSquare, label: "Total AI searches", value: stats.total_searches },
            { icon: TrendingUp, label: "Searches (last 7 days)", value: stats.searches_last_7_days },
        ]
        : [];

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-6xl px-6 py-16">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-semibold text-navy md:text-3xl">
                            Admin Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-slate-light">
                            Overview of activity across Startup Navigator.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/articles">
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold px-4 py-2 text-sm font-medium text-navy hover:bg-gold-light">
                                Manage Articles <ArrowRight size={14} />
                            </span>
                        </Link>
                        <Link href="/admin/resources">
                            <span className="inline-flex items-center gap-1 rounded-full border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:bg-navy-50">
                                Manage Resources <ArrowRight size={14} />
                            </span>
                        </Link>
                    </div>
                </div>

                {isLoading && <LoadingSpinner label="Loading stats..." />}
                {!isLoading && error && <ErrorMessage message={error} onRetry={loadStats} />}

                {!isLoading && !error && stats && (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                            {statCards.map(({ icon: Icon, label, value }) => (
                                <Card key={label}>
                                    <Icon size={20} className="text-gold" />
                                    <p className="mt-3 font-mono text-2xl font-semibold text-navy">{value}</p>
                                    <p className="mt-1 text-sm text-slate-light">{label}</p>
                                </Card>
                            ))}
                        </div>

                        <Card className="mt-8">
                            <h2 className="font-display text-lg font-semibold text-navy">
                                Articles by category
                            </h2>
                            <div className="mt-4 space-y-3">
                                {stats.articles_by_category.map((row) => {
                                    const max = Math.max(...stats.articles_by_category.map((r) => r.count), 1);
                                    return (
                                        <div key={row.category} className="flex items-center gap-3">
                                            <span className="w-32 shrink-0 text-sm text-slate-light">
                                                {CATEGORY_LABELS[row.category] || row.category}
                                            </span>
                                            <div className="h-2 flex-1 rounded-full bg-navy-50">
                                                <div
                                                    className="h-2 rounded-full bg-teal"
                                                    style={{ width: `${(row.count / max) * 100}%` }}
                                                />
                                            </div>
                                            <span className="w-6 shrink-0 text-right font-mono text-sm text-navy">
                                                {row.count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}