# Diary App

**A contextual journaling tool built around the question: what would journaling look like if it actually knew you?**

[Live App](https://diary-app-azure.vercel.app)

## The Problem

Most journaling apps are blank pages. They offer no context, no connections, and no reason to come back. The longer you use them, the more entries you have — but the experience doesn't get richer. There's no compounding value.

Diary App explores what happens when you layer real context (mood, time, media, astrology, temporal awareness) into the journaling experience so that sustained use is actually rewarded.

## Key Features and the Thinking Behind Them

**Birth Chart Engine**
Uses real astronomical calculations (not lookup tables) to compute accurate natal charts from birth time and location. This was a deliberate technical decision — accuracy matters for users who take this seriously, and cutting corners here would undermine trust.

**Moon-Phase-Aware Writing Prompts**
Journaling prompts shift with the lunar cycle. The insight is that temporal context can meaningfully shape UX — not every day should feel the same in a reflective tool.

**Time Capsule Letters**
Write letters to your future self that stay sealed until their reveal date. This is a retention mechanic disguised as a feature. It gives users a reason to come back on a specific date, creating natural re-engagement without push notifications.

**Media Tracker**
Links books, shows, and music to journal entries. Over time, this builds a map of what you were consuming alongside how you were feeling — the kind of connection most journaling tools never surface.

## Product Thinking

The core design principle was building compounding value: the longer you use it, the richer the experience gets. Every feature was evaluated through the lens of "does this make the 100th entry more valuable than the 10th?"

The time capsule mechanic is the best example. It's delightful on its own, but it's also a retention strategy. Users create future touchpoints with the product every time they write one.

## Stack

Next.js 16 · TypeScript · Supabase · React · Vercel

---

Built by [Rachel McCarthy](https://rachelmccarthy.io)
