---
name: deploy
description: Deploy the app to production via deploy_rsync.sh. Runs build + rsync + PM2 restart. If the build fails, diagnoses and fixes the errors automatically, then retries.
---

# Deploy Skill

Deploy the multimarca app to the production server.

## What it does

1. Runs `bash deploy_rsync.sh` from the repo root
2. The script builds locally (`yarn --cwd apps/web build`), then rsyncs `.next` to the server, runs Prisma migrations, and restarts PM2
3. If the build fails, the script exits with the last 40 lines of build output

## When the build fails

If `deploy_rsync.sh` exits with a non-zero code:

1. **Read the error output carefully** — the script prints the last 40 lines of the build log, and also saves the full log to a temp file (path shown in output)
2. **Identify the root cause** — common failures:
   - TypeScript type errors (read the file + line mentioned, fix the type)
   - Import errors (missing/renamed exports)
   - ESLint errors that block build (fix the lint issue)
   - Prisma schema out of sync (`npx prisma generate` in apps/web)
3. **Fix the error** — make the minimal change needed. Do NOT refactor unrelated code.
4. **Re-run `bash deploy_rsync.sh`** — repeat until the deploy succeeds
5. **If you fixed code, commit the fix** before or after a successful deploy

## Important

- Run the script from the repo root: `/Users/luispaniagua/multimarca`
- The build log temp file persists — read it with `cat` if you need the full output
- Do NOT modify the deploy script itself unless the user asks
- Do NOT skip the build (`--no-build` doesn't exist) — the build is the safety check
- If the same error repeats after your fix, re-read the error — you may have fixed the wrong thing
- The deploy takes 2-5 minutes. Use `timeout: 600000` (10 min) when running it
