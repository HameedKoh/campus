# Campus SmartCare

Campus SmartCare is an AI-based smart campus healthcare assistant built for a university setting. It combines:

- student self-service health access
- explainable AI symptom triage
- appointment booking and clinic queue management
- emergency alert handling
- secure health record review
- doctor and admin operational dashboards

## Stack

- `Frontend`: React + Vite + TypeScript
- `Backend`: Node.js + TypeScript + Express
- `Database`: PostgreSQL + Prisma ORM
- `Security`: JWT, bcrypt password hashing, RBAC, Zod validation, encrypted sensitive text

## Project Structure

```text
frontend/   React application
backend/    Express API, Prisma schema, AI engine, tests
docs/       Architecture and API notes
```

## Quick Start

1. Copy `.env.example` to `.env`
2. Start PostgreSQL with Docker:

```bash
docker compose up -d
```

3. Install workspace dependencies:

```bash
npm install
```

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
npm run prisma:seed --workspace backend
```

5. Start the API and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

6. Open the frontend at `http://localhost:5173`

## Default Seed Accounts

- `admin@campussmartcare.edu`
- `doctor1@campussmartcare.edu`
- `doctor2@campussmartcare.edu`

Passwords are controlled from `.env`.

## Verification

- Production build:

```bash
npm run build
```

- Backend tests:

```bash
npm test
```
