# AI-Powered Coding Interview Coach

## Project Overview
A web app that simulates real FAANG technical interviews for college students. The AI acts as a senior engineer interviewer, asks questions, follows up, and gives a scorecard at the end.

## Tech Stack
- **Framework**: Next.js (React + API routes)
- **AI**: Claude API (`claude-opus-4-6`)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Core Features
1. **Interview Setup** — pick category (DSA / System Design / Behavioral), difficulty (Easy / Medium / Hard), and company (Google / Meta / Amazon / Apple / Netflix)
2. **Chat-based Interview** — conversational back-and-forth with the AI interviewer
3. **Scorecard** — after the interview, AI gives ratings on Problem Solving, Communication, Code Quality, and an overall FAANG-style hire decision

## Project Structure
```
app/
  page.tsx                  ← Landing/setup page
  interview/page.tsx        ← Chat UI
  results/page.tsx          ← Scorecard
  api/chat/route.ts         ← Claude API endpoint
components/
  InterviewSetup.tsx
  ChatBubble.tsx
  ScoreCard.tsx
lib/
  prompts.ts                ← System prompts
.env.local                  ← ANTHROPIC_API_KEY
```

## Build Order
1. Scaffold Next.js + Tailwind, build landing/setup page
2. Build chat UI (messages, input, send)
3. Wire up Claude API
4. Add scorecard/results page

## Key Instructions for Claude
- Use `claude-opus-4-6` as the model
- Keep components simple and focused
- The system prompt lives in `lib/prompts.ts`
- API key goes in `.env.local` as `ANTHROPIC_API_KEY`
- Do not over-engineer — MVP first
