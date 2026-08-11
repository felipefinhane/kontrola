# Kontrola — Análise inicial + decisões de arquitetura

> Nome do projeto definido como **Kontrola**, mas o domínio (`.com`/`.app`) não estava disponível. Fica como nome de trabalho por enquanto — vamos revisitar quando o projeto tiver mais cara própria. (Ver seção 4 do histórico original mais abaixo para outras ideias já descartadas/cotadas.)
>
> **Este documento é o registro histórico da primeira análise.** Depois dele veio uma sessão de entrevista (grilling) que travou várias decisões em detalhe — algumas delas **substituem** o que está escrito aqui (ex.: o banco de dados virou **Neon**, não Supabase). A fonte da verdade agora é [`../CONTEXT.md`](../CONTEXT.md) (glossário/modelo de domínio) e [`./adr/`](./adr/) (decisões e por quê). Vale ler este arquivo pelo contexto/diagnóstico do problema, mas para arquitetura confira as ADRs primeiro.

## 1. O que a planilha antiga (`Finhane_Financeiro.xlsx`) mostrou

19 abas, uma por mês:

- **2021–2022**: `Agosto2021` → `Setembro2022` (14 meses seguidos) — primeira tentativa.
- **Gap de ~4 anos** sem nenhum lançamento.
- **2026**: `Agosto2026` (mês atual, com lançamentos reais) → `Dezembro2026` (`Setembro`, `Outubro`, `Novembro`, `Dezembro` como projeção/orçamento) — o reinício.

Estrutura de cada aba (idêntica ao longo dos 5 anos): `Descrição | Banco | Data | Valor | OP (C/D) | Saldo | OBS`, com uma linha "SALDO ANTERIOR" no topo e o saldo recalculado manualmente linha a linha.

**Observações relevantes para o produto:**

- **Sem categorização.** Não existe coluna de categoria (alimentação, moradia, lazer...) — só descrição livre. Isso limita muito a visão analítica (quanto gasto por categoria, comparação mês a mês).
- **Cartão de crédito só aparece como um lançamento único** ("Cartão MercadoLivre", "Cartão XP", "Cartão BTG", "Cartão TAP" com o valor total da fatura) — hoje só a conta bancária é detalhada, o cartão é uma "caixa preta".
- **Múltiplos bancos ao longo do tempo** (Itaú, Caixa, C6, XP, BTG) — o modelo de dados precisa suportar múltiplas contas por usuário desde o início, não só uma.
- **Saldo calculado à mão** — arriscado (um erro de fórmula/cópia se propaga pro resto do mês); no app isso deve ser sempre derivado, nunca digitado.
- **Muitos lançamentos recorrentes e previsíveis**: CPFL, Vivo, Aluguel+Condomínio, Escola Beatriz, SAAE, Pensões, Prolabore YES, Rendimentos YES — pista de ouro para o produto.
- Padrão de abandono claro: ~14 meses de uso e depois zero por anos. **O problema não é a estrutura da planilha — é fricção e falta de lembrete.** Isso deve guiar as prioridades do produto mais do que qualquer feature analítica bonita.

## 2. Diagnóstico do problema real

O diferencial do Kontrola não deve ser "mais um dashboard financeiro", e sim **reduzir o atrito de registrar** e **puxar o usuário de volta** quando some. Concretamente:

1. **Lançamento rápido pelo celular** (poucos toques, otimizado para uso com uma mão).
2. **Notificações/lembretes** (push, PWA) — ex: lembrete diário/semanal, ou "você não lança nada há 5 dias".
3. **Lançamentos recorrentes com sugestão automática** — como Aluguel, CPFL, Escola já se repetem todo mês com valor previsível, o app pode pré-criar/sugerir o lançamento e só pedir confirmação.
4. **Import futuro (OFX/CSV do banco)** — o maior redutor de atrito de todos; o Itaú exporta OFX. Deveria estar no roadmap logo depois do MVP, antes até do cartão de crédito, porque ataca a causa raiz do abandono.

## 3. Arquitetura sugerida

### Modelo de dados (pensado para multiusuário desde o dia 1)

Mesmo usando sozinho no começo, desenhar multiusuário desde já evita retrabalho quando quiser compartilhar com outra pessoa:

- `User` (auth)
- `Account` (conta bancária ou cartão — `type: bank | credit_card`, pertence a um `Owner` que pode ser usuário ou, no futuro, `Group`)
- `Transaction` (descrição, valor, data, tipo C/D, `account_id`, `category_id`, tags, recorrência)
- `Category` (com categorias padrão + custom por usuário)
- `RecurringTemplate` (para os lançamentos previsíveis identificados na planilha)
- `Group`/`Household` (v2 — conta compartilhada entre pessoas, com papéis: dono/membro)

Isso mapeia bem para **Row Level Security (RLS)** no Postgres: "cada usuário só vê o que é seu, ou o que pertence a um grupo do qual ele participa" — dá pra expressar isso com políticas RLS nativas, sem lógica de autorização espalhada pelo backend.

### Stack sugerida (gratuita para começar)

| Camada | Sugestão | Por quê |
|---|---|---|
| Frontend | **Next.js (React) + TypeScript**, como PWA | Familiaridade prévia com JS/TS; PWA dá "instalar no celular", funciona offline-ish, e permite push notification |
| Backend/DB/Auth | **Supabase** (Postgres gratuito + Auth + RLS + Storage) | RLS resolve "cada usuário tem seu controle, e no futuro pode compartilhar com um grupo"; tier gratuito generoso; evita escrever autenticação/autorização do zero |
| Hospedagem frontend | **Vercel** (free tier, integração nativa com Next.js) | Deploy trivial, HTTPS grátis |
| Alternativa mais simples | SvelteKit + Supabase, ou Next.js + Neon (Postgres serverless) + Auth.js | Caso prefira algo mais leve que Next.js |

### Segurança / criptografia (pensando em liberar para outras pessoas no futuro)

- HTTPS obrigatório (Vercel/Supabase já entregam isso).
- Autenticação com hash de senha via provedor gerenciado (Supabase Auth já usa bcrypt) — evitar implementar isso na mão.
- **RLS no Postgres** como camada real de isolamento entre usuários (não confiar só em `WHERE user_id = ?` no código da aplicação).
- Campos sensíveis (se algum dia guardar número de conta/cartão completo) — criptografia em nível de coluna ou nem guardar esse dado (normalmente não é necessário para controle financeiro pessoal, só valor/descrição/data).
- 2FA como opção, quando abrir para outras pessoas.

### Roadmap incremental sugerido

1. **MVP**: uma conta bancária, lançamento manual rápido, saldo automático, categorias, PWA instalável, lembretes.
2. **v1.1**: lançamentos recorrentes (ataca o problema real de abandono).
3. **v1.2**: import OFX/CSV do banco.
4. **v2**: cartão de crédito (faturas, parcelamento, categorização por item da fatura).
5. **v3**: compartilhamento — grupos/contas conjuntas, múltiplos usuários por conta.
6. **v4**: transferência entre contas (mover dinheiro entre duas contas suas) — surgiu como botão no design do Stitch antes de ser planejado; registrado como intenção real, mas sem prioridade nem modelo de dados definido ainda. Quando chegar a vez, decidir junto com "pagar fatura do cartão" (v2), já que os dois são a mesma pergunta de fundo: como representar uma Transaction vinculada entre duas contas/entidades diferentes.

## 4. Histórico da escolha do nome

Nomes óbvios testados e descartados por já existirem como apps de finanças:

- ❌ **Grão** → já é o app "Grão Investimentos" (Primo Rico).
- ❌ **Finzo** → já são vários apps de finanças (iOS/Android).
- ❌ **Saldo/Saldio** → "Saldo Finance App" já existe.
- ❌ **Finote** → já existe como expense tracker.
- ❌ **Cofrinho** → várias variantes já existentes no Brasil (MyCofrinho, etc.).

Outras opções cotadas, guardadas para o dia em que revisitarmos o nome:

| Nome | Estilo | Por quê funciona |
|---|---|---|
| **Assíduo** | PT, conceitual | Nomeia o comportamento que queremos construir: aparecer com regularidade |
| **Balancie** | PT, verbo/imperativo | Curto, memorável, soa bem em outras línguas latinas também |
| **Trilha** (ou "Trilha Financeira") | PT, metáfora | A planilha é literalmente uma trilha mês a mês de saldo |
| **FinHabit** | Híbrido EN | Comunica "hábito financeiro" direto para público internacional |

**Kontrola** foi a escolha para começar (internacional, soa fintech moderno, tipo Klarna/Spotify) — mas o domínio não estava livre, então o nome oficial do produto pode mudar antes do lançamento público. Por ora o projeto/pasta ficam com esse nome de trabalho.
