---
status: accepted
---

# Sharing (v3) is per-Account, not via a Household/Group entity

When Kontrola opens up to more than one user managing the same money, an Account gets shared directly with another User (an `AccountMember`) — there is no `Household`/`Group` entity that bundles multiple Accounts under a single share.

A grouping entity was considered, since it would let one invite cover several Accounts at once (e.g. a couple's checking account plus a joint card) instead of inviting per Account. It was rejected in favor of the more granular per-Account model. This is a scope decision worth remembering because it is the more surprising of the two options — most "shared finances" products default to a household concept.
