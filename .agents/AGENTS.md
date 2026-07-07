# Workspace Rules

## Strict Deployment Pipeline

From now on, after EVERY completed task, follow this exact deployment pipeline:

1. `git status`
2. `npm run lint`
3. `npx tsc -b`
4. `npm run build`

5. If ANY command fails:
   - Stop immediately.
   - Fix the issue.
   - Re-run ALL commands from step 2.

6. `git status`
   - Confirm the expected files changed.

7. `git add -A`
8. `git commit -m "<meaningful message>"`
9. `git push origin main`

10. Run:
    `git log --oneline -3`
    `git rev-parse HEAD`
    `git ls-remote origin HEAD`

11. Verify that local HEAD == remote HEAD.

12. Wait for the Vercel deployment to finish.

13. Verify the production website visually.

Do NOT say "deployed" until:
- lint passes
- tsc passes
- build passes
- push succeeds
- local HEAD == remote HEAD
- production site visually matches the latest commit

For every task, provide this report:
✅ npm run lint
✅ npx tsc -b
✅ npm run build
✅ git commit
✅ git push
✅ Local HEAD
✅ Remote HEAD
✅ Production verification
❌ Remaining issues (if any)

If any step fails, do not continue to the next step until it is resolved.
