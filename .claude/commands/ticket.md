---
description: Read a ticket from .claude/tickets/ and execute it with user confirmation
argument-hint: [ticket-filename]
---

**Permission mode:** Run in auto mode. Do not ask for permission on routine tool calls (file reads, edits, grep, git status, etc.). Only pause for confirmation when an action is irreversible or has shared-state side effects (e.g. pushing to remote, dropping data, running destructive migrations).

Read, clarify, and execute a development ticket.

## Steps

1. Read `.claude/tickets/$ARGUMENTS.md`
   - If the file does not exist, tell the user and stop. List what's in `.claude/tickets/` to help.

2. **Summarize** the ticket in 2-3 sentences — what needs to be built/changed and why.

3. **Determine the domain** of the ticket:
   - **Frontend only** → delegate all implementation work to `frontend-worker-agent`
   - **Backend only** → delegate all implementation work to `backend-worker-agent`
   - **Full-stack** → delegate frontend work to `frontend-worker-agent` and backend work to `backend-worker-agent`, running them in parallel where the tasks are independent, sequentially where one depends on the other (e.g. backend endpoint must exist before frontend fetches it)

   You (the orchestrator) handle: reading the ticket, asking questions, coordinating agents, and the final summary. The worker agents do the actual file edits.

4. **Questions** — list any ambiguities, edge cases, or missing information.
   Ask as many questions as needed, then wait for my input. After I answer the questions, you can start implementing.
   If you have no questions, do not break the session — just ask "Should I proceed?" with Yes/No options, and if I hit "Yes", implement the feature.

5. **If there are questions, wait for user confirmation** before touching any code.
   Do not proceed until the user explicitly says to go ahead — only if there are questions. If no questions, do the work.

6. Before starting work, read `.claude/testing/known-issues.md` and check if any known issue is relevant to this ticket. If one is, mention it to the user before proceeding.

7. Execute the ticket via the appropriate worker agent(s):
   - Use plan mode if the ticket touches more than 2 files
   - Make one logical change at a time
   - Flag anything unexpected mid-task rather than making assumptions

8. **Known issues clause** — after implementation, scan the files you touched (and any files you read along the way) for problems that were not part of the ticket scope:
   - Debug statements left in code (`console.log`, `console.error`, etc.)
   - Commented-out dead code blocks
   - TODO/FIXME comments not covered by an existing ticket
   - Obvious bugs or security issues (CORS `*`, hardcoded credentials, unhandled promise rejections)
   - Incomplete stubs (empty context files, commented-out imports)

   If you find any, append them to `.claude/testing/known-issues.md` under today's date. Do not fix them unless they are in scope — just record them. Tell the user what was added.

9. When done, summarize what was changed and ask:
   "Should I move this ticket to `.claude/tickets/done/`?"
