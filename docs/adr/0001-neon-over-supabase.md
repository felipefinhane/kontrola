---
status: accepted
---

# Use Neon (not Supabase) for Postgres, paired with Auth.js

Supabase bundles Postgres, Auth, and RLS helpers in one platform, which would mean less setup — but its free tier pauses a project after 7 days of inactivity and requires a manual "restore" click in the dashboard before it serves requests again ([source](https://supabase.com/docs/guides/platform/free-project-pausing)). Kontrola's own usage history (14 months of entries, then years of silence) is exactly the pattern that pause policy punishes hardest.

Neon's free tier scales its compute to zero after 5 minutes idle and wakes automatically on the next connection, in well under a second, with no manual step ([source](https://neon.com/faqs/cloud-postgres-services-scale-zero-data)). We picked Neon for that property, accepting the cost of wiring up Auth.js ourselves instead of getting Auth for free.

**Considered and rejected**: Supabase — better integrated, but the manual-restore-after-inactivity behavior is a direct fit for the exact failure mode this project is trying to solve.
