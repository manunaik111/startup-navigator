"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
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

export default function ExploreTopicsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeCategory = searchParams.get("category") || "";

    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadArticles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await articlesApi.list(activeCategory || undefined);
            setArticles(data);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't load articles. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    function setCategory(slug: string) {
        if (slug === activeCategory) {
            router.push("/explore-topics");
        } else {
            router.push(`/explore-topics?category=${slug}`);
        }
    }

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-6xl px-6 py-16">
                <div className="mb-10 text-center">
                    <h1 className="font-display text-3xl font-semibold text-navy">Explore Topics</h1>
                    <p className="mt-2 text-slate-light">
                        Practical guides across every stage of building a startup.
                    </p>
                </div>

                {/* Category filters */}
                <div className="mb-10 flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => router.push("/explore-topics")}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${!activeCategory
                                ? "border-gold bg-gold text-navy"
                                : "border-navy/15 text-slate-light hover:border-gold"
                            }`}
                    >
                        All
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => setCategory(cat.slug)}
                            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${activeCategory === cat.slug
                                    ? "border-gold bg-gold text-navy"
                                    : "border-navy/15 text-slate-light hover:border-gold"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {isLoading && <LoadingSpinner label="Loading articles..." />}
                {!isLoading && error && <ErrorMessage message={error} onRetry={loadArticles} />}

                {!isLoading && !error && articles.length === 0 && (
                    <div className="rounded-2xl border border-navy/10 bg-white px-6 py-14 text-center text-slate-light">
                        No articles found for this category yet.
                    </div>
                )}

                {!isLoading && !error && articles.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article) => (
                            <Link key={article.id} href={`/explore-topics/${article.id}`}>
                                <Card className="h-full transition-shadow hover:shadow-md">
                                    <span className="inline-block rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy">
                                        {CATEGORIES.find((c) => c.slug === article.category)?.label || article.category}
                                    </span>
                                    <h3 className="mt-3 font-display text-lg font-semibold text-navy">
                                        {article.title}
                                    </h3>
                                    <p className="mt-2 line-clamp-3 text-sm text-slate-light">
                                        {article.summary || article.content.slice(0, 140) + "..."}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal">
                                        Read more <ArrowRight size={14} />
                                    </span>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}