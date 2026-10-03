# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js App Router, TypeScript, Tailwind CSS, Supabase, server-side RAWG provider abstraction, Zod, React Hook Form, and Motion, as required by Gaming Tracker Codex Docs. No deployment target specified.

## Users

Inferred from the supplied product documents: gamers who want to discover modern and classic games and keep a personal record of what they want to play, are playing, have completed, paused, or dropped.

## Product Purpose

Inferred from the supplied product documents: GameVault combines external game catalog metadata with private personal library, progress, rating, favorite, and profile data. Success is the documented flow from discovering PS2 or PS3 games through recording them in a persistent personal library and seeing those records reflected on a profile.

## Capabilities and Constraints

Inferred from the supplied product documents: email/password authentication; game discovery and detail/media pages; the six specified library statuses; independent nullable 1–10 ratings across gameplay, story, graphics, sound, and overall; favorites; manually entered notes, dates, and playtime; and profile XP/stats. PS2 and PS3 are first-class. Supabase stores user-owned data under RLS; RAWG is called server-side behind a normalized provider interface. No console account synchronization or automated trophy synchronization is claimed. Missing credentials must produce honest unavailable/error states, not fabricated catalog results.

## Evidence on Hand

Supplied product specifications are in `Gaming Tracker Codex Docs/`. No verified production catalog data, API credentials, brand assets, customer claims, or deployment details were present at project initialization. The discovery interview could not receive a human answer in this delegated session; the facts above are inferred only from the supplied documents.

## Product Principles

- Keep personal game data private and user-controlled.
- Make classic platforms as discoverable as modern platforms.
- Keep each rating dimension independent and manually controlled.
- Show only real provider data or clearly explain when it is unavailable.
- Make library progress useful across devices and accessible controls.

## Accessibility & Inclusion

Inferred from the supplied UX requirements: responsive mobile, tablet, and desktop layouts; keyboard accessible controls and visible focus; readable contrast; reduced-motion support; and usable empty, loading, and error states.
