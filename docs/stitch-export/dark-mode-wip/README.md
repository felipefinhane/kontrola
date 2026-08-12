# Dark mode — trabalho em progresso

6 telas que já vieram com o modo escuro regenerado seguindo (quase) a nossa paleta, junto com o tratamento de safe-area (`viewport-fit=cover` + `env(safe-area-inset-*)`). **Incompleto** — a maioria das telas do MVP ainda não tem versão escura. Ver [`../INDEX.md`](../INDEX.md) pros próximos prompts pendentes.

| Arquivo | Fundo | Primary |
|---|---|---|
| `04-home-dashboard.mobile.html` | `#0e141b` | `#adc8f5` |
| `19-credit-cards-list.mobile.html` | `#0e141b` | `#adc8f5` |
| `25-member-dashboard-shared.mobile.html` | `#0e141b` | `#adc8f5` |
| `11-planned-view.mobile.html` | `#0e141b` | `#adc8f5` |
| `04-home-dashboard.desktop.html` | `#12181F` (exato) | `#8AA4CF` (exato) |
| `06-transactions-list.desktop.html` | `#12181F` (exato) | `#8AA4CF` (exato) |

As 4 telas mobile usam um tom praticamente idêntico ao que pedimos, mas não é o token exato — as 2 desktop vieram com o valor exato do prompt. Diferença mínima visualmente, mas ainda não é "o mesmo token" entre mobile e desktop. Fica pra resolver quando pedirmos a cobertura completa.
