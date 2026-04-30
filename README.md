# RBI Grade B — Practice Dashboard v2

Timed MCQ practice aligned to RBI Grade B Phase 1 & 2 syllabus, with AI-generated questions, wrong-answer tracking, and comprehensive revision notes.

## What's New in v2
- ☀️ Light/Dark mode toggle
- ❌ Wrong Answers section — auto-saved, categorized by topic
- 📚 Expanded revision notes (100+ revision points across all subjects)
- 🧠 Smart question deduplication — tracks used questions to avoid repeats
- 📋 RBI syllabus-aligned question prompts with PYQ-style difficulty
- 🔍 GA questions focus on last 6 months current affairs

## Deploy to Vercel

```bash
cd rbi-grade-b
git init && git add . && git commit -m "v2"
git remote add origin https://github.com/jaankarihub15-cyber/rbi-grade-b.git
git push -u origin main
```

On Vercel: Import repo → Framework: Vite → Env var: `ANTHROPIC_API_KEY` → Deploy.

## Local Dev
```bash
npm install
cp .env.example .env.local
npm run dev
```
