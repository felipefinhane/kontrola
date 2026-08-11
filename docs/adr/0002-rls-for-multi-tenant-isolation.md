---
status: accepted
---

# Enforce multi-tenant isolation with Postgres RLS, not app-level filtering alone

The schema is multi-tenant from day one, even with a single real user today, to avoid a risky data migration later when sharing ships. Given that, isolation between users needs to be more than "every query remembers to filter by `user_id`" — one missed filter in a future query is a data leak between users.

We enforce isolation with Postgres Row Level Security: each request sets a session-local variable (`SET LOCAL app.user_id = ...` inside the transaction), and RLS policies reference it via `current_setting()`. Supabase gives this for free via `auth.uid()`; on Neon we wire it up ourselves in the query layer.

**Considered and rejected**: app-level-only filtering via a central repository — faster to build, but leaves isolation entirely dependent on every future query author remembering the filter, with no backstop from the database itself.
