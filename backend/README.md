Backend development notes

- Create a local .env with your AI key (do NOT paste secrets into chat). From PowerShell run:
  - .\set-env.ps1

- To use OpenAI as the provider, set these env vars in backend/.env:
  - AI_API_KEY=sk-...
  - AI_PROVIDER=openai
  - OPENAI_MODEL=gpt-4o-mini

- To use Deepseek as the provider (model R1):
  - AI_API_KEY=ds-...
  - AI_PROVIDER=deepseek
  - DEEPSEEK_MODEL=R1  # optional, defaults to R1
  - DEEPSEEK_URL=https://api.deepseek.example/v1/generate  # optional override

- Start server for development:
  - npm install
  - npx prisma generate
  - npm run dev

The frontend dev server is configured (vite) to proxy /api to http://localhost:4000 so calls to /api/ai/feedback will reach the backend during development.
Backend scaffold for Wellspring Diary (Express + TypeScript + Prisma + SQLite)

Quick start (PowerShell on Windows):

1. Open terminal in `backend` folder

2. Install dependencies

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init --preview-feature
```

3. Run dev server

```powershell
npm run dev
```

API endpoints (examples):
- POST /api/auth/register { email, password, name }
- POST /api/auth/login { email, password }
- GET /api/entries (Authorization: Bearer <token>)
- POST /api/entries { title, body, mood }
- POST /api/usage/start (Authorization)
- POST /api/usage/heartbeat { sessionId? }
- POST /api/usage/stop { sessionId? }

Device integration
- POST /api/device/register { deviceId, platform, osVersion?, model?, userId? }
- POST /api/device/data { deviceId, type, payload }
- GET /api/device/:deviceId/data

Android guidance:
- On first run generate a stable `deviceId` (Secure.ANDROID_ID or Instance ID) and call `/api/device/register` with device info.
- Send periodic telemetry using `/api/device/data`. `payload` can be JSON with battery, locale, appVersion, etc.
- Use `/api/usage/start` and `/api/usage/heartbeat` to track active sessions as well.

Notes:
- Uses SQLite by default for easy local testing. Replace Prisma datasource for production DB.
- JWT secret stored in env var `JWT_SECRET`.

```powershell
cd backend
.\set-env.ps1
```
 