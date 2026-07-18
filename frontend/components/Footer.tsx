import Link from "next/link";
import { Compass } from "lucide-react";

const FOOTER_LINKS = [
    { href: "/explore-topics", label: "Explore Topics" },
    { href: "/ai-search", label: "AI Search" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

const TOPICS = [
    "Registration",
    "Funding",
    "Legal",
    "Hiring",
    "Branding",
    "Marketing",
    "Taxation",
    "Growth",
];

export function Footer() {
    return (
        <footer className="border-t border-navy/10 bg-navy-50/40">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                    <div>
                        <div className="flex items-center gap-2 font-display text-lg font-semibold text-navy">
                            <Compass size={20} className="text-gold" strokeWidth={2} />
                            Startup Navigator
                        </div>
                        <p className="mt-3 max-w-xs text-sm text-slate-light">
                            A practical guide and AI assistant for founders navigating the
                            journey from idea to a growing company.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display text-sm font-semibold text-navy">Navigate</h3>
                        <ul className="mt-3 space-y-2">
                            {FOOTER_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-slate-light hover:text-teal">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display text-sm font-semibold text-navy">Popular topics</h3>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {TOPICS.map((topic) => (
                                <li key={topic}>
                                    <span className="inline-block rounded-full border border-navy/15 px-3 py-1 text-xs text-slate-light">
                                        {topic}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-navy/10 pt-6 text-xs text-slate-light md:flex-row">
                    <p>&copy; {new Date().getFullYear()} Startup Navigator. All rights reserved.</p>
                    <p>Built for entrepreneurs, by entrepreneurs.</p>
                </div>
            </div>
        </footer>
    );
}