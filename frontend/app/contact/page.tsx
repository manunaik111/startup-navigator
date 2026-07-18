"use client";

import { useState, FormEvent } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { contactApi, ApiError } from "@/lib/api";

const EMPTY_FORM = { name: "", email: "", message: "" };

export default function ContactPage() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await contactApi.submit(form);
            setSubmitted(true);
            setForm(EMPTY_FORM);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Couldn't send your message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Navbar />
            <main className="mx-auto max-w-xl px-6 py-16">
                <div className="mb-8 text-center">
                    <Mail size={28} className="mx-auto text-gold" />
                    <h1 className="mt-4 font-display text-3xl font-semibold text-navy">Contact us</h1>
                    <p className="mt-2 text-slate-light">
                        Have a question or feedback? Send us a message and we&apos;ll get back to you.
                    </p>
                </div>

                {submitted ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-teal/20 bg-teal/5 px-6 py-12 text-center">
                        <CheckCircle2 size={28} className="text-teal" />
                        <p className="font-medium text-navy">Message sent successfully.</p>
                        <p className="text-sm text-slate-light">Thanks for reaching out — we&apos;ll respond soon.</p>
                        <Button variant="ghost" onClick={() => setSubmitted(false)} className="mt-2">
                            Send another message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="mb-1 block text-sm font-medium text-navy">
                                Message
                            </label>
                            <textarea
                                id="message"
                                value={form.message}
                                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                rows={5}
                                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
                                placeholder="How can we help?"
                            />
                        </div>

                        <Button type="submit" isLoading={isSubmitting} className="w-full py-2.5">
                            Send message
                        </Button>
                    </form>
                )}
            </main>
            <Footer />
        </>
    );
}