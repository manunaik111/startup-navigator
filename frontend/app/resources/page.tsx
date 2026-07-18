"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ExternalLink, Link2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
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

function ResourcesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeCategory = searchParams.get("category") || "";

    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadResources = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await resourcesApi.list(activeCategory || undefined);
            setResources(data);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't load resources. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    function setCategory(slug: string) {
        if (slug === activeCategory) {
            router.push("/resources");
        } else {
            router.push(`/resources?category=${slug}`);
        }
    }

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-6xl px-6 py-16">
                <div className="mb-10 text-center">
                    <h1 className="font-display text-3xl font-semibold text-navy">Resources</h1>
                    <p className="mt-2 text-slate-light">
                        Curated tools, templates, and links to help you move faster.
                    </p>
                </div>

                <div className="mb-10 flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => router.push("/resources")}
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

                {isLoading && <LoadingSpinner label="Loading resources..." />}
                {!isLoading && error && <ErrorMessage message={error} onRetry={loadResources} />}

                {!isLoading && !error && resources.length === 0 && (
                    <div className="rounded-2xl border border-navy/10 bg-white px-6 py-14 text-center text-slate-light">
                        No resources found for this category yet.
                    </div>
                )}

                {!isLoading && !error && resources.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {resources.map((resource) => (
                            <Card key={resource.id} className="h-full">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-50 text-navy">
                                    <Link2 size={16} />
                                </div>
                                <h3 className="mt-3 font-display text-base font-semibold text-navy">
                                    {resource.title}
                                </h3>
                                {resource.description && (
                                    <p className="mt-2 text-sm text-slate-light">{resource.description}</p>
                                )}
                                {resource.url && (
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal hover:underline"
                                    >
                                        Visit resource <ExternalLink size={13} />
                                    </a>
                                )}
                    </Card>
                ))}
            </div>
        )}
        </main >
            <Footer />
    </>
  );
}

export default function ResourcesPage() {
    return (
        <Suspense fallback={<LoadingSpinner label="Loading..." fullPage />}>
            <ResourcesContent />
        </Suspense>
    );
}