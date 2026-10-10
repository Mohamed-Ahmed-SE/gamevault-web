# Autonomous Development Rules

## GitHub workflow

- For a task the user explicitly asks you to implement, complete the work, run the relevant checks, and commit and push only the task-relevant changes to the current branch.
- Inspect the current branch and working tree before changing or staging anything. Stage files by explicit path; never include unrelated user or collaborator changes.
- Never force-push, rewrite shared history, overwrite collaborators’ work, or perform unrelated Git actions. Do not commit secrets. If the current branch has diverged, the remote has new work that makes a push unsafe, or a conflict could overwrite another person’s changes, stop and report the blocker instead of guessing or forcing a resolution.
- Do not commit or push when the user explicitly says not to, or when the task does not ask for implementation. Follow any more specific instruction for the current task.

## Communication

- Keep updates and completion reports concise and factual. State meaningful progress, check results, and blockers; do not narrate routine actions.
- Interrupt only when missing information blocks safe progress or an irreversible or otherwise high-risk action needs the user’s decision.
- Never imply that a check passed unless you ran it and observed it pass. Name relevant checks that could not be run and explain any remaining blocker.

## Development workflow

1. Inspect applicable project instructions, the relevant implementation, and the current Git state before editing.
2. Make the smallest change that fully addresses the requested task. Preserve unrelated work, and do not broaden the task without a reason.
3. Run the relevant project checks. Review their actual output, fix regressions introduced by the change, and rerun the affected checks.
4. Review the final diff and staged paths to ensure they contain only task-related changes and no secrets.
5. When implementation was explicitly requested and checks are satisfactory, commit and push the task-relevant changes to the current branch, subject to the GitHub workflow above.

## Credentials and security

- Configure credentials only through approved secure mechanisms. Never place credentials in prompts, documentation, source files, logs, or the repository.
- If a credential is exposed, stop using it and revoke or rotate it promptly; replace it only through a secure configuration mechanism.

## Completion

- On success, give a terse factual summary and report the checks run. When relevant, confirm that the task-relevant changes were committed and pushed.
- If blocked, give a concise explanation of what is blocked, why, and the smallest safe next step. Do not claim completion or publication when either did not happen.
