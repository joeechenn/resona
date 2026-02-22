\# AGENTS.md — Resona (Music Analytics + Social Discovery)



\## Project Purpose

Resona is a Beli-style music analytics and social discovery app where users rate tracks/artists/albums and discover who "resona-tes" with them. The goal is to turn subjective music debates into structured, data-driven insights and conversation.



This is a learning + product-building project focused on fullstack engineering, scalable data modeling, and practical recommender systems.



---



\## What Currently Exists

\- Next.js 15 App Router with TypeScript, TailwindCSS, and shadcn/ui

\- Prisma ORM with PostgreSQL (hosted on NeonDB)

\- NextAuth v5 authentication (Google OAuth)

\- Three-column dashboard layout with persistent sidebars

\- Spotify Web API integration using Client Credentials flow (search, track/artist/album detail pages)

\- Debounced search with dynamic routing for detail pages

\- Prisma schema supporting users, ratings, tracks, artists, albums, and social features

\- Dark Spotify-style theme throughout

\- Early analytics exploration (Python/NumPy/scikit-learn) for embeddings and similarity scoring



---



\## File Structure

```

src/

&nbsp; app/

&nbsp;   api/              ← API routes (Spotify search, auth callbacks, etc.)

&nbsp;   (dashboard)/      ← Main app layout with three-column CSS Grid

&nbsp;   track/\[id]/       ← Track detail page (dynamic route)

&nbsp;   artist/\[id]/      ← Artist detail page (dynamic route)

&nbsp;   album/\[id]/       ← Album detail page (dynamic route)

&nbsp; components/         ← Shared UI (AnalyticsSidebar, StatsSidebar, SearchBar, etc.)

&nbsp; lib/                ← Utilities (spotify.ts, prisma.ts, auth config)

prisma/

&nbsp; schema.prisma       ← Source of truth for data model

analytics/            ← Python scripts/notebooks for offline modeling + evaluation

```



---



\## Core Prisma Models

\- \*\*User\*\* — Auth identity, profile info, preferences

\- \*\*Track, Artist, Album\*\* — Music catalog entities (keyed by Spotify ID)

\- \*\*Rating\*\* — User ratings on a 0–10 scale for any ratable entity

\- \*\*Post\*\* — Auto-generated social posts from ratings

\- \*\*Follow\*\* — User-to-user social graph (many-to-many)



If proposing schema changes, reference these model names exactly and explain migration impact.



---



\## Key Technical Constraints



\### Spotify API Limitations

\- \*\*`audio-features` and `audio-analysis` endpoints are deprecated for new applications. Do NOT suggest approaches that rely on these.\*\*

\- Vectorization strategy relies on user ratings + genre tags + artist/album metadata instead.

\- Use Client Credentials flow for catalog search (no user-scoped Spotify data needed).

\- Do not assume users have Spotify accounts — the app supports manual rating without Spotify OAuth.



\### Next.js 15 Specifics

\- Dynamic route params are async in Next.js 15 — always `await params` before accessing properties.

\- Prefer Server Components for data fetching; use Client Components (`"use client"`) only when interactivity or hooks are required.

\- API routes use the `app/api/` convention with Route Handlers (not Pages Router).



---



\## Currently In Progress

\- Core user flow: search → detail page → rating → social post creation

\- Populating skeleton components with actual functionality

\- Working around Spotify API deprecations for the analytics pipeline



---



\## Planned (not yet built)

\- Recommender system v1:

&nbsp; - Collaborative filtering from pure user rating data

&nbsp; - Similarity scoring (user-user via cosine similarity, item-item)

&nbsp; - Cold-start strategy using genre tags and metadata (not audio features)

&nbsp; - Explainable recommendations (why this was recommended)

\- Social layer:

&nbsp; - Friend graph / following

&nbsp; - Compatibility ("resona-te score") via taste vector comparison

&nbsp; - Discussion and lightweight "taste profile" sharing

\- Analytics dashboards:

&nbsp; - Personal taste vectors and uniqueness scores

&nbsp; - Trends over time

&nbsp; - Artist/genre clustering visualizations

\- Deployment (to resolve localhost-specific OAuth callback issues)



---



\## High-Level Architecture



1\. \*\*Ingestion / Data Layer\*\*

&nbsp;  - Ratings, metadata from Spotify catalog API

&nbsp;  - Normalize on Spotify IDs, avoid duplication

&nbsp;  - Clean relational model with proper indexes and constraints



2\. \*\*Core Product Layer\*\*

&nbsp;  - User profiles, ratings UX, discovery feed

&nbsp;  - Auth/session handling (NextAuth v5)

&nbsp;  - API routes that enforce validation and permissions



3\. \*\*Analytics Layer\*\*

&nbsp;  - Feature building from ratings + genre/tag metadata

&nbsp;  - Similarity + recommendation logic (cosine similarity, matrix factorization)

&nbsp;  - Offline evaluation + iteration

&nbsp;  - Prefer explainable outputs for user trust

&nbsp;  - Tools: Python, NumPy, scikit-learn, pgvector for similarity matching



4\. \*\*Social Layer\*\*

&nbsp;  - Connections, compatibility, shared taste views

&nbsp;  - Avoid "black box" scoring — provide reasons



---



\## Design Principles

\- Product clarity > clever algorithms

\- Data modeling correctness first (constraints, uniqueness, indexes)

\- Reproducibility in analytics (saved configs, deterministic evaluation)

\- Explainable recommendations whenever possible

\- Avoid tight coupling between Next.js app and analytics experiments

\- Build incrementally; prefer small shipped improvements



---



\## Explicit Don'ts

\- \*\*Do NOT install new dependencies\*\* without explaining why they're needed and what alternatives exist.

\- \*\*Do NOT create new API routes\*\* without confirming the endpoint design and URL structure first.

\- \*\*Do NOT use `localStorage` or `sessionStorage`\*\* for data that belongs in the database.

\- \*\*Do NOT use Spotify's `audio-features` or `audio-analysis` endpoints\*\* — they are unavailable.

\- \*\*Do NOT refactor working code\*\* unless there is a clear correctness, performance, or maintainability reason.

\- \*\*Do NOT implement large features end-to-end\*\* unless explicitly asked — propose a plan first.

\- \*\*Do NOT skip TypeScript types\*\* — define interfaces for API responses, component props, and shared data shapes.



---



\## Performance / Scalability Notes

\- Expect growth in ratings volume and similarity computations

\- Favor precomputation (offline jobs) over heavy real-time compute

\- Cache expensive derived artifacts (taste vectors, similarity matrices)

\- Ensure DB queries are indexed and measured (avoid N+1 patterns)



---



\## Safety / Privacy Expectations

\- Never commit secrets (API keys, tokens, `.env` contents)

\- OAuth flows should be robust and least-privilege

\- Be cautious with user data exposure in social features

\- Prefer clear user controls for sharing and visibility



---



\## Guidance for AI Coding Assistants

When helping with this repo:

\- Teach concepts and reasoning, don't just generate solutions

\- Explain the WHY before the HOW

\- Propose small, testable changes

\- If multiple approaches exist, outline tradeoffs

\- Don't refactor working code unless the benefit is meaningful

\- Respect incremental development; don't jump ahead

\- If unsure about current schema or feature state, ask first

\- Reference existing model and file names exactly — don't invent new ones without discussion

