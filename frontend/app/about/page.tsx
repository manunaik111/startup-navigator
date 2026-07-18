import { Compass, Target, Sparkles, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";

const VALUES = [
    {
        icon: Target,
        title: "Practical over generic",
        desc: "Every guide is written to answer a real decision a founder faces, not to pad a blog with keywords.",
    },
    {
        icon: Sparkles,
        title: "AI grounded in real content",
        desc: "Our AI assistant answers using our own knowledge base through retrieval-augmented generation, not guesses.",
    },
    {
        icon: Users,
        title: "Built for every stage",
        desc: "From your first registration to your Series A, the guidance grows with your startup.",
    },
];

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <main>
                <section className="bg-navy text-paper">
                    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
                        <Compass size={32} className="mx-auto text-gold" />
                        <h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
                            About Startup Navigator
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-paper/80">
                            We built Startup Navigator because most startup advice online is
                            either too generic to act on, or scattered across a dozen
                            different sites. We wanted one place with practical guidance and
                            an assistant that actually knows the content.
                        </p>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-6 py-16">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {VALUES.map(({ icon: Icon, title, desc }) => (
                            <Card key={title}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy">
                                    <Icon size={18} />
                                </div>
                                <h3 className="mt-4 font-display text-base font-semibold text-navy">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm text-slate-light">{desc}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="bg-teal/10">
                    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
                        <h2 className="font-display text-2xl font-semibold text-navy">
                            What&apos;s covered
                        </h2>
                        <p className="mt-3 text-slate-light">
                            Registration, funding, legal compliance, hiring, branding,
                            marketing, taxation, fundraising, AI tools, and business growth —
                            ten areas every founder eventually has to navigate, all in one
                            place, with an AI assistant ready to go deeper on any of it.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}