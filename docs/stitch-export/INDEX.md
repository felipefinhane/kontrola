# Export do Google Stitch — índice

HTML/CSS (Tailwind) exportado do projeto Kontrola no Stitch, salvo aqui pra consulta durante a implementação. Numeração bate com `../stitch-prompt.md`. Só telas **mobile, modo claro** ficam na numeração principal — desktop e modo escuro foram deixados de fora por enquanto (ver seção final).

## Telas MVP

| Arquivo | Tela |
|---|---|
| `01-onboarding.html` | Onboarding / Welcome |
| `02-sign-up.html` | Sign Up |
| `03-log-in.html` | Log In |
| `03b-forgot-password.html` | Forgot Password *(bônus — o Stitch gerou a partir do link "Forgot password?" da tela de Log In)* |
| `04-home-dashboard.html` | Home / Dashboard — ✅ agrupa por moeda, bancos brasileiros, datas nas transações |
| `05-add-edit-transaction.html` | Add / Edit Transaction |
| `06-transactions-list.html` | Transactions List |
| `07-accounts-list.html` | Accounts List — ✅ "Total Balance" agrupado por moeda, bancos brasileiros |
| `08-account-detail.html` | Account Detail |
| `09-add-account.html` | Add Account |
| `10-categories.html` | Categories |
| `11-planned-view.html` | Planned view |
| `12-notification-settings.html` | Notification settings |
| `13-accounts-empty-state.html` | Accounts empty state |
| `14-settings.html` | Settings — idioma (EN/PT-BR), tema (Light/Dark/System), moeda padrão |
| `14b-change-password.html` | Change Password *(bônus — a partir da linha "Change Password" da tela de Settings)* |

## v1.1 — Recorrência

| Arquivo | Tela |
|---|---|
| `15-recurring-list.html` | Lista de recorrências |
| `16-confirm-recurring.html` | Confirmar recorrência |

## v1.2 / v2 / v3 — guardadas como referência, roadmap não muda

O Stitch gerou essas telas de fases futuras antes da hora. Ficam salvas pra quando chegar a fase certa — **não** pulamos etapa no roadmap por causa disso.

| Arquivo | Tela | Fase |
|---|---|---|
| `17-import-transactions.html` | Importar extrato | v1.2 |
| `18-review-import.html` | Revisar importação | v1.2 |
| `19-credit-cards-list.html` | Lista de cartões | v2 |
| `20-statement-detail.html` | Detalhe da fatura | v2 |
| `21-share-account.html` | Compartilhar conta | v3 |
| `22-manage-account-access.html` | Gerenciar acesso à conta | v3 |
| `23-accept-invitation.html` | Aceitar convite *(bônus, não estava no prompt original)* | v3 |
| `24-invitation-email.html` | **Template de e-mail** de convite *(bônus — não é tela do app, é um e-mail)* | v3 |
| `25-member-dashboard-shared.html` | Dashboard do membro convidado *(bônus)* | v3 |

## ✅ Resolvido — bug de moeda e bancos fictícios

Após duas rodadas de ajuste no Stitch: o card de total agora agrupa por moeda em vez de somar (Home e Contas), foi renomeado pra "Total Balance" nas duas telas, e os bancos fictícios (Chase, Ally, Nordea, Revolut, Amex) viraram bancos brasileiros (Itaú, Nubank, Bradesco, XP) — consistente com a tela de Adicionar Conta. As datas das transações na Home, que tinham sumido numa correção anterior, foram restauradas.

## ⚠️ Pendente #1 — dois modos escuros inconsistentes

O export trouxe modo escuro pra várias telas, mas em **duas paletas diferentes e não relacionadas**:

| | Telas mobile no escuro | Telas desktop no escuro |
|---|---|---|
| Nome interno | "Nocturne Mobile" | "Kontrola Dark" |
| Primary | `#57f1db` (teal) | `#a6c8ff` (azul claro) |
| Fundo | `#0e141b` | `#1d1100` (marrom/âmbar) |
| Fonte de label | JetBrains Mono | Inter |

Nenhuma das duas é o que especificamos no Prompt Mestre (fundo `#12181F`, indigo como primary, teal só como *accent*, Manrope/Inter sem mono). Decisão: **não adotar nenhuma das duas** — pedir pro Stitch regenerar o modo escuro seguindo estritamente a nossa própria paleta. Prompt pronto:

```
Regenerate dark mode for every screen using ONLY this palette — do not invent a new one, and keep it identical between mobile and desktop:
- Background: #12181F
- Surface (cards): #1A222C
- Surface-bright (inputs/hover/elevated): #232D3B
- Primary: a lighter tint of the light-mode primary (#1E3A5F) shifted for AA contrast on dark, e.g. #8AA4CF
- Accent (credit/income/confirm): #2DB88A — same as light mode
- Semantic debit/expense: #E2685E — same as light mode
- Semantic planned/forecast: #C9A15A with dashed border — same as light mode
- Primary text: warm off-white #F5F3EE. Secondary/metadata text: muted slate blue-gray
- Typography: same as light mode — Manrope for headings/body, Inter for labels and currency figures. No new fonts, no monospace.
Apply this single palette across every screen, mobile and desktop. They must look like the same product in dark mode, not two different apps.
```

Não gerado ainda — sem tela salva de modo escuro por enquanto.

## ⚠️ Pendente #2 — nenhuma tela trata safe areas (notch / barra de gestos)

Busca programática nas 67 telas do export: zero ocorrências de `safe-area` ou `viewport-fit=cover`. Nenhuma tela evita a área da câmera/notch no topo nem a barra de gestos embaixo. Prompt pra pedir no Stitch:

```
Add safe-area support across all screens, since many phones have a camera/notch cutout at the top and a home-indicator gesture bar at the bottom that can overlap content. Set <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"> on every screen, and add safe-area padding to the sticky top header (padding-top: env(safe-area-inset-top)) and to the fixed bottom navigation bar / floating action button / fixed bottom action buttons (padding-bottom: env(safe-area-inset-bottom)), so nothing sits under the notch or gets clipped by the gesture bar.
```

**Importante**: mesmo pedindo isso no Stitch, o jeito confiável de garantir isso é implementar direto no Next.js (meta viewport + `env(safe-area-inset-*)` no CSS global do app) — a exportação estática do Stitch não é garantia de que isso sobrevive fielmente. Vamos tratar isso na hora do scaffold, independente do que o Stitch devolver.

## ⚠️ Pendente #3 — formatação de moeda só foi corrigida nos totais, não nas linhas

As correções anteriores trataram só os totais/cabeçalhos (Home, card de Contas, header da Account Detail). Cada **linha de transação individual** continua em formato americano (`$1,234.56`) na maioria das telas: Transactions List, Planned view, Confirm Recurring (símbolo do input), Add/Edit Transaction (símbolo do input), Review Import, Member Dashboard Shared. `19-credit-cards-list.html` e `20-statement-detail.html` já nasceram certas em R$ — usar como referência.

```
Fix currency formatting on every remaining screen that still shows amounts in US format ($1,234.56) instead of Brazilian format (R$ 1.234,56) — the same fix already applied to the Home and Accounts totals. This affects: Transactions List, Planned view, Confirm Recurring Transaction (the amount input and its currency symbol), Add/Edit Transaction (the amount input's currency symbol), Review Import, and any other screen showing individual transaction line amounts. The Credit Cards List and Statement Detail screens already use the correct R$ format — use those as the reference.
```

## ⚠️ Pendente #4 — nav diferente em 2 telas, com aba "Budgets" não planejada

`19-credit-cards-list.html` e `25-member-dashboard-shared.html` usam `Home, Cards, Budgets, Settings` em vez do padrão `Home, History, Accounts, Planned, Settings` usado em todo o resto do app. A aba "Budgets" (orçamento/limite de gasto por categoria) nunca foi discutida — **decisão: não faz parte do Kontrola por enquanto**, alinhar a navegação dessas 2 telas com o padrão.

```
Fix the bottom navigation on the "Credit Cards" and "Member Dashboard (Shared)" screens — they currently use a different nav ("Home, Cards, Budgets, Settings") than the rest of the app. Replace it with the same 5-tab navigation used everywhere else: Home, History, Accounts, Planned, Settings (with "Accounts" active on the Credit Cards screen, since credit cards are a type of account).
```

## Nota — taxonomia de categoria mais rica nos mockups do que a lista oficial

Nossa lista oficial (`CONTEXT.md`) tem 9 categorias: Housing, Food, Transport, Health, Education, Subscriptions, Income, Transfer, Other. Os mockups usam nomes soltos e mais específicos espalhados pelas telas — "Groceries", "Bills", "Utilities", "Dining", "Entertainment", "Shopping" (esse último aparece até no grid de categorias do Add Transaction, `05-add-edit-transaction.html`) — que não batem com a lista oficial. Provavelmente é só o Stitch variando texto de exemplo pra parecer mais real, não uma proposta deliberada. Não travei nenhuma decisão aqui — só registrando pra caso valha revisar a granularidade da lista oficial antes de implementar.

## Nota — acessibilidade (aria-label) inconsistente entre telas

Varredura em todos os 27 arquivos: a maioria não tem `aria-label` em botões só-de-ícone (sino de notificação, seta de voltar, fechar). Um punhado de telas geradas mais tarde (Notification Settings, Confirm Recurring, Import Transactions) já vêm com isso. Não vale a pena perseguir isso tela por tela no Stitch — a correção real vai ser um componente `IconButton` compartilhado no Next.js que **exige** `aria-label`, garantindo isso de forma estrutural em vez de tela por tela.

## Fora de escopo por decisão (não salvo)

- **Desktop responsivo** — o Kontrola é mobile-first (PWA); suporte a desktop fica de lado por enquanto, pode virar uma fase própria depois. Nenhuma variante `_desktop` foi salva.
- **Modo escuro** — nenhuma das duas paletas inventadas foi salva (ver Pendente #1 acima); esperando a regeneração correta.
- **Variantes experimentais** que o Stitch sugeriu sozinho (edição em lote e confirmação em massa da tela Planned, coluna de conta na importação, gráfico de gastos em Categorias, total mensal em Recorrências) — não pedimos, não fazem parte de nenhuma decisão travada, ficaram só no zip original caso um dia sejam úteis.

## `superseded/` — versões substituídas (só arquivo, não usar)

- `account-detail.old.html` — sem selo de moeda
- `accounts-list.old.html` — sem selo de moeda nos cards, card de total já vinha errado

## Fonte bruta

O zip completo (`stitch_multi_platform_prompt_analyzer.zip`, ~9,5MB — inclui screenshots PNG de todas as 67 telas) não foi commitado no git por tamanho. Fica guardado fora do controle de versão; se precisar de alguma variante desktop/dark/experimental que não está aqui, é só pedir.
