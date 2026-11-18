# HUSTLEVERSE

A responsive community directory website built with HTML, CSS, vanilla JavaScript, and Supabase Auth/Postgres.

## Run locally

Open `index.html` in a browser to preview the site. Without Supabase credentials, it displays sample profiles and the account forms explain that setup is needed. For a local web server, run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`.

## Connect Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the `profiles` table and the row-level security policies used by the app. Public profile reads are enabled; signed-in users can insert or update only their own row.
3. In `app.js`, replace `YOUR_PROJECT_ID` in `SUPABASE_URL` with your project reference and `YOUR_SUPABASE_ANON_KEY` with the project's **publishable/anon key**. Never use a `service_role` or secret key in browser code.
4. In Supabase Authentication settings, configure the site URL and allowed redirect URLs for your deployed website. Email confirmation can be enabled in the Auth settings.
5. Deploy the static files to a host such as GitHub Pages, Netlify, or Vercel.

The `profiles` table is publicly readable by design, so users should only enter details they intend to share publicly. The browser validates external links and uses `rel="noopener noreferrer"` for external website links.
