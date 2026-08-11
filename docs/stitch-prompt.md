# Prompts para o Google Stitch — Kontrola

> Como usar: cole o **Prompt Mestre** primeiro (ele já pede o app inteiro + as telas mais essenciais do MVP num único disparo — o Stitch consegue gerar várias telas de uma vez a partir de um prompt bem detalhado). Depois, um por vez, vá colando os prompts da seção **Telas adicionais do MVP** e, quando chegar a hora de cada fase futura, os prompts marcados como **v1.1 / v1.2 / v2 / v3** — não precisa gerar tudo de uma vez, é só usar quando for a fase certa.
>
> Todo o texto dos prompts está em inglês de propósito — é o idioma que travamos pra UI/código do Kontrola (ver [`CONTEXT.md`](../CONTEXT.md)), então já sai com a copy certa. Isso não conflita com o app ter EN + PT-BR como idiomas de verdade depois — os mockups só precisam mostrar texto em uma língua; a tradução em si é trabalho de implementação (i18n), não de layout.
>
> **Se você já gerou o Prompt Mestre antes desta atualização**: não precisa recomeçar do zero — cole o **Prompt de Atualização** logo abaixo no mesmo chat/projeto do Stitch, que ele reaproveita o que já existe e só ajusta o que mudou.
>
> Depois que o Stitch gerar o resultado, exporta o HTML/CSS (ou o link do projeto) e a gente usa como referência real de layout pra implementar no Next.js.

---

## Prompt de Atualização (cole no chat do projeto já existente no Stitch)

```
I'm updating the Kontrola app with a new concept: Accounts now have a Currency (e.g. BRL, USD). Revise the existing screens below and add one new screen, all using the same design system (colors, typography, spacing, and the dashed/outline "planned" treatment) already established in this project. Keep every other screen exactly as already generated — this is a refinement, not a redesign.

REVISE these existing screens:

1. HOME / DASHBOARD — Change the top balance area: if every account shares the same currency, keep one large prominent total. If accounts span more than one currency, show one subtotal per currency instead, side by side (e.g. "R$ 23.218,77" and "US$ 1.200,00") — never blend different currencies into a single number. Also add the currency to each account card in the horizontally scrollable row.

2. ACCOUNTS LIST — Add the currency to each account card, alongside bank name, nickname, and balance.

3. ACCOUNT DETAIL — Add the currency to the header, next to account name and bank.

4. ADD / EDIT TRANSACTION — The amount input should be formatted in the transaction's account currency.

5. SETTINGS / PROFILE — Replace the language control entirely: it currently shows only "English" as a placeholder; now show two fully real, selectable options — "English" and "Português (Brasil)" — as a segmented control or list with a clear selected state. Add a new Theme control with three options: "Light", "Dark", "System" (same selectable treatment, "System" marked as the default). Add a new "Default currency" row (e.g. "BRL — Brazilian Real" with a chevron to change it), used to pre-fill currency when adding a new account. Keep the existing Security section (change password, log out) and Data section (Export my data) exactly as they are.

ADD this new screen:

6. ADD ACCOUNT — fields for account nickname (text), bank name (text or picker of common Brazilian banks), currency (dropdown of currency codes — BRL, USD, EUR — pre-selected to the user's default currency preference from Settings), and opening balance (numeric input, formatted per the chosen currency). Primary "Save Account" button fixed at the bottom.
```

---

## Prompt Mestre (cole se ainda não gerou nada no Stitch)

```
Design a mobile-first Progressive Web App called "Kontrola" — a calm, judgment-free personal finance tracker for a single person's bank account, evolving into shared/family finances later. Platform: Mobile (PWA), portrait, thumb-reach friendly, installable to home screen on iOS and Android.

TARGET USER & MOOD
The user previously tracked finances in a spreadsheet for over a year, then abandoned it for years out of friction and forgetfulness — this is not a power-user finance nerd, it's someone who needs the app to feel light, fast, and forgiving, never shaming about money. The emotional goal is "calm control", not "urgent alert". Avoid aggressive fintech clichés (neon greens, hard reds, dense data-heavy dashboards). Favor generous white space, soft rounded corners (12-16px), soft shadows, and a friendly but professional tone — closer to a wellness/habit app than a trading terminal.

COLOR PALETTE (design tokens — establish these and reuse consistently across every screen)
- Primary (brand, navigation, primary buttons): deep indigo-blue, around #1E3A5F, conveying stability and trust
- Primary-light (backgrounds, selected states in light mode): a soft tint of the primary, around #EAF1F8
- Accent (positive actions, credit/income, confirmations, FAB): warm emerald/teal, around #2DB88A
- Semantic debit/expense: muted coral-red, around #E2685E — deliberately softer than a typical alarm red, avoid pure #FF0000-style aggression
- Semantic planned/forecast: neutral amber-gray, around #C9A15A, always paired with a dashed border or outline style (never filled solid) to visually distinguish "planned" from "actual" transactions
- Neutrals: warm off-white background #FAF9F6 and near-charcoal text #232323 for light mode; deep navy-charcoal background #12181F and warm off-white text #F5F3EE for dark mode
- Success/confirmation: same as Accent emerald
- Support both a light mode and a dark mode; dark mode is equally important since this is used at night/on the go

TYPOGRAPHY
A clean geometric sans-serif (something like Inter or Manrope). Large, confident numerals for money amounts (tabular figures, no ambiguity between 1 and l). Clear hierarchy: big balance numbers, medium section headers, small metadata (dates, categories).

NAVIGATION SHAPE
Bottom tab bar with 4-5 items reachable by thumb: Home, Transactions, Accounts, (Recurring — placeholder tab, can be disabled/locked look for now), Settings. A prominent circular Floating Action Button (+) above the tab bar, center-right, for quick-adding a transaction from anywhere.

CORE DOMAIN VOCABULARY (use this exact language in the UI copy)
- "Account" = a bank account, denominated in one Currency (e.g. BRL, USD — set when the account is created), shows a running "Balance" in that currency
- "Transaction" = a single money movement, has a "Direction" (Credit increases balance / Debit decreases it) and a "Status" (Actual = already happened, counts toward Balance; Planned = forecast, shown separately, never counted in Balance, always styled with the dashed/outline "planned" treatment)
- "Category" = a label on a transaction (e.g. Housing, Food, Transport, Health, Education, Subscriptions, Income, Transfer, Other)

GENERATE THESE SCREENS NOW (same visual system across all of them):

1. ONBOARDING / WELCOME — Single screen, Kontrola logo/wordmark, one calm sentence of value proposition ("Track your money without the guilt or the spreadsheet."), primary button "Get Started", secondary link "I already have an account". On this same screen (or a second onboarding step) include a friendly illustrated callout for iOS users: "Add Kontrola to your Home Screen to enable reminders" with a small Share-icon → Add to Home Screen visual hint.

2. SIGN UP — Email + password fields, password strength hint, primary CTA "Create account", link to Log In, minimal and trustworthy (small lock icon near the form to reinforce security).

3. LOG IN — Email + password, "Forgot password?" link, primary CTA "Log In", link to Sign Up.

4. HOME / DASHBOARD — Top: aggregate balance. If every account shares the same currency, show one large prominent total. If accounts span more than one currency, show one subtotal per currency instead, side by side (e.g. "R$ 23.218,77" and "US$ 1.200,00") — never blend different currencies into a single number. Below it: a horizontally scrollable row of account cards, each showing account name, bank, currency, and its own balance. Below that: a "Recent Transactions" list (last 5-10 actual transactions, each row showing category icon, description, account, date, and signed amount — green for credit, coral for debit). If there are no transactions yet, show a friendly empty state illustration with a "Add your first transaction" CTA. Include the bottom tab bar and the floating + button.

5. ADD / EDIT TRANSACTION — Designed for one-handed thumb use, feels fast (2-3 taps to save). Large amount input at the top with a big numeric keypad, formatted in the transaction's account currency. A segmented control to toggle Credit/Debit. Fields below: description (text), account (dropdown/picker), category (icon grid picker), date (defaults to today, easy to change). Primary "Save" button fixed at the bottom, always reachable by thumb.

6. TRANSACTIONS LIST — Full list of transactions grouped by date (Today, Yesterday, "August 2026", etc.), with filter chips at the top (Account, Category, Status: Actual/Planned). Planned transactions in this list use the dashed/outline amber treatment, clearly visually distinct from actual ones.

7. ACCOUNTS LIST — Card-based list of all accounts, each card shows bank name, account nickname, currency, current balance, and a small sparkline or trend indicator. A "+ Add Account" card/button at the end.

8. ACCOUNT DETAIL — Header with account name, bank, currency, large balance. Below: that account's own transaction list, same date-grouped style as screen 6, but scoped to this account only.

Keep spacing, corner radius, color usage, and typography perfectly consistent across all 8 screens — they must read as one coherent design system, not 8 separate designs.
```

---

## Telas adicionais do MVP (gere uma a uma, depois do Prompt Mestre)

### 9. Adicionar conta

```
Using the same Kontrola design system, design an "Add Account" screen: fields for account nickname (text), bank name (text or picker of common Brazilian banks), currency (dropdown of common currency codes — BRL, USD, EUR — pre-selected to the user's default currency preference), and opening balance (numeric input, formatted per the chosen currency). Primary "Save Account" button fixed at the bottom.
```

### 10. Categorias

```
Using the same Kontrola design system (colors, typography, spacing) established so far, design a "Categories" screen: a grid of category chips/cards, each with an icon and name (Housing, Food, Transport, Health, Education, Subscriptions, Income, Transfer, Other, ...), showing a small count or total spent this month per category. A "+ Add custom category" card at the end, opening a simple form (name, icon picker, color picker constrained to the app's palette).
```

### 11. Previsão / Planned view

```
Using the same Kontrola design system, design a "Planned" screen (accessible from Transactions via a tab or toggle) listing only Status=Planned transactions — future/forecast entries the user projected. Every row uses the dashed/outline amber "planned" treatment from the design tokens. Include a clear, friendly banner at the top explaining "Planned transactions don't count toward your balance yet" and, per row, a quick action to "Confirm" (which would flip it to Actual).
```

### 12. Configurações de notificação

```
Using the same Kontrola design system, design a "Notifications" settings screen: a toggle to enable push notifications (with a short explanation of why — "so you don't lose the habit like last time"), a simple frequency/threshold control for "remind me if I haven't logged anything in ___ days" (e.g. a stepper or slider, default 3 days), and, for iOS users specifically, a status indicator showing whether the app is installed to the Home Screen (required for push to work), with a "How to install" link if not.
```

### 13. Estado vazio — sem contas ainda

```
Using the same Kontrola design system, design the empty state for the Accounts screen when the user has no accounts yet: friendly illustration, one reassuring sentence ("Add your first account to start tracking — it only takes a minute"), and a clear primary CTA "Add Account".
```

### 14. Configurações / Perfil

```
Using the same Kontrola design system, design a "Settings" screen: user avatar/initials, name and email at the top, then grouped list-style sections with icons:

- "Preferences" section: a Language control showing two real options side by side or as a segmented control — "English" and "Português (Brasil)" — with the current selection clearly marked (not a placeholder, both must look fully selectable); a Theme control with three options — "Light", "Dark", "System" — same segmented/selectable treatment, "System" marked as the default; a "Default currency" row (e.g. showing "BRL — Brazilian Real" with a chevron to change it) used to pre-fill the currency when adding a new account.
- "Security" section: change password, log out.
- "Data" section: "Export my data" action.

Calm, minimal list-style layout, grouped into clearly separated cards or sections with generous spacing.
```

---

## v1.1 — Recorrência (gerar quando chegar essa fase)

### 15. Lista de recorrências

```
Using the same Kontrola design system, design a "Recurring" screen: a list of recurring transaction templates (e.g. "Rent", "Electricity Bill", "School Tuition"), each card showing name, expected amount, account, category, and next expected date. A "+ Add Recurring" button.
```

### 16. Confirmação de recorrência (a partir da notificação push)

```
Using the same Kontrola design system, design a "Confirm Recurring Transaction" screen/modal, the destination when a user taps a push notification like "Rent — August is ready to confirm". Show the pre-filled transaction (amount, account, category, date) with all fields editable, and two clear actions: "Confirm" (primary, turns it into an Actual transaction) and "Skip this month" (secondary).
```

---

## v1.2 — Import de extrato (gerar quando chegar essa fase)

### 17. Importar transações

```
Using the same Kontrola design system, design an "Import Transactions" screen: a drop zone / upload button for an OFX or CSV bank statement file, a short explanation of supported formats, and, once a file is uploaded, a preview state showing "42 transactions found, 3 look like duplicates".
```

### 18. Revisar transações importadas

```
Using the same Kontrola design system, design a "Review Import" screen: a checklist-style list of the imported transactions, each row with a checkbox (pre-checked, uncheck to skip), editable category picker inline, and a highlighted "possible duplicate" badge on rows that match existing transactions. A sticky footer with "Import X transactions" primary button.
```

---

## v2 — Cartão de crédito (gerar quando chegar essa fase)

### 19. Lista de cartões

```
Using the same Kontrola design system, design a "Credit Cards" screen: card-style visual representations of each credit card (name, last 4 digits, brand-neutral card graphic using the app's palette), each showing current statement total and due date. A "+ Add Card" action.
```

### 20. Detalhe da fatura

```
Using the same Kontrola design system, design a "Statement Detail" screen for one credit card: header with due date, total amount, and a limit-usage progress bar (used vs. available credit). Below: an itemized list of charges for this statement cycle, each with merchant, category, and amount, grouped like the main transactions list.
```

---

## v3 — Compartilhamento (gerar quando chegar essa fase)

### 21. Compartilhar conta

```
Using the same Kontrola design system, design a "Share Account" screen: shows which account is being shared, an email input to invite someone, and a note explaining they'll be able to see and add transactions on this specific account only (not the user's other accounts).
```

### 22. Gerenciar membros da conta

```
Using the same Kontrola design system, design a "Manage Account Access" screen: a list of people who have access to this account (avatar, name/email, role badge "Owner" or "Member"), with a "Remove access" action per member, and the same "+ Invite" action from the previous screen.
```
