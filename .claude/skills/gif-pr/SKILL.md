---
name: gif-pr
description: "Creates GitHub Pull Requests for the GIF project using the project's PR template with [type] prefix titles and git flow branch targeting (feature/* → develop, hotfix/* → main). Use when asked to create a PR, open a pull request, or submit work for review. Triggers on: 'create PR', 'PR 만들어줘', 'PR 올려줘', 'PR 생성', 'pull request', '풀리퀘', 'open PR', 'PR 올려줘'. Does NOT trigger for committing code, pushing, or handling review comments."
---

# GIF PR Creation Skill

## PR Title Format
```
[{type}] {Korean description}
```

Infer `{type}` from the most common commit type in the branch vs `develop`:
```bash
git log develop..HEAD --oneline | grep -oP '^\w+(?=:)' | sort | uniq -c | sort -rn | head -1
```

## Git Flow Branch Targets
| Source branch prefix | Target branch |
|---------------------|---------------|
| `feature/*` | `develop` |
| `fix/*` | `develop` |
| `hotfix/*` | `main` |
| `release/*` | `main` |
| (anything else) | `develop` |

## PR Body Template
Fill every section. Base template from `.github/workflows/PULL_REQUEST_TEMPLATE.md`:

```markdown
## ❓ 개요

{1-2 sentence summary of what this PR does and why}

## #️⃣ 연관된 이슈

{#issue_number or 없음}

## 📝 작업 내용

{bullet list — one item per commit or logical change group, derived from git log}

## 📄 리뷰 요청사항

{specific areas for reviewer focus, or 없음}

## 📸 스크린샷/영상(선택)

{screenshots/videos if UI changes; omit if not applicable}
```

## Creation Command
```bash
# Push branch first if not yet pushed
git push -u origin $(git branch --show-current)

# Create PR
gh pr create \
  --title "[{type}] {description}" \
  --body "$(cat <<'EOF'
{filled PR body}
EOF
)" \
  --base {target_branch}
```

## After Creation
Report the PR URL and number to the user.
