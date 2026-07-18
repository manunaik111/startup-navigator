"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { articlesApi, Article, ApiError } from "@/lib/api";

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

export default function ArticleDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    const loadArticle = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        try {
            const data = await articlesApi.get(id);
            setArticle(data);
        } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
                setNotFound(true);
            } else {
                setError(err instanceof ApiError ? err.message : "Couldn't load this article. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadArticle();
    }, [loadArticle]);

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-3xl px-6 py-16">
                <Link
                    href="/explore-topics"
                    className="mb-8 inline-flex items-center gap-1 text-sm text-slate-light hover:text-teal"
                >
                    <ArrowLeft size={16} /> Back to Explore Topics
                </Link>

                {isLoading && <LoadingSpinner label="Loading article..." />}

                {!isLoading && notFound && (
                    <div className="rounded-2xl border border-navy/10 bg-white px-6 py-14 text-center text-slate-light">
                        This article doesn&apos;t exist or may have been removed.
                    </div>
                )}

                {!isLoading && error && <ErrorMessage message={error} onRetry={loadArticle} />}

                {!isLoading && !error && !notFound && article && (
                    <article>
                        <span className="inline-block rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy">
                            {CATEGORY_LABELS[article.category] || article.category}
                        </span>
                        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
                            {article.title}
                        </h1>
                        <p className="mt-3 text-sm text-slate-light">
                            Last updated{" "}
                            {new Date(article.updated_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>

                        <div className="prose prose-slate mt-8 max-w-none">
                            {article.content.split("\n\n").map((paragraph, i) => (
                                <p key={i} className="mb-4 leading-relaxed text-slate">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        <div className="mt-12 rounded-2xl border border-teal/20 bg-teal/5 px-6 py-5 text-center">
                            <p className="text-sm text-slate-light">
                                Have a specific question about this topic?
                            </p>
                            <Link
                                href="/ai-search"
                                className="mt-2 inline-block font-medium text-teal hover:underline"
                            >
                                Ask the AI assistant &rarr;
                            </Link>
                        </div>
                    </article>
                )}
            </main>
            <Footer />
        </>
    );
}