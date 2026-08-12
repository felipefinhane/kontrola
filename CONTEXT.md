# Kontrola

A personal finance tracker. Starts as a single-user bank-account ledger, growing toward credit card tracking and shared accounts between people.

## Language

**User**:
A person with a login in Kontrola. Owns Accounts and Transactions.

**Account**:
A bank account (checking/savings) tracked in Kontrola, denominated in one Currency. Holds a Balance, always derived from its `actual` Transactions. Owned by one User, and may be shared with other Users via AccountMember.
_Avoid_: Wallet, Bank (the bank itself is never modeled — only the accounts held there).

**Currency**:
The unit an Account's Balance and Transactions are denominated in (e.g. BRL, USD), set once when the Account is created. Kontrola never auto-converts between currencies — a User with Accounts in more than one Currency sees one Balance subtotal per Currency, never a single blended total (see [ADR-0007](./docs/adr/0007-no-currency-conversion.md)).
_Avoid_: Treating Currency as a User-level setting — it belongs to the Account. A User's "default currency" is only a preference for pre-filling new Accounts, not a conversion target.

**CreditCard**:
A credit card, tracked separately from Account. Has a statement cycle, due date, and limit instead of a running Balance. Not built until v2.
_Avoid_: Treating a credit card as an Account type — its lifecycle doesn't fit the Account/Balance/Transaction shape.

**AccountMember**:
A User granted access to a shared Account, distinct from the Account's owner. Sharing is per-Account — there is no grouping entity that bundles several Accounts under one share.
_Avoid_: Household, Group (considered and rejected — see [ADR-0005](./docs/adr/0005-sharing-is-per-account.md)).

**Transaction**:
A single financial movement on an Account, with a `status` of `planned` or `actual`. Only `actual` Transactions count toward the Account's Balance. A `planned` Transaction becomes `actual` in place (same row, status flips) when confirmed.
_Avoid_: Lançamento, Entry, Movement, PlannedTransaction (there is no separate entity for forecasts — see [ADR-0004](./docs/adr/0004-transaction-status-not-separate-entity.md)).

**Direction**:
Whether a Transaction increases (`credit`) or decreases (`debit`) its Account's Balance.
_Avoid_: OP, C/D (the source spreadsheet's column name — retired).

**Balance**:
The current amount in an Account, in the Account's own Currency. Always computed by summing the Account's `actual` Transactions — never stored as a typed-in value.
_Avoid_: Saldo.

**Category**:
A label on a Transaction used for reporting. Comes from a system-defined default set, or created by the User.
_Avoid_: Tag (a Tag would be free-form; Category is the fixed/curated concept — Kontrola only has the latter for now).

**RecurringTemplate**:
A definition of a Transaction that repeats on a schedule (e.g. monthly rent). Generates a `planned` Transaction each cycle for the User to confirm. Has a `frequency` (Weekly, Monthly, Quarterly, Semi-Annual, or Annual — see [ADR-0008](./docs/adr/0008-recurring-template-scope.md)) and an `is_estimated` flag: when `true`, the generated amount is a best guess (e.g. a utility bill that varies) rather than an exact figure, and the UI marks it as such (e.g. "~R$ 120 (Est.)") — the User is still expected to adjust the amount when confirming.
_Avoid_: "Recurring transaction" as a single concept — the template and the Transactions it generates are different things. Avoid a free-form "repeat every N days" interval — see ADR-0008 for why a fixed frequency catalog was chosen instead.

**PushSubscription**:
A single browser/device's registration for push notifications (the endpoint URL and keys the Web Push API needs to deliver to it). A User can have more than one — installing the PWA on a second device creates another PushSubscription, it doesn't replace the first. Notifications (recurring confirmations, inactivity reminders) get sent to every PushSubscription a User has.
_Avoid_: Treating notification delivery as a single per-User setting — see ADR-0010 for how these get triggered.
