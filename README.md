# Startup Navigator

A comprehensive AI-powered web application to help entrepreneurs navigate the startup journey — covering company registration, funding, legal compliance, hiring, branding, marketing, taxation, fundraising, AI tools, and business growth.

**Live URL:** _[add after deployment]_
**GitHub Repository:** _[add your repo URL]_
**Demo Admin Login:** `admin@startupnavigator.com` / `Admin@12345` *(change before final submission)*

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack & Rationale](#tech-stack--rationale)
- [Database Schema](#database-schema)
- [AI / RAG Pipeline](#ai--rag-pipeline)
- [AI Tools Used in Development](#ai-tools-used-in-development)
- [Prompts Used](#prompts-used)
- [Local Setup](#local-setup)
- [Deployment Process](#deployment-process)
- [Known Limitations](#known-limitations)

---

## Overview

Startup Navigator is a full-stack application with:

- **Public pages:** Home, Explore Topics, Resources, About, Contact
- **Auth:** Signup/Login with JWT, role-based access (`user` / `admin`)
- **AI Search:** A chat-style assistant that answers questions using Retrieval-Augmented Generation (RAG) grounded in a curated knowledge base — not raw LLM guesses
- **User Dashboard:** Search history, per-entry delete, clear all
- **Admin Panel:** Stats dashboard (users, articles, resources, search volume, category breakdown) + full CRUD on Articles and Resources
- **Contact form:** Stored in the database for admin review

---

## Architecture

```
┌─────────────────┐        REST/JSON        ┌──────────────────┐
│  Next.js         │ ──────────────────────▶ │  FastAPI          │
│  (Frontend)      │ ◀────────────────────── │  (Backend)        │
│  Vercel          │                          │  Render/Railway   │
└─────────────────┘                          └─────────┬────────┘
                                                          │
                              ┌───────────────────────────┼───────────────────────────┐
                              ▼                           ▼                           ▼
                    ┌──────────────────┐      ┌────────────────────┐      ┌──────────────────┐
                    │ sentence-        │      │ Supabase Postgres  │      │ Groq API          │
                    │ transformers     │      │ + pgvector         │      │ (Llama 3.3 70B)   │
                    │ (local embed)    │      │ Articles, Users,   │      │ Answer generation │
                    │                  │      │ Search History     │      │                   │
                    └──────────────────┘      └────────────────────┘      └──────────────────┘
```

**Request flow for AI Search:**
1. User submits a question (JWT-authenticated) → `POST /search`
2. Backend embeds the question locally via `sentence-transformers` (`all-MiniLM-L6-v2`, 384-dim, free, no API call)
3. pgvector performs cosine-similarity search against pre-embedded article chunks, returning the top 5 matches
4. Retrieved chunks are assembled into a context block and sent to **Groq** (Llama 3.3 70B) along with the question
5. Groq generates an answer grounded in that context
6. Answer + source article references are returned to the frontend and logged to `search_history`

**Admin content flow:**
1. Admin creates/edits an article via the Admin panel
2. Backend automatically chunks the content and generates embeddings (`rag/index.py`)
3. Old embeddings for that article are deleted and replaced — so content is always re-indexed correctly, with no manual step required

---

## Tech Stack & Rationale

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | SSR/SEO, file-based routing, deploys natively on Vercel with zero config |
| Backend | FastAPI (Python, async) | Clean async support for I/O-bound RAG pipeline, auto-generated OpenAPI docs, natural fit for the ML-adjacent embedding step |
| Database | Supabase Postgres + `pgvector` | One database serves both relational data and vector search — no separate vector DB needed, generous free tier |
| Auth | Custom JWT (FastAPI + `passlib`/bcrypt + `python-jose`) | Full control over the `role` field for admin/user distinction; avoided Supabase Auth since the backend is Python-first, not JS-first |
| Embeddings | `sentence-transformers` (`all-MiniLM-L6-v2`), running locally in the backend | Completely free, no external API dependency, no rate limits — a deliberate choice to keep the retrieval step fully self-hosted and reproducible |
| LLM (generation) | Groq API (Llama 3.3 70B) | Free tier, extremely fast inference — ideal for a chat-style UI where response latency matters |
| Hosting | Vercel (frontend) + Render/Railway (backend) + Supabase (DB) | Split deployment because Next.js is built for serverless/edge, while FastAPI needs a persistent ASGI process — using the right platform for each half rather than forcing one host to do both |

---

## Database Schema

Six tables, defined in `backend/models.py`:

- **`users`** — id, name, email, password_hash, role (`user`/`admin`), created_at
- **`articles`** — id, title, category, content, summary, created_by, created_at, updated_at
- **`article_embeddings`** — id, article_id (FK, cascade delete), chunk_text, embedding (`vector(384)`), created_at
- **`resources`** — id, title, url, description, category, created_by, created_at
- **`search_history`** — id, user_id, query, answer, source_article_ids (array), created_at
- **`contact_messages`** — id, name, email, message, created_at

`article_embeddings` is separate from `articles` (rather than embedding whole articles) so long content is split into overlapping chunks — this gives more precise retrieval than matching against an entire article at once.

---

## AI / RAG Pipeline

Implemented in `backend/rag/`:

- **`embed.py`** — loads `all-MiniLM-L6-v2` once per process (cached), chunks text (500 chars, 50-char overlap), generates embeddings
- **`index.py`** — (re)generates and stores embeddings for an article, called automatically after create/update
- **`search.py`** — embeds the user's query, runs a pgvector cosine-distance query (`<=>` operator via SQLAlchemy's `cosine_distance`), returns top-k chunks with similarity scores
- **`generate.py`** — builds a context block from retrieved chunks, sends a system + user prompt to Groq, returns the grounded answer

This is genuine RAG: retrieval is a real algorithm against real data (not hardcoded), and generation is a real LLM call (not scripted responses). The only hardcoded part of the system is the seed *content* itself (the 10 starter knowledge-base articles) — the same way any CMS ships with initial content.

---

## AI Tools Used in Development

- **Claude (Anthropic)** — used throughout for architecture planning, backend code (FastAPI, SQLAlchemy models, RAG pipeline), frontend code (Next.js/React/Tailwind components), debugging deployment and environment issues, and this README.
- **Groq (Llama 3.3 70B)** — powers the live AI Search feature in the deployed application itself (not a dev tool — this is the product's own AI integration).

---

## Prompts Used

Representative prompts used during development with Claude:

> "Build and deploy a modern AI-powered web application called 'Startup Navigator'... [full assignment brief]. Help me plan the architecture first, then we'll build step by step."

> "We can use Groq or other free ones, and we can use admin login with users that can be created with password. For RAG, choose whatever is best."

> "For backend we will use Python."

> "Code and [build] one by one when I say so."

The system prompt used by the AI Search feature itself (sent to Groq at runtime, in `rag/generate.py`):

> "You are the AI assistant for Startup Navigator, a knowledge base for entrepreneurs covering company registration, funding, legal compliance, hiring, branding, marketing, taxation, fundraising, AI tools, and business growth. Answer the user's question using ONLY the context provided below. If the context doesn't contain enough information to answer, say so honestly instead of making something up. Keep answers clear, practical, and concise."

---

## Local Setup

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
# create .env from .env.example and fill in real values
python db_init.py             # creates tables + enables pgvector
python seed.py                # seeds admin user + 10 knowledge-base articles
uvicorn main:app --reload     # runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
# create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                   # runs on http://localhost:3000
```

---

## Deployment Process

1. **Database:** Supabase project created, `pgvector` extension enabled via `db_init.py`, connected using the **Session Pooler** connection string (IPv4-compatible) with `+asyncpg` driver appended.
2. **Backend:** Deployed to Render/Railway from the `backend/` directory. Environment variables (`DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `FRONTEND_URL`, etc.) set in the platform's dashboard, mirroring `.env.example`. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
3. **Frontend:** Deployed to Vercel from the `frontend/` directory. Environment variable `NEXT_PUBLIC_API_URL` set to the deployed backend URL.
4. **Post-deploy:** Ran `db_init.py` and `seed.py` once against the production database to create tables and seed initial content.

---

## Known Limitations

- Seed content covers one article per category (10 total) — a production version would have more depth per topic.
- Contact form messages are stored in the database but not emailed to an admin inbox (no email service integrated).
- `httpx`, `bcrypt`, and `email-validator` versions are pinned in `requirements.txt` to avoid known compatibility breaks with `groq`, `passlib`, and `pydantic` respectively — worth revisiting if upgrading dependencies later.