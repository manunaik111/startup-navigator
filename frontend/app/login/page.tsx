"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setIsSubmitting(true);
        try {
            await login(email, password);
            router.push("/");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-navy">
                        <Compass size={24} className="text-gold" />
                        Startup Navigator
                    </Link>
                    <h1 className="mt-6 font-display text-2xl font-semibold text-navy">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-slate-light">
                        Log in to continue your startup journey.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
                            placeholder="••••••••"
                        />
                    </div>

                    <Button type="submit" isLoading={isSubmitting} className="w-full py-2.5">
                        Log in
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-light">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-medium text-teal hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}