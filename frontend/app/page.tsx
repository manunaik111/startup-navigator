import Link from "next/link";
import {
    ArrowRight,
    FileText,
    Landmark,
    Scale,
    Users,
    Palette,
    Megaphone,
    Receipt,
    TrendingUp,
    Sparkles,
    Rocket,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";

const TOPICS = [
    { icon: FileText, label: "Registration", slug: "registration", desc: "Pick a structure and register correctly." },
    { icon: Landmark, label: "Funding", slug: "funding", desc: "Understand pre-seed through Series A." },
    { icon: Scale, label: "Legal Compliance", slug: "legal", desc: "Contracts, IP, and data privacy basics." },
    { icon: Users, label: "Hiring", slug: "hiring", desc: "Build a hiring process that scales." },
    { icon: Palette, label: "Branding", slug: "branding", desc: "Build trust before you have a track record." },
    { icon: Megaphone, label: "Marketing", slug: "marketing", desc: "Grow on a bootstrap budget." },
    { icon: Receipt, label: "Taxation", slug: "taxation", desc: "Stay compliant as revenue grows." },
    { icon: TrendingUp, label: "Fundraising", slug: "fundraising", desc: "Prepare a pitch investors trust." },
    { icon: Sparkles, label: "AI Tools", slug: "ai-tools", desc: "Extend your team's capacity with AI." },
    { icon: Rocket, label: "Growth", slug: "growth", desc: "Grow sustainably, not just quickly." },
];

export default function HomePage() {
    return (
        <>
            <Navbar />

            {/* Hero */}
            <section className="relative overflow-hidden bg-navy text-paper">
                <div
                    className="pointer-events-none absolute inset-0 bg-route-dots opacity-30"
                    style={{ backgroundSize: "18px 18px" }}
                />
                <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
                    <span className="inline-block rounded-full border border-gold/40 px-4 py-1 text-xs tracking-wide text-gold">
                        YOUR STARTUP JOURNEY, MAPPED OUT
                    </span>
                    <h1 className="mt-6 font-display text-4xl font-semibold leading-tight md:text-5xl">
                        Navigate every stage of building your startup
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-paper/80">
                        From registration to fundraising, get practical guidance and an AI
                        assistant trained on real startup knowledge — answering your
                        specific questions, not generic advice.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link href="/ai-search">
                            <Button variant="primary" className="px-6 py-3 text-base">
                                Ask the AI Assistant <ArrowRight size={16} />
                            </Button>
                        </Link>
                        <Link href="/explore-topics">
                            <Button variant="ghost" className="border-paper/30 px-6 py-3 text-base text-paper hover:bg-paper/10">
                                Explore Topics
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured topics */}
            <section className="mx-auto max-w-6xl px-6 py-20">
                <div className="mb-10 text-center">
                    <h2 className="font-display text-2xl font-semibold text-navy md:text-3xl">
                        Everything you need to build a startup
                    </h2>
                    <p className="mt-2 text-slate-light">
                        Ten core areas, each with practical guides and an AI assistant ready to go deeper.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    {TOPICS.map(({ icon: Icon, label, slug, desc }) => (
                        <Link
                            key={slug}
                            href={`/explore-topics?category=${slug}`}
                            className="group rounded-2xl border border-navy/10 bg-white p-5 transition-shadow hover:shadow-md"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy transition-colors group-hover:bg-gold group-hover:text-navy">
                                <Icon size={18} />
                            </div>
                            <h3 className="mt-4 font-display text-base font-semibold text-navy">
                                {label}
                            </h3>
                            <p className="mt-1 text-sm text-slate-light">{desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* AI Search CTA */}
            <section className="bg-teal/10">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
                    <Sparkles size={28} className="text-teal" />
                    <h2 className="font-display text-2xl font-semibold text-navy md:text-3xl">
                        Have a specific question?
                    </h2>
                    <p className="max-w-xl text-slate-light">
                        Ask anything — from &ldquo;how do I split equity with a co-founder&rdquo; to
                        &ldquo;what&rsquo;s the GST threshold for my startup.&rdquo; Our AI assistant answers
                        using our full knowledge base.
                    </p>
                    <Link href="/ai-search">
                        <Button variant="secondary" className="px-6 py-3 text-base">
                            Try AI Search <ArrowRight size={16} />
                        </Button>
                    </Link>
                </div>
            </section>

            <Footer />
        </>
    );
}