---
description: Execute all pending tickets one by one — implement, commit, push, archive, repeat
---

**Permission mode:** Run in auto mode. Do not pause for routine tool calls (file reads, edits, grep, git). Only stop for confirmation when an action is destructive or irreversible beyond what is described here.

You are a ticket loop orchestrator. Work through every pending ticket in `.claude/tickets/` sequentially until none remain.

## Loop protocol

Repeat the following steps until no tickets remain in `.claude/tickets/` (excluding the `done/` subdirectory):

### 1 — Pick the next ticket

List `.claude/tickets/` and take the **lexicographically first** `.md` file that is not inside `done/`. If none exist, print "No more tickets. Done." and stop.

### 2 — Announce

Print:
```
=== Ticket: <filename> ===
```

### 3 — Read & summarize

Read the ticket file. Print a 2-sentence summary of what needs to be built.

### 4 — Check known issues

Read `.claude/testing/known-issues.md` and mention any entry relevant to this ticket before starting.

### 5 — Implement

Determine the domain and delegate exactly as the `/ticket` command does:
- **Frontend only** → `frontend-worker-agent`
- **Backend only** → `backend-worker-agent`
- **Full-stack** → both agents, parallel where independent, sequential where one depends on the other

Do not ask clarifying questions. Make reasonable implementation decisions autonomously and note any assumptions in your summary. If you hit a genuine blocker (missing env value, missing dependency, ambiguous schema conflict) — stop the entire loop and report it to the user.

### 6 — Known-issues scan

After implementation, scan touched files for:
- Debug statements (`console.log`, `console.error`, etc.)
- Commented-out dead code
- TODO/FIXME not covered by an existing ticket
- Obvious bugs or security issues
- Incomplete stubs

Append findings to `.claude/testing/known-issues.md` under today's date. Do not fix them.

### 7 — Stage & commit

Run:
```
git add -A
```

Extract the commit message from the ticket's `# TICKET-NNN: TITLE` heading — use only the **TITLE** part (strip the `# TICKET-NNN: ` prefix).

Commit:
```
git commit -m "<TITLE>"
```

If the commit fails (nothing staged, hook error, etc.) — stop the loop and report the error.

### 8 — Push

```
git push
```

If push fails — stop the loop and report the error.

### 9 — Archive ticket

Move the ticket file from `.claude/tickets/<filename>` to `.claude/tickets/done/<filename>`:
```
mv .claude/tickets/<filename> .claude/tickets/done/<filename>
```

### 10 — Next iteration

Go back to step 1.
