"""
Seeds the database with:
  - one admin user (credentials below — change the password before submitting!)
  - one sample article per knowledge-base category, automatically embedded for RAG

Usage:
    python seed.py

Admin login after seeding:
    email:    admin@startupnavigator.com
    password: Admin@12345
"""
import asyncio

from db import AsyncSessionLocal
from models import User, Article
from auth.utils import hash_password
from rag.index import index_article

ADMIN_EMAIL = "admin@startupnavigator.com"
ADMIN_PASSWORD = "Admin@12345"

ARTICLES = [
    {
        "title": "How to Register Your Startup in India",
        "category": "registration",
        "summary": "Step-by-step guide to choosing a business structure and registering your company.",
        "content": (
            "Choosing the right business structure is the first decision every founder faces. "
            "A Private Limited Company suits startups planning to raise venture capital, since it "
            "allows equity issuance and offers limited liability. An LLP suits service businesses "
            "with lower compliance needs. A sole proprietorship is fastest to set up but offers no "
            "liability protection and cannot raise institutional funding.\n\n"
            "To register a Private Limited Company: obtain Digital Signature Certificates (DSC) for "
            "all directors, apply for Director Identification Numbers (DIN), reserve a company name "
            "via the RUN or SPICe+ Part A service, then file SPICe+ Part B with the Ministry of "
            "Corporate Affairs along with the Memorandum and Articles of Association. Once approved, "
            "you receive a Certificate of Incorporation, PAN, and TAN. The whole process typically "
            "takes 7-15 working days if documents are in order.\n\n"
            "Common mistakes: picking a name too similar to an existing trademark, underestimating "
            "authorized capital, and not defining clear founder equity splits before incorporation."
        ),
    },
    {
        "title": "Understanding Startup Funding Stages",
        "category": "funding",
        "summary": "What pre-seed, seed, Series A and beyond actually mean, and what investors expect.",
        "content": (
            "Startup funding typically progresses through recognizable stages. Pre-seed funding "
            "(often $10K-$250K) comes from founders, friends and family, or angel investors, and is "
            "used to validate an idea and build an MVP. Seed funding ($250K-$2M) follows once there's "
            "early traction, and usually comes from angel investors or seed-stage VC funds.\n\n"
            "Series A ($2M-$15M) requires demonstrated product-market fit and repeatable revenue "
            "growth. Investors at this stage scrutinize unit economics, churn, and CAC-to-LTV ratio. "
            "Series B and beyond focus on scaling proven models into new markets or verticals.\n\n"
            "Founders should raise only what's needed to hit the next clear milestone, since raising "
            "too much too early dilutes ownership unnecessarily and raises expectations investors "
            "may hold you to in the next round."
        ),
    },
    {
        "title": "Legal Compliance Checklist for Early-Stage Startups",
        "category": "legal",
        "summary": "The core legal boxes every founder needs to tick in the first year.",
        "content": (
            "Beyond incorporation, early-stage startups need several legal foundations in place. "
            "Founders' agreements should define equity vesting (commonly 4 years with a 1-year "
            "cliff), roles, and what happens if a co-founder leaves early. Without this, disputes "
            "over ownership are one of the most common reasons early startups fail.\n\n"
            "Employment contracts and offer letters should include IP assignment clauses ensuring "
            "anything built by employees belongs to the company. Non-disclosure agreements (NDAs) "
            "protect sensitive information shared with vendors, contractors, or potential investors.\n\n"
            "Data privacy compliance (such as GDPR if serving EU users, or India's DPDP Act) is "
            "increasingly non-negotiable even for early products handling user data. Terms of "
            "Service and Privacy Policy documents should be reviewed by a lawyer before public launch, "
            "not copy-pasted from another company's site."
        ),
    },
    {
        "title": "Building Your First Hiring Process",
        "category": "hiring",
        "summary": "How early-stage startups should structure hiring to avoid costly mis-hires.",
        "content": (
            "Early hires disproportionately shape company culture, so hiring processes should be "
            "deliberate even when moving fast. Define the role clearly before posting it: what "
            "problem this person solves in the first 90 days, not just a list of skills.\n\n"
            "A simple structured process works well for small teams: a screening call to check "
            "basic fit and expectations, a skills-based work sample or technical exercise relevant "
            "to the actual job, and a founder conversation focused on values alignment and how the "
            "candidate handles ambiguity.\n\n"
            "For early hires, consider offering equity alongside salary, since cash is often "
            "constrained. Be transparent about vesting schedules and realistic about the risk "
            "involved. Reference checks matter more at this stage than at larger companies, since "
            "one bad hire can meaningfully derail a small team."
        ),
    },
    {
        "title": "Branding Fundamentals for New Startups",
        "category": "branding",
        "summary": "Building a brand identity that communicates trust before you have a track record.",
        "content": (
            "A brand is the promise a company makes and the experience it consistently delivers, "
            "not just a logo. For an early-stage startup with no track record, brand often does the "
            "work of building trust that testimonials and case studies will later provide.\n\n"
            "Start with positioning: who exactly is this for, what problem does it solve better than "
            "alternatives, and why should someone believe you. This positioning should inform "
            "everything else — visual identity, tone of voice, and even product UX copy.\n\n"
            "Visual identity doesn't need to be expensive. A simple, consistent color palette, one "
            "or two fonts, and a clean logo used consistently across the website, pitch deck, and "
            "social channels builds more trust than an inconsistent but 'fancier' identity. "
            "Consistency compounds credibility over time."
        ),
    },
    {
        "title": "Marketing on a Bootstrap Budget",
        "category": "marketing",
        "summary": "Low-cost, high-leverage marketing channels for early-stage startups.",
        "content": (
            "Early-stage startups rarely have big marketing budgets, so channel selection matters "
            "more than channel volume. Content marketing (blog posts, guides, or tools that solve a "
            "narrow problem for your target audience) compounds over time via search traffic and "
            "costs mostly time rather than money.\n\n"
            "Community-led growth — engaging genuinely in forums, Slack communities, or subreddits "
            "where your target users already gather — often outperforms paid ads for B2B and niche "
            "products in the first year.\n\n"
            "Paid acquisition can work but should be tested with small budgets first, tracking cost "
            "per acquisition against expected customer lifetime value before scaling spend. Referral "
            "programs, even simple ones, are underused: a happy early customer is often your "
            "cheapest acquisition channel."
        ),
    },
    {
        "title": "Taxation Basics Every Founder Should Know",
        "category": "taxation",
        "summary": "Key tax obligations for a newly incorporated startup.",
        "content": (
            "A newly incorporated company has recurring tax obligations regardless of revenue. "
            "Corporate income tax applies to profits, but startups meeting certain criteria may "
            "qualify for reduced rates or tax holidays under startup recognition schemes (such as "
            "DPIIT recognition in India, which can offer a 3-year tax exemption window).\n\n"
            "GST (or equivalent VAT/sales tax) registration becomes mandatory past a revenue "
            "threshold, or immediately if selling across state/national borders in some "
            "jurisdictions. Founders should track this threshold closely, since late registration "
            "can trigger penalties.\n\n"
            "TDS (tax deducted at source) obligations apply to salaries and many vendor payments. "
            "Maintaining clean bookkeeping from day one — even with simple tools — saves enormous "
            "pain during due diligence in a future funding round, since investors will ask for "
            "clean financials."
        ),
    },
    {
        "title": "Preparing for a Fundraising Round",
        "category": "fundraising",
        "summary": "What investors actually evaluate, and how to prepare before approaching them.",
        "content": (
            "Before approaching investors, founders should have a clear narrative: what problem, "
            "why now, why this team, and what traction proves the model works. A pitch deck usually "
            "covers problem, solution, market size, traction, business model, competition, team, "
            "and the ask.\n\n"
            "A data room should be prepared in advance with incorporation documents, cap table, "
            "financial statements, key contracts, and IP assignments — this speeds up due diligence "
            "significantly once a term sheet is on the table.\n\n"
            "Investors evaluate market size (is this big enough to be venture-scale), team-market "
            "fit, and evidence of a repeatable growth engine. Founders should also research investor "
            "fit before pitching: check-size range, sector focus, and stage focus, since misaligned "
            "targeting wastes time on both sides."
        ),
    },
    {
        "title": "AI Tools Every Startup Should Consider",
        "category": "ai-tools",
        "summary": "Practical AI tools that help small teams punch above their weight.",
        "content": (
            "AI tools can meaningfully extend a small team's capacity without proportional hiring. "
            "For customer support, AI chatbots trained on a knowledge base (similar to this "
            "application's own RAG search) can handle a large share of repetitive queries, freeing "
            "founders for higher-leverage work.\n\n"
            "For content and marketing, AI writing assistants speed up drafting blog posts, ad copy, "
            "and social content, though founders should still edit for brand voice and factual "
            "accuracy rather than publishing raw output.\n\n"
            "For engineering, AI coding assistants (like GitHub Copilot or Claude Code) can "
            "meaningfully speed up prototyping and debugging. For operations, AI-powered analytics "
            "tools can surface patterns in user behavior that would otherwise require a dedicated "
            "data analyst. The common thread: AI tools work best as a force multiplier on an "
            "existing process, not a replacement for having no process at all."
        ),
    },
    {
        "title": "Sustainable Business Growth Strategies",
        "category": "growth",
        "summary": "Balancing growth speed with sustainability for long-term startup health.",
        "content": (
            "Sustainable growth means growing revenue and users without proportionally growing "
            "costs, burn, or team stress. The classic trap is chasing growth metrics that look good "
            "on a pitch deck but don't reflect a healthy, retainable customer base.\n\n"
            "Founders should track retention and cohort behavior closely, not just top-line growth. "
            "A product with strong month-over-month retention in its early cohorts is a far stronger "
            "signal than raw signup numbers, since it indicates the product delivers real ongoing "
            "value.\n\n"
            "Growth strategies should match the stage of the company: pre-product-market-fit "
            "companies should prioritize learning over scaling, since scaling a flawed product just "
            "scales the flaws. Once product-market fit is validated through strong retention, "
            "founders can shift focus toward efficient paid acquisition and expansion into adjacent "
            "customer segments or geographies."
        ),
    },
]


async def seed():
    async with AsyncSessionLocal() as db:
        admin = User(
            name="Admin",
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role="admin",
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        print(f"Created admin user: {ADMIN_EMAIL}")

        for entry in ARTICLES:
            article = Article(
                title=entry["title"],
                category=entry["category"],
                content=entry["content"],
                summary=entry["summary"],
                created_by=admin.id,
            )
            db.add(article)
            await db.commit()
            await db.refresh(article)

            await index_article(db, article)
            print(f"Seeded + embedded article: {article.title}")

    print("\nSeeding complete.")
    print(f"Admin login -> email: {ADMIN_EMAIL} | password: {ADMIN_PASSWORD}")
    print("IMPORTANT: change this password (or the seeded user) before final submission.")


if __name__ == "__main__":
    asyncio.run(seed())