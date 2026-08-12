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

## ✅ Resolvido — moeda nas linhas de transação e navegação com aba "Budgets"

Confirmado linha por linha nos arquivos atualizados: `06-transactions-list.html`, `11-planned-view.html`, `16-confirm-recurring.html`, `05-add-edit-transaction.html`, `18-review-import.html`, `25-member-dashboard-shared.html` — zero `$` restante, tudo em `R$ 1.234,56`. `19-credit-cards-list.html` e `25-member-dashboard-shared.html` agora usam a navegação padrão (`Home, History, Accounts, Planned, Settings`), sem a aba "Budgets".

## 🎁 Design system unificado — `kontrola-calm-control-DESIGN.md`

O Stitch consolidou um novo arquivo de design (`../kontrola-calm-control-DESIGN.md`, salvo na raiz de `docs/`) que substitui os três arquivos conflitantes de antes (`kontrola`, `kontrola_dark`, `nocturne_mobile`). Esse já documenta formalmente, como regra do sistema — não só aplicado em telas soltas — as 4 correções que pedimos: um único dark mode (fundo `#0e141b`/`#12181F`, primary `#adc8f5`/`#8AA4CF`), light mode preservado (`#FAF9F6`/`#1E3A5F`), moeda sempre em formato brasileiro, safe-area obrigatória em headers/nav fixos, e nav de 5 abas com "Credit Cards" dentro de "Accounts" (não uma aba própria, e sem "Budgets"). **Esse arquivo é a referência oficial pra pedir a cobertura completa de dark mode quando chegar a hora.**

## ⚠️ Pendente #1 — modo escuro ainda cobre só 6 telas

Só 6 telas têm versão escura (`dark-mode-wip/`): Home mobile+desktop, Credit Cards mobile, Member Dashboard mobile, Planned View mobile, Transactions List desktop. Agora que existe um design system único e documentado (`kontrola-calm-control-DESIGN.md`), o próximo pedido é só pedir cobertura completa citando esse arquivo:

```
Apply the "Kontrola Calm Control" design system's dark mode (from kontrola_calm_control/DESIGN.md) to every remaining screen that doesn't have a dark variant yet, using the exact same tokens already used on the Home, Credit Cards, Member Dashboard, Planned View and Transactions List dark screens. Every screen must share the identical dark palette between mobile and desktop.
```

## ⚠️ Pendente #2 — safe areas ainda só nas mesmas 6 telas

Mesma cobertura parcial do modo escuro (as duas correções vieram juntas nos mesmos arquivos). O design system já documenta a regra (`safe-area-top`/`safe-area-bottom` como token oficial) — falta só aplicar em todo o resto:

```
Apply safe-area support (viewport-fit=cover meta tag, env(safe-area-inset-top) on sticky headers, env(safe-area-inset-bottom) on fixed bottom navigation/buttons) to every screen that doesn't have it yet — same treatment already used on the Home, Credit Cards, Member Dashboard, Planned View and Transactions List screens.
```

**Importante**: mesmo pedindo isso no Stitch, o jeito confiável de garantir isso é implementar direto no Next.js (meta viewport + `env(safe-area-inset-*)` no CSS global do app) — a exportação estática do Stitch não é garantia de que isso sobrevive fielmente. Vamos tratar isso na hora do scaffold, independente do que o Stitch devolver.

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
