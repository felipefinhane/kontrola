---
status: accepted
---

# Resend for the Forgot Password email, opaque tokens in a dedicated table

#16 was blocked on two decisions `docs/TASKS.md` deliberately left open: which email provider sends the reset link, and how a reset token gets issued/verified/consumed.

**Provider: Resend.** The common pick in the Vercel ecosystem this app already deploys to (ADR-0001), with a plain HTTP API (no SMTP setup) and a first-party SDK. Sending as `onboarding@resend.dev` (Resend's shared sandbox sender) for now, not a verified custom domain — no domain has been decided for this project yet, and the sandbox sender needs zero DNS setup to start working. Its real limitation: Resend only delivers sandbox-sender mail to the account owner's own verified address, not to arbitrary recipients — fine for developing and demoing the flow, not for real users yet. Swap `RESEND_FROM_EMAIL` in `.env` once a domain exists; nothing else about this ADR changes.

**Considered and rejected**: SendGrid, Postmark, SES — all reasonable, none has the specific "already on this stack" advantage Resend has here.

**Tokens: opaque random tokens, hashed at rest, in `password_reset_tokens`** (own migration, `0001_tidy_shinobi_shaw.sql`) — not a signed/stateless JWT.

A stateless token (e.g. HMAC-signed with a payload of `{userId, expiresAt}`) needs no storage and no schema change, but can't be single-use: anyone who intercepts the emailed link can replay it any number of times until it expires, and there's no way to revoke one early (a user requesting a second reset link can't invalidate the first). A stored, hashed, single-use token closes both gaps for the cost of one small table.

The table's RLS policies (`using: true` / `withCheck: true` for select/insert/update) mirror `users`' own login-lookup exception in `schema.ts` — this flow runs before any session exists, so there's no `app.user_id` to scope by yet, same reasoning as `users_select_for_login`. Only the *hash* is stored, never the raw token (same shape as `password_hash` never storing a plaintext password) — a row being broadly selectable is harmless, since it's only useful to someone who already has the matching raw token from the email itself.

**Flow**: `/forgot-password` always shows the same generic "check your email" message whether or not the address has an account — no user enumeration via response difference, same principle #2/#3 already apply to sign-up/login errors. A token is single-use (`usedAt` marks it consumed) and expires after 1 hour.
