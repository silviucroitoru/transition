# Supabase setup

## 1. Get your anon key

In Supabase: **Settings → API** → copy the **anon public** key.

Paste it into `.env`:

```bash
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 2. Create tables

In Supabase: **SQL Editor** → run the contents of `supabase_schema.sql`.

## 3. Seed the questionnaire

```bash
npm run seed
```

## 4. Run the app

```bash
npm run dev
```

The app will load the questionnaire from Supabase and save submissions to the `submissions` table.
