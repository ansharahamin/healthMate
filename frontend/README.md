# HealthMate frontend

The Next.js app provides the HealthMate landing, account access, and personal health vault.

## Local development

1. Start the backend from `backend` with `npm start`. It listens on port `3000` and requires a working MongoDB connection.
2. Start this app from `frontend` with `npm run dev`. It listens on port `3001` so it can run alongside the backend.
3. Open `http://localhost:3001`.

The frontend proxies `/api/*` requests to `http://localhost:3000` by default. To use another backend origin, set `HEALTHMATE_API_URL` in the frontend environment, for example `https://api.example.com` (without a trailing `/api`).

Sign-in and account creation are available at `/login` and `/signup`. After signing in, use:

- `/dashboard` for a summary of your recent files and readings.
- `/files` to browse documents, `/files/upload` to add one, and `/files/<id>` to preview it and request an AI explanation.
- `/vitals` to view readings and `/vitals/new` to add one.
- `/timeline` to see files and readings in date order.
- `/insights` for saved report summaries and a generated vitals overview.
- `/profile` for account details and sign-out.

Health file uploads accept PDF, JPEG, PNG, and WebP files up to 10 MB.
