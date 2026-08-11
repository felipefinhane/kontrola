---
status: accepted
---

# Field-level encryption covers free text only, with a server-managed key

Transaction `description` and `obs` (free text — who/what a payment was for) are encrypted at the field level. `amount`, `date`, and `category` are left in plaintext, so balance totals and category reports can still be computed with SQL `SUM`/`GROUP BY` directly in Postgres. Encrypting `amount` too would force every report and the Balance calculation itself to fetch and decrypt every row in application code — workable at personal-finance transaction volumes, but a real cost we chose not to pay for the privacy gain it buys.

The encryption key is managed server-side (an environment secret for now, a proper secrets manager later), not derived from the user's password. A zero-knowledge scheme would mean losing your password means losing your data permanently, and would block server-side automation (recurring-template suggestions, inactivity reminders) from reading transaction content. Server-managed key protects against the realistic threat here — a database dump leaking — without either of those costs.

**Considered and rejected**: encrypting `amount`/`date` too, and a password-derived key — both rejected for the reasons above, not because they're bad ideas in general.
