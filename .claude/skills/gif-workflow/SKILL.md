---
name: gif-workflow
description: "GIF project's complete git workflow orchestrator. Use for ANY git operation: committing code, pushing to remote, creating PRs, or handling PR review comments. Runs the full automated pipeline [commit → push → PR creation → comment response] or any subset. Triggers on: 'commit', 'push', 'create PR', 'PR 만들어줘', 'PR 올려줘', 'PR 생성', '커밋해줘', '푸쉬해줘', 'PR 코멘트 반영', '리뷰 반영', 'review comment 처리', '코멘트 처리', '코멘트 반영', git workflow, 'full git pipeline'. Also handles partial runs: 'just push', 'only create PR', 'handle comments only'. Re-runs, updates, and partial re-runs also trigger this skill."
---

# GIF Workflow Orchestrator

## Execution Mode
**Sub-agent pipeline** — sequential phases where each phase can depend on the previous.

Each phase agent is invoked via the `Agent` tool with `model: "opus"`.

---

## Phase 0: Context Check

Before running any phase, determine the current state:

```bash
git status
git log --oneline -5
git branch --show-current
git branch -r | findstr $(git branch --show-current)
gh pr list --head $(git branch --show-current) --json number,title,state 2>$null
```

| Condition | Phases to run |
|-----------|--------------|
| Uncommitted changes exist | 1 → 2 → 3 → (4 if PR has comments) |
| Commits ahead, not yet pushed | 2 → 3 → (4 if PR has comments) |
| Branch pushed, no PR yet | 3 → (4 if needed) |
| PR exists with unresolved comments | 4 only |
| User specifies a subset | Only the requested phases |

---

## Phase 1: Atomic Commits
**Agent:** `commit-agent`  
**Prompt template:**
> You are the commit-agent. Analyze all changes in the current working tree using `git diff` and `git status`. First run `npm run lint` — if it fails, stop and report the errors. Otherwise, split the changes into atomic logical units and create one commit per unit following the GIF commit conventions. Report all commits created.

1. Run `npm run lint` — if fails, **STOP** and report to user, do not continue
2. Analyze `git diff` and `git status`
3. Split changes into atomic units and commit each
4. Report commit list

---

## Phase 2: Push

```bash
# Check if upstream is set
git branch --show-current | xargs -I{} git rev-parse --abbrev-ref {}@{upstream} 2>$null

# Push (set upstream if not set)
git push origin $(git branch --show-current)
# or if no upstream:
git push -u origin $(git branch --show-current)
```

Report success with the remote branch URL.

---

## Phase 3: PR Creation
**Agent:** `pr-agent`  
**Prompt template:**
> You are the pr-agent. The current branch is `{branch_name}`. The commits in this branch are: `{commit_list}`. Create a PR using `gh pr create` following the GIF PR conventions: [type] prefix in title, correct git flow target branch, and fill all sections of the PR body template. Report the PR URL.

1. Infer target branch from branch name (git flow)
2. Infer PR type from most common commit type
3. Build and create PR
4. Report PR URL and number

---

## Phase 4: PR Comment Response
**Agent:** `review-agent`  
**Prompt template:**
> You are the review-agent. The PR number is `{pr_number}`. Fetch all review comments, evaluate each one individually, apply accepted changes as commits with lint validation, and reply to every comment with your decision and reasoning. Batch commits; push once at the end.

1. Fetch all review comments
2. Evaluate each comment (accept/reject)
3. Accepted: change code → lint → commit → record hash
4. Rejected: record reason
5. Push all changes once
6. Reply to each comment with decision + code snippet (if accepted)
7. Report summary

---

## Data Flow

```
Phase 0 (context) → determines which phases run
Phase 1 (commits) → commit list passed to Phase 3 prompt
Phase 3 (PR) → PR number passed to Phase 4 prompt
All phases → read git state directly via shell commands
```

---

## Error Handling

| Error | Action |
|-------|--------|
| Lint fails in Phase 1 | Stop, report errors, do NOT proceed to push/PR |
| Push conflict | Report error, stop — do NOT force push |
| PR already exists | Skip Phase 3, report existing PR URL |
| Comment fetch fails | Retry once; if still fails, report and skip Phase 4 |
| gh CLI not authenticated | Report `gh auth login` instruction to user |

---

## Test Scenarios

**Normal — full pipeline:**
> "이 변경사항 커밋하고 PR 만들어줘"
Expected: Phase 0 detects uncommitted changes → Phases 1 → 2 → 3. Commits created atomically, PR opened targeting `develop`, PR URL reported.

**Partial — comment response only:**
> "PR 코멘트 반영해줘"
Expected: Phase 0 detects existing PR → Phase 4 only. Every comment gets an individual reply.

**Error — lint fails:**
> "커밋해줘" with lint errors in changed files
Expected: Phase 1 lint check fails, commits blocked, errors reported to user, no push or PR.

**Partial — push only:**
> "그냥 푸쉬해줘"
Expected: Phase 0 detects commits ahead → Phase 2 only.
