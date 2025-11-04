# LeadCloud API (Supabase + NestJS)

Multi-tenant, listo para Render. Incluye:
- `/api/channels/connect-whatsapp` (botón en Bolt)
- `/webhooks/whatsapp` (entrantes Cloud API)
- `/webhooks/meta` (Instagram + Messenger unificado)
- Inserta Contacto + Conversación + Mensaje + Oportunidad auto (Ventas/Nueva)

## Env
Copiar `.env.example` a `.env` y completar:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- META_VERIFY_TOKEN
- WHATSAPP_APP_SECRET
- META_APP_SECRET

## Render
- Build: `npm install && npm run build`
- Start: `npm run start:prod`

## Meta Webhooks
- Callback WhatsApp: `https://<your-app>.onrender.com/webhooks/whatsapp`
- Callback Meta (IG/Messenger): `https://<your-app>.onrender.com/webhooks/meta`
- Verify Token: `META_VERIFY_TOKEN`

## Botón en Bolt
- URL: `https://<your-app>.onrender.com/api/channels/connect-whatsapp?canalId={{canal.id}}`
