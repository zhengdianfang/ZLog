name: run-ci

description: Trigger the GitHub Actions CI workflow on the current branch, monitor it in real time, and report the final result with step-level details.

## Steps

1. **Determine the target branch**
   - Run `git branch --show-current` to get the current branch name.
   - If ARGUMENTS specifies a branch, use that instead.

2. **Trigger the CI workflow**
   - Run: `gh workflow run ci.yml --ref <branch>`
   - Wait 3–4 seconds for GitHub to register the run, then fetch the new run ID:
     `gh run list --workflow=ci.yml --branch=<branch> --limit=1 --json databaseId,status,conclusion,createdAt`
   - Print the run URL so the user can follow it in the browser:
     `gh run view <run-id> --web` — do NOT open it, just print the URL.

3. **Stream live status**
   - Poll `gh run view <run-id> --json status,conclusion,jobs` every 10 seconds until `status` is `completed`.
   - After each poll, print a one-line status summary:
     `[HH:MM:SS] <overall-status> — <job-name>: <job-status> (<step currently running>)`
   - Stop polling once `status === "completed"`.

4. **Report the result**
   - If `conclusion === "success"`: print a short success message listing all passing jobs.
   - If `conclusion !== "success"`: print the conclusion (failure / cancelled / timed_out), then run:
     `gh run view <run-id> --log-failed`
     to fetch the logs of failed steps and display the relevant error lines (last 40 lines max per step).

5. **Exit summary**
   - One line: CI result, branch, run ID, and elapsed time.
   - If the run failed, suggest the most likely fix based on the error output (lint / typecheck / test).
