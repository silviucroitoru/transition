# Deploying this app

The app is a static Vite/React SPA. After `npm run build`, deploy the `dist/` folder.

## Hosting options

| Platform | Notes |
|----------|--------|
| **[Vercel](https://vercel.com)** | Connect the repo, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in project env, build command `npm run build`, output directory `dist`. |
| **[Netlify](https://netlify.com)** | Connect the repo, build command `npm run build`, publish directory `dist`. Add the two Supabase env vars in Site settings → Environment variables. |
| **[Cloudflare Pages](https://pages.cloudflare.com)** | Connect the repo, build command `npm run build`, build output directory `dist`. Set env vars in the dashboard. |
| **GitHub Pages** | Use `vite.config` with `base: '/your-repo-name/'`, then use e.g. `gh-pages` to push `dist` to a `gh-pages` branch. |
| **Supabase (Edge + static)** | Host static files in a Supabase project or use Supabase + a static host; DB is already on Supabase. |

## Env vars for production

Set these in your host’s environment (not in code):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional (if you keep them): Tolgee, Mixpanel, etc.

## Quick Vercel deploy

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import the repo.
3. Add env vars, then Deploy.

## Quick Netlify deploy

1. Push the repo to GitHub.
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Add env vars in Site settings → Environment variables → Deploy.
