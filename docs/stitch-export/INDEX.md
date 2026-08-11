# Export do Google Stitch — índice

HTML/CSS (Tailwind) exportado do projeto Kontrola no Stitch, salvo aqui pra consulta durante a implementação. Numeração bate com `../stitch-prompt.md`.

O export original trazia **duas versões de várias telas** (antes e depois do Prompt de Atualização de moeda/idioma/tema) — os comentários HTML do próprio Stitch também vieram fora de ordem em vários blocos (o comentário não batia com o `<title>` real). Cada arquivo abaixo tem uma nota no topo quando isso aconteceu. Só a versão **mais recente** de cada tela foi mantida na numeração principal; as versões antigas foram pra `superseded/`.

## Telas MVP

| Arquivo | Tela |
|---|---|
| `01-onboarding.html` | Onboarding / Welcome |
| `02-sign-up.html` | Sign Up |
| `03-log-in.html` | Log In |
| `03b-forgot-password.html` | Forgot Password *(extra, não estava no prompt original — o Stitch gerou a partir do link "Forgot password?" da tela de Log In)* |
| `04-home-dashboard.html` | Home / Dashboard — **correto**: agrupa por moeda (R$/US$ lado a lado), não soma |
| `05-add-edit-transaction.html` | Add / Edit Transaction |
| `06-transactions-list.html` | Transactions List |
| `07-accounts-list.html` | Accounts List — ⚠️ ver bug abaixo |
| `08-account-detail.html` | Account Detail |
| `09-add-account.html` | Add Account |
| `10-categories.html` | Categories |
| `11-planned-view.html` | Planned view |
| `12-notification-settings.html` | Notification settings |
| `13-accounts-empty-state.html` | Accounts empty state |
| `14-settings.html` | Settings — idioma (EN/PT-BR), tema (Light/Dark/System), moeda padrão |
| `14b-change-password.html` | Change Password *(extra, não estava no prompt original — o Stitch gerou a partir da linha "Change Password" da tela de Settings)* |

## v1.1 — Recorrência

| Arquivo | Tela |
|---|---|
| `15-recurring-list.html` | Lista de recorrências |
| `16-confirm-recurring.html` | Confirmar recorrência |

## ⚠️ Inconsistências encontradas (revisão pós-export)

1. **Card "Total Net Worth" da tela de Contas** (`07-accounts-list.html`) ainda soma tudo num número só (`€42,850`), em vez de agrupar por moeda como a Home (`04-home-dashboard.html`) já faz corretamente — viola a [ADR-0007](../adr/0007-no-currency-conversion.md).
2. **Nome do card inconsistente**: Home chama de "Total Balance", Contas chama de "Total Net Worth" — mesmo conceito, dois termos, e "Net Worth" não é um termo do `CONTEXT.md`.
3. **Bancos fictícios fora do contexto**: Home, Contas e Account Detail usam "Chase Bank", "Ally Bank", "Nordea Bank", "Revolut", "Amex" — só a tela "Adicionar Conta" usa bancos brasileiros reais (Nubank, Itaú, Bradesco).

Prompt de correção pra colar no Stitch (cobre os três pontos de uma vez):

```
Two consistency fixes across the app, all using the same design system already established.

1. ACCOUNTS SCREEN — TOTAL CARD: The "Total Net Worth" card still shows one blended total (€42,850). Fix it to match the Home screen's behavior exactly: if all accounts share one currency, show one total; if there's more than one currency, show one subtotal per currency side by side, never summed together. Rename the card from "Total Net Worth" to "Total Balance" to match the Home screen's wording. The "+€1,240 this month" trend line below it has the same blending problem — either make it per-currency too, or remove it for now until it can be computed correctly per currency.

2. BANK NAMES — CONSISTENCY: Several screens use placeholder international bank names (Chase Bank, Ally Bank, Nordea Bank, Revolut, Amex) that don't match the target user (Brazil, BRL as the default currency). Replace these with Brazilian bank names, consistent with the Add Account screen's quick-picks: Itaú, Nubank, Bradesco, C6 Bank, XP. Apply this on the Home, Accounts List, and Account Detail screens.
```

## `superseded/` — versões substituídas (só arquivo, não usar)

- `account-detail.old.html` — sem selo de moeda
- `accounts-list.old.html` — sem selo de moeda nos cards (o card "Total Net Worth" já vinha errado desde essa versão)

(As versões antigas de Home/Dashboard, Add/Edit Transaction e Settings não foram guardadas separadamente — eram redundantes o suficiente com as canônicas pra não valer o espaço; se precisar delas de novo, dá pra gerar de novo no Stitch a partir do `stitch-prompt.md`.)
