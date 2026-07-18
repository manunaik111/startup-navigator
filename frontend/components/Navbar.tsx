"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Compass } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/explore-topics", label: "Explore Topics" },
    { href: "/ai-search", label: "AI Search" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-50 bg-navy text-paper">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                    <Compass size={22} className="text-gold" strokeWidth={2} />
                    Startup Navigator
                </Link>

                {/* Desktop links */}
                <ul className="hidden items-center gap-7 md:flex">
                    {NAV_LINKS.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`text-sm transition-colors ${active ? "text-gold" : "text-paper/80 hover:text-gold"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="hidden items-center gap-4 md:flex">
                    {user ? (
                        <>
                            <Link
                                href={user.role === "admin" ? "/admin" : "/dashboard"}
                                className="text-sm text-paper/80 hover:text-gold"
                            >
                                {user.role === "admin" ? "Admin" : "Dashboard"}
                            </Link>
                            <button
                                onClick={logout}
                                className="rounded-full border border-gold/60 px-4 py-1.5 text-sm text-gold transition-colors hover:bg-gold hover:text-navy"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-paper/80 hover:text-gold">
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="rounded-full bg-gold px-4 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-gold-light"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="text-paper md:hidden"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="border-t border-paper/10 px-6 pb-6 md:hidden">
                    <ul className="flex flex-col gap-4 pt-4">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block text-sm text-paper/90 hover:text-gold"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-5 flex flex-col gap-3">
                        {user ? (
                            <>
                                <Link
                                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                                    onClick={() => setMenuOpen(false)}
                                    className="text-sm text-paper/90 hover:text-gold"
                                >
                                    {user.role === "admin" ? "Admin" : "Dashboard"}
                                </Link>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        logout();
                                    }}
                                    className="rounded-full border border-gold/60 px-4 py-2 text-sm text-gold"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="text-sm text-paper/90 hover:text-gold"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-full bg-gold px-4 py-2 text-center text-sm font-medium text-navy"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}