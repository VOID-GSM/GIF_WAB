# Runs lint before any non-amend git commit to prevent bad commits reaching the remote.
# Receives Claude tool input as JSON on stdin.
try {
    $raw = [Console]::In.ReadToEnd()
    if (-not $raw) { exit 0 }

    $data = $raw | ConvertFrom-Json
    $cmd  = $data.command

    if ($cmd -and ($cmd -match 'git commit') -and ($cmd -notmatch '--amend')) {
        Write-Host "[pre-commit] Running lint check..."
        npm run lint 2>&1 | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[pre-commit] Lint failed. Fix the errors above before committing."
            exit 1
        }
        Write-Host "[pre-commit] Lint passed."
    }
} catch {
    # Non-JSON input or unexpected error — don't block the bash call.
}
exit 0
