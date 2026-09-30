# Career Navigator

Career Navigator helps users explore career options, compare their skills with target roles, and build personalized learning roadmaps. It includes profile and resume import, GitHub sync, AI-generated career and market analysis, roadmap progress tracking, and achievement streaks.

## Stack

- Frontend: Next.js, React, TypeScript, and Tailwind CSS
- Backend: NestJS, TypeScript, MongoDB/Mongoose, and JWT authentication
- AI and integrations: Google Gemini, GitHub API, and OCR.space

## Requirements

- Node.js 22 or newer and npm
- A MongoDB connection string
- A Gemini API key
- An OCR.space API key to extract text from PDF resumes
- Google and LinkedIn OAuth apps for social sign-in

## Local Setup

Install dependencies in each application directory:

```bash
cd backend
npm install
cp .env.example .env
```

Fill in the backend environment values. In a separate terminal, start the API:

```bash
cd backend
npm run start:dev
```

The backend listens on port 3001 when `PORT=3001` is set. In another terminal, configure and start the frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The frontend routes `/api` requests to the backend using `NEXT_PUBLIC_API_URL`.

## Environment Variables

See [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example). They contain variable names and local defaults only. Keep real credentials in local ignored env files or your hosting provider's secret settings, never in source control.

Register the exact callback URL with each provider app. Google local development can use:

- `http://localhost:3001/api/auth/google/callback`

LinkedIn requires an HTTPS redirect URL, so use the production backend URL or an HTTPS development tunnel for its callback. Production callbacks use `https://<backend-origin>/api/auth/google/callback` and `https://<backend-origin>/api/auth/linkedin/callback`.

## Common Commands

Backend:

```bash
npm run build
npm test -- --runInBand
```

Frontend:

```bash
npm run build
npm run lint
```