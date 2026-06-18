# letsgetmarried — SaaS construtor de site de casamento

SaaS onde noivos montam um site (história, save the date, infos, lista de presentes e
fundo de lua de mel) e pagam uma **assinatura anual via PIX (AbacatePay)** para deixá-lo
público por 1 ano em `seudominio.com/nome-do-casal`.

- **Front + Back:** Next.js (App Router) — deploy na Vercel.
- **Banco / Auth / Storage:** Supabase.
- **Pagamento da assinatura:** AbacatePay (PIX).
- **Presentes / fundo de viagem:** o site **gera o QR Code / copia-e-cola PIX do próprio
  casal** (BR Code estático, padrão Banco Central). O convidado paga direto na conta deles —
  a plataforma **não** processa esse dinheiro.

## 1. Pré-requisitos
- Node 18+ e uma conta no [Supabase](https://supabase.com) e na [AbacatePay](https://abacatepay.com).

## 2. Configurar o Supabase
1. Crie um projeto no Supabase.
2. No **SQL Editor**, rode na ordem:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_storage_and_expiry.sql`
3. Em **Authentication → Providers**, habilite **Email** (magic link já vem ligado).
4. Em **Authentication → URL Configuration**, adicione a redirect URL:
   `http://localhost:3000/auth/callback` (e a de produção depois).
5. Copie em **Project Settings → API**: a URL, a `anon key` e a `service_role key`.

### E-mail (SMTP via Resend)
O serviço de e-mail embutido do Supabase tem limite baixíssimo (~2–4/hora) e causa
"email rate limit exceeded". Configure um SMTP próprio:

1. Crie conta no [Resend](https://resend.com). **Em modo de teste (sem domínio
   verificado), só entrega e-mails para o endereço dono da conta** — então use o mesmo
   e-mail com que vai logar no app.
2. **API Keys → Create API Key** (Sending access); copie a chave `re_...`.
3. No Supabase: **Authentication → Emails → SMTP Settings → Enable Custom SMTP**:
   - Sender email: `onboarding@resend.dev` (teste) ou `nao-responda@seudominio.com` (prod)
   - Sender name: `Nosso Casamento`
   - Host: `smtp.resend.com` · Port: `587` · Username: `resend` · Password: a API key
4. **Authentication → Rate Limits**: suba "emails per hour".
5. **Produção:** em **Resend → Domains**, adicione e verifique seu domínio (registros
   DNS SPF/DKIM) para enviar a qualquer convidado, de um remetente do seu domínio.

## 3. Variáveis de ambiente
Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

| Variável | Onde obter |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (secreta!) |
| `ABACATEPAY_API_KEY` | AbacatePay → API Keys |
| `ABACATEPAY_WEBHOOK_SECRET` | você escolhe; use o mesmo no painel do webhook |
| `NEXT_PUBLIC_SITE_URL` | URL pública (ex.: `https://seudominio.com`) |
| `SUBSCRIPTION_PRICE_CENTS` | preço anual em centavos (ex.: `9900`) |
| `CRON_SECRET` | string aleatória longa (proteção do cron) |

## 4. Rodar localmente
```bash
npm install
npm run dev
```
Acesse `http://localhost:3000`.

## 5. Configurar a AbacatePay
1. Crie a API key e coloque em `ABACATEPAY_API_KEY`.
2. Em **Webhooks**, cadastre a URL:
   `https://SEU_DOMINIO/api/webhooks/abacatepay?webhookSecret=SEU_SEGREDO`
   (o `SEU_SEGREDO` deve ser igual ao `ABACATEPAY_WEBHOOK_SECRET`).
3. Use o `devMode` da AbacatePay para testar antes da produção.

## 6. Deploy na Vercel
1. Suba o repositório no GitHub e importe na Vercel.
2. Cole todas as variáveis de ambiente nas **Project Settings → Environment Variables**.
3. O `vercel.json` já agenda o cron diário (`/api/cron/expire`) que expira sites vencidos.
4. Atualize as redirect URLs do Supabase e a URL do webhook da AbacatePay com o domínio final.

## Fluxo do produto
1. Casal entra com magic link → cai no **/painel**.
2. Edita conteúdo (**/painel/editar**) e presentes (**/painel/presentes**) em modo rascunho.
3. Clica em **Pagar e publicar** → cria cobrança PIX na AbacatePay → paga.
4. Webhook confirma → site vira `published` com `expires_at = hoje + 1 ano`.
5. Convidados acessam `seudominio.com/<slug>`; pagam presentes via PIX direto ao casal.
6. Após 1 ano, o cron marca como `expired` e o site sai do ar até renovar.

## Estrutura
```
src/
  app/
    page.tsx                       landing
    login/                         magic link
    auth/callback/                 troca code por sessão
    painel/                        área logada (dashboard, editar, presentes)
    [slug]/                        site público (SSR, gated por published+expires)
    api/checkout/                  cria cobrança AbacatePay
    api/webhooks/abacatepay/       confirma pagamento → publica 1 ano
    api/cron/expire/               expira sites vencidos
  components/painel|site/          formulários e cartão PIX
  lib/
    supabase/{client,server,admin} clients
    abacatepay.ts                  wrapper da API
    pix.ts                         gerador BR Code (EMV + CRC16)
    types.ts
supabase/migrations/               schema + RLS + storage + expiração
```
