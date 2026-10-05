# Ekadashi Studio — standalone trial build

Self-contained Next.js app (no monorepo/submodules) for deploying just the
Ekadashi Studio. Deploy to Vercel with **Root Directory = `web-trial`**.

- `/` and `/ekadashi` render the studio.
- Paste your Anthropic API key in the page (stored only in your browser), or
  set `ANTHROPIC_API_KEY` as a Vercel env var to enable it for everyone.
