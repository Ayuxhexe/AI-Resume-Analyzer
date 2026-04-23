# AI Resume Analyzer & Job Matcher

A production-ready MERN application that lets users upload PDF resumes, analyze them with AI, estimate ATS readiness, extract skills, compare against job descriptions, and receive targeted improvement suggestions.

## Stack

- Frontend: React + Vite + Tailwind CSS + Chart.js
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt + Google Sign-In + Email OTP
- File Uploads: Multer
- PDF Parsing: pdf-parse
- AI: Google Gemini API with xAI/Grok fallback

## Project Structure

```text
.
|-- backend
|   |-- config
|   |-- controllers
|   |-- middleware
|   |-- models
|   |-- routes
|   |-- services
|   |-- uploads
|   |-- utils
|   `-- server.js
`-- frontend
    `-- src
        |-- components
        |-- context
        |-- pages
        |-- services
        `-- App.jsx
```

## Features

- Register and login with hashed passwords and JWT auth.
- OTP verification flow before access is granted after login, registration, or Google sign-in.
- Google sign-in with backend ID token verification.
- Protected frontend routes and protected backend APIs.
- PDF-only resume uploads with Multer.
- Resume text extraction with `pdf-parse`.
- AI-powered ATS scoring, skill extraction, experience summary, and suggestions.
- AI-powered job match percentage, missing skills, and recommendations.
- Dashboard with Chart.js visualizations.
- Drag-and-drop upload, loading states, toast notifications, and dark mode UI.
- Local file storage by default, with optional Cloudinary storage support through environment variables.
- Automatic retry and provider failover for transient AI API errors such as 503s.

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 2. Configure backend environment variables

Create `backend/.env` from `backend/.env.example`.

Required values:

```env
MONGO_URI=
JWT_SECRET=
```

At least one AI provider key is required:

```env
GEMINI_API_KEY=
# or
XAI_API_KEY=
```

To enable email OTP and Google sign-in:

```env
GOOGLE_CLIENT_ID=
SMTP_SERVICE=gmail
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Other useful options:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
AI_PROVIDER_ORDER=gemini,xai
AI_MAX_RETRIES=2
AI_RETRY_DELAY_MS=1500
GEMINI_MODEL=gemini-2.5-flash-lite
XAI_MODEL=grok-4-1-fast-reasoning
XAI_BASE_URL=https://api.x.ai/v1
FILE_STORAGE=local
```

If you want cloud storage, also set:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FILE_STORAGE=cloudinary
```

### 3. Configure frontend environment variables

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_URL=/api
VITE_SERVER_URL=
VITE_GOOGLE_CLIENT_ID=
```

Use the same Google OAuth client ID in both `backend/.env` and `frontend/.env`.

### 4. Start the backend

```bash
cd backend
npm start
```

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on `http://localhost:5000`.

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`

### Resume

- `POST /api/resume/upload`
- `GET /api/resume/:id`

### Analysis

- `POST /api/analysis/analyze`
- `POST /api/analysis/job-match`
- `GET /api/analysis/:userId`

## Notes

- The backend tries providers in `AI_PROVIDER_ORDER` and retries transient failures before failing over.
- By default, Gemini uses `gemini-2.5-flash-lite` for lower-cost, high-throughput requests.
- If `XAI_API_KEY` is configured, Grok acts as a backup provider using the xAI OpenAI-compatible Responses API.
- Gmail OTP delivery requires SMTP settings, usually a Gmail app password.
- Resume uploads are stored locally in `backend/uploads` by default.
- Frontend route pages are lazy-loaded to reduce the initial bundle cost.
- For a full end-to-end run, MongoDB, at least one AI provider key, SMTP settings, and Google client IDs are required for the full auth experience.
