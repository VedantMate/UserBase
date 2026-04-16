# PM — User Management

Small monorepo with a backend (Express + MongoDB) and frontend (React + Vite).

## Structure

- backend/ — Express API (src/, package.json)
- frontend/ — React app (src/, package.json)

## Quick start

Backend:

```bash
cd backend
npm install
cp .env.example .env # update values
npm start
```

Frontend (dev):

```bash
cd frontend
npm install
npm run dev
```

## Deployment notes

- If deploying the whole repository on Render, the repo now includes a root `package.json` that forwards install/start to the `backend` folder. Keep the service Root Directory as the repo root, and use `npm start`.
- Alternatively, point Render/Vercel to the `backend` folder and use its `package.json` commands directly.

## Useful scripts

- Root: `npm start` — runs backend start
- Backend: `npm run dev` — dev server with watch

## Environment

- Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `JWT_SECRET`, and other values.

---