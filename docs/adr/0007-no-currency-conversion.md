---
status: accepted
---

# Multi-currency Accounts show grouped totals, never auto-converted

Kontrola supports Accounts in different Currencies (e.g. a BRL checking account and a USD savings account). The aggregate balance view groups totals by Currency — "R$ 23.218,77" and "US$ 1.200,00" shown side by side — rather than converting everything into one blended number.

Converting would need a live exchange-rate source (e.g. [Frankfurter](https://frankfurter.dev/), free and keyless, ECB daily rates) and a decision about which rate a past Transaction should use for historical reports — the rate on its own date (accurate, more complex) or today's rate applied to everything (simpler, but a "closed" month's total would silently drift every time you look at it). Grouping sidesteps both problems: no external dependency, and every number shown is always exact.

**Considered and rejected**: converting to a single blended total. Worth revisiting once multi-currency use is real rather than hypothetical — today's data is 100% BRL. If it happens, it can be added as an *additional* "estimated total" view rather than replacing the grouped one.
