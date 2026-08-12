---
status: accepted
---

# Vercel Cron Jobs trigger the scheduled work, not a separate queue/worker

Two things need to run on their own, without a User opening the app: generating a `planned` Transaction from each due `RecurringTemplate` (v1.1), and checking who's gone quiet long enough to deserve an inactivity nudge (MVP). Both run as Vercel Cron Jobs calling an API route on a schedule (`vercel.json`'s `crons` field), not a separate queue or external scheduler.

No extra infrastructure to run or pay for, and it fits the app's actual scale — these are daily, not high-frequency, jobs. `docs/adr/0001-neon-over-supabase.md` already committed to Vercel as the deploy target, so this is the same platform, not a new dependency.

**Considered and rejected**: an external cron service or a queue (e.g. a hosted Redis/queue product) triggering a webhook. More observability and retry control, but that's infrastructure this app doesn't need yet — daily jobs with no other consumers don't justify it. Worth revisiting only if job volume or latency requirements actually change.

**Not implemented yet**: this ADR records the mechanism, not the jobs themselves — `RecurringTemplate` generation is v1.1, still ahead in the roadmap (docs/analise-inicial.md), and the inactivity check needs `PushSubscription` (CONTEXT.md, this same grilling round) wired up first. No `vercel.json` or `/api/cron/*` routes exist yet.
