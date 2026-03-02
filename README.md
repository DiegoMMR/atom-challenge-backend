# Atom Challenge Backend

## Variables de entorno

Configura un archivo `.env` en la raíz del proyecto con estas variables:

- `PORT`
- `ALLOW_ORIGIN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional, default: `gpt-4o-mini`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `TELEGRAM_BOT_TOKEN`

## Ejecutar servidor

```bash
pnpm install
pnpm dev
```

Servidor por defecto: `http://localhost:3000`

live site https://atom-day.mr-diego.dev/

Elegimos fastify por su experiencia de desarollo, rendimiento y que posee plugins para poder ser transformado en serverless si es necesario

para el framwork de IA elegimon Genetik ya que nos permite cambiar de proveedor y modelos facilmente sin cambiar drasticamente el codigo
