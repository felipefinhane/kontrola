---
status: accepted
---

# Transaction carries a status instead of a separate PlannedTransaction entity

The source spreadsheet's forecast months (projected transactions for future months) and its real entries share the exact same shape — description, amount, date, direction. Rather than a separate `PlannedTransaction` entity, a forecast is a `Transaction` with `status: planned`; confirming it flips the same row to `status: actual`.

This was a deliberate deviation from the initially-recommended split (a separate entity was proposed specifically to make it structurally impossible for a forecast to leak into a real balance or report). The mitigation: `Balance` is defined to only ever sum `actual` Transactions (see [CONTEXT.md](../../CONTEXT.md)) — every query that reports spending or balance must filter on status, with no exception. A future reader should not "simplify" this by dropping the status filter.
