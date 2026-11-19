# HealthMate frontend

The Next.js app provides the HealthMate landing, account access, and personal health vault.

## Local development

1. Start this app from `frontend` with `npm run dev`. It listens on port `3001`.
2. Open `http://localhost:3001`.

The frontend sends API requests to `NEXT_PUBLIC_API_URL`, configured in `.env.local` for local development and in the Vercel project environment for deployments. Set the value to the backend origin without a trailing slash, then rebuild/redeploy the frontend.

For local backend development, use `NEXT_PUBLIC_API_URL=http://localhost:3000`.

Sign-in and account creation are available at `/login` and `/signup`. After signing in, use:

- `/dashboard` for a summary of your recent files and readings.
- `/files` to browse documents, `/files/upload` to add one, and `/files/<id>` to preview it and request an AI explanation.
- `/vitals` to view readings and `/vitals/new` to add one.
- `/timeline` to see files and readings in date order.
- `/insights` for saved report summaries and a generated vitals overview.
- `/profile` for account details and sign-out.
“To update your Production Deployment, push to the main branch.”
Health file uploads accept PDF, JPEG, PNG, and WebP files up to 10 MB.
