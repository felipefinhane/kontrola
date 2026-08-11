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

## ⚠️ Bug encontrado: `07-accounts-list.html`

O card "Total Net Worth" no topo da tela ainda soma tudo num número só (`€42,850`), em vez de agrupar por moeda como a Home (`04-home-dashboard.html`) já faz corretamente. Viola o [ADR-0007](../adr/0007-no-currency-conversion.md). Prompt de correção pra colar no Stitch:

```
On the Accounts screen, the "Total Net Worth" card still shows one blended total. Fix it to match the Home screen's behavior: if all accounts share one currency, show one total; if there's more than one currency, show one subtotal per currency side by side, never summed together.
```

## `superseded/` — versões substituídas (só arquivo, não usar)

- `account-detail.old.html` — sem selo de moeda
- `accounts-list.old.html` — sem selo de moeda nos cards (o card "Total Net Worth" já vinha errado desde essa versão)

(As versões antigas de Home/Dashboard, Add/Edit Transaction e Settings não foram guardadas separadamente — eram redundantes o suficiente com as canônicas pra não valer o espaço; se precisar delas de novo, dá pra gerar de novo no Stitch a partir do `stitch-prompt.md`.)
