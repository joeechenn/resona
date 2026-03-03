# Resona
A music social discovery app where every opinion gets put out there. Built from the ground up as a portfolio project exploring full-stack development and social product design.

## What Is This?
Resona is a social platform for music ratings. The core idea is simple: people shouldn't be afraid of their opinions. You rate a track, album, or artist on a 0–10 scale and that rating is automatically posted to your feed. No curation, no separate sharing step. Your taste is your content.

The app pulls from Spotify's full catalog so you can find and rate anything.

To learn more about the vision, visit [this](https://joeechenn.github.io/resona/).

## What's Implemented

**Rating System**: A unified `/api/rate` endpoint handles tracks, albums, and artists. When you rate something, the system finds or creates the entity from Spotify data, stores the rating, and generates a social post automatically. Every rating becomes content.

**Social Feed**: A live feed of ratings from you and the people you follow. Each post surfaces the rated item, the score, and relevant metadata. The feed is built with nested Prisma relations to keep queries efficient.

**Spotify Search**: Search integration against Spotify's catalog. Results are returned in real time as you type and flow directly into the rating modal.

## What's Next
- Follow system and friend activity panels
- Comments and likes on posts
- Artist and album detail pages with full discography views
- Deeper personal stats and listening trends over time
- Spotify OAuth for personalized listening data and recommendations

## Tech Stack
Next.js, TypeScript, Prisma ORM, PostgreSQL (NeonDB), TailwindCSS

*Resona is currently in active development as a portfolio project.*
