"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Sparkles, FileText, Loader2, LogIn } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { searchApi, SearchSource, ApiError } from "@/lib/api";

interface ChatEntry {
    id: string;
    query: string;
    answer: string | null;
    sources: SearchSource[];
    isLoading: boolean;
    error: string | null;
}

const SUGGESTED_QUESTIONS = [
    "How do I split equity with a co-founder?",
    "What's the difference between an LLP and a Pvt Ltd company?",
    "When should I start thinking about fundraising?",
    "What are common mistakes when hiring my first employees?",
];

export default function AiSearchPage() {
    const { user, token } = useAuth();
    const [query, setQuery] = useState("");
    const [entries, setEntries] = useState<ChatEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [entries]);

    async function askQuestion(question: string) {
        if (!token) return;
        const entryId = crypto.randomUUID();

        setEntries((prev) => [
            ...prev,
            { id: entryId, query: question, answer: null, sources: [], isLoading: true, error: null },
        ]);
        setQuery("");

        try {
            const res = await searchApi.ask(question, token);
            setEntries((prev) =>
                prev.map((e) =>
                    e.id === entryId ? { ...e, answer: res.answer, sources: res.sources, isLoading: false } : e
                )
            );
        } catch (err) {
            const message = err instanceof ApiError ? err.message : "Couldn't get an answer. Please try again.";
            setEntries((prev) =>
                prev.map((e) => (e.id === entryId ? { ...e, isLoading: false, error: message } : e))
            );
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (query.trim()) {
            askQuestion(query.trim());
        }
    }

    if (!user) {
        return (
            <>
                <Navbar />
                <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
                    <Sparkles size={32} className="text-gold" />
                    <h1 className="mt-4 font-display text-2xl font-semibold text-navy">
                        Log in to use AI Search
                    </h1>
                    <p className="mt-2 text-sm text-slate-light">
                        Ask questions about registration, funding, legal, hiring, and more —
                        answered using our knowledge base. Search history is saved to your account.
                    </p>
                    <Link href="/login" className="mt-6">
                        <Button variant="primary" className="px-6 py-2.5">
                            <LogIn size={16} /> Log in to continue
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
            <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl flex-col px-6 py-10">
                <div className="mb-6 text-center">
                    <h1 className="font-display text-2xl font-semibold text-navy md:text-3xl">
                        Ask the AI Assistant
                    </h1>
                    <p className="mt-1 text-sm text-slate-light">
                        Answers are grounded in our startup knowledge base.
                    </p>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto">
                    {entries.length === 0 && (
                        <div className="mt-4">
                            <p className="mb-3 text-center text-sm text-slate-light">Try asking:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {SUGGESTED_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => askQuestion(q)}
                                        className="rounded-full border border-navy/15 px-4 py-2 text-sm text-slate-light transition-colors hover:border-gold hover:text-navy"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {entries.map((entry) => (
                        <div key={entry.id} className="space-y-3">
                            {/* User question */}
                            <div className="flex justify-end">
                                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-navy px-4 py-2.5 text-sm text-paper">
                                    {entry.query}
                                </div>
                            </div>

                            {/* Assistant answer */}
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-navy/10 bg-white px-4 py-3">
                                    {entry.isLoading && (
                                        <div className="flex items-center gap-2 text-sm text-slate-light">
                                            <Loader2 size={16} className="animate-spin text-gold" />
                                            Thinking...
                                        </div>
                                    )}
                                    {entry.error && <p className="text-sm text-red-600">{entry.error}</p>}
                                    {entry.answer && (
                                        <>
                                            <p className="whitespace-pre-line text-sm leading-relaxed text-slate">
                                                {entry.answer}
                                            </p>
                                            {entry.sources.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2 border-t border-navy/10 pt-3">
                                                    {entry.sources.map((source) => (
                                                        <Link
                                                            key={source.article_id}
                                                            href={`/explore-topics/${source.article_id}`}
                                                            className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-3 py-1 text-xs text-navy hover:bg-gold"
                                                        >
                                                            <FileText size={12} /> {source.article_title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>

                <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a question about your startup..."
                        className="flex-1 rounded-full border border-navy/15 bg-white px-5 py-3 text-sm outline-none focus:border-gold"
                    />
                    <Button type="submit" className="rounded-full p-3" aria-label="Send question">
                        <Send size={18} />
                    </Button>
                </form>
            </main>
            <Footer />
        </>
    );
}