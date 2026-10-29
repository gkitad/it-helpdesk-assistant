# Helpdesk Assistant

An AI triage assistant for an IT service desk. An employee describes a problem in plain words; the assistant turns it into a ticket with a priority, category, safe self-service troubleshooting steps and a handoff note for the technician who picks it up if the steps don't work.

**Live demo:** https://it-helpdesk-assistant-three.vercel.app/

Built by [Anthony Jaimez](https://portfolio-eosin-delta-24.vercel.app/), drawing on 5+ years of Tier 1 and Tier 2 enterprise support.

## How it works

1. **Retrieval.** The description is matched against a knowledge base of help desk runbooks (`src/kb/articles.ts`) using BM25 ranking (`src/lib/retrieve.ts`). Weak matches are dropped so unrelated articles don't leak into the answer.
2. **Triage.** The description and the matched runbooks go to Claude (`claude-haiku-5-5`) with structured outputs, so the response always fits a typed ticket schema (`src/lib/triage.ts`). The system prompt encodes service desk policy: no admin-only steps for end users, identity verification stays with technicians, and anything that looks like phishing or a compromised account becomes a P1 for Security.
3. **Resolution.** The user confirms whether the steps worked. The ticket either closes or escalates with the handoff note. Every ticket lands in a queue with resolution stats.

Citations are checked server-side: the ticket can only reference articles that were actually retrieved for it.

## Stack

- Next.js (App Router), React, TypeScript
- Claude API via `@anthropic-ai/sdk`, structured outputs with Zod
- BM25 retrieval implemented from scratch, no vector database
- Tickets stored in the browser (localStorage), so nothing persists on the server

## Running locally

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

To work on the UI without an API key, set `MOCK_TRIAGE=1` in `.env.local`; the API then returns tickets built straight from the matched runbook.

## Retrieval eval

```bash
npm run eval:retrieval
```

Runs sample tickets through retrieval and checks each one finds the expected runbook, including a non-IT request that should match nothing.

## Guardrails on the public demo

- Descriptions are capped at 1,500 characters.
- Each visitor is limited to 8 tickets per 10 minutes.
- The API key lives only on the server, and the Claude Console spend limit caps monthly cost.
