---
status: accepted
---

# RecurringTemplate: fixed frequency catalog, plus an "estimated amount" flag

`RecurringTemplate.frequency` is one of a fixed catalog — Weekly, Monthly, Quarterly, Semi-Annual, Annual — rather than a free-form "repeat every N days/weeks/months" interval. The catalog covers every case seen so far (rent/utilities monthly, tuition semi-annual) with a simple dropdown, and avoids the edge cases a fully generic interval would introduce (arbitrary day counts, ambiguous month-end rollovers) for a feature where the real-world need is a handful of common cadences, not arbitrary scheduling.

`RecurringTemplate` also carries an `is_estimated` boolean. When `true`, the generated `planned` Transaction is flagged in the UI (e.g. "~R$ 120 (Est.)") to signal the amount is a guess — typical of variable bills like electricity — rather than an exact figure like rent. This doesn't change the confirmation flow: the amount field there is already editable, so `is_estimated` is purely a UI signal set on the template, not a new interaction.

**Considered and rejected**: a fully generic "every N days" interval — more flexible, but the added complexity (validation, display, edge cases) isn't justified by any real recurring bill in the source spreadsheet.
