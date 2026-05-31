// Runs lint before any non-amend git commit to prevent bad commits reaching the remote.
// Receives Claude tool input as JSON on stdin. Works on macOS, Linux, and Windows.
const fs = require('fs');
const { execSync } = require('child_process');

try {
  const raw = fs.readFileSync(0, 'utf-8');
  if (!raw) process.exit(0);

  const data = JSON.parse(raw);
  const cmd = data.command;

  if (cmd && cmd.includes('git commit') && !cmd.includes('--amend')) {
    console.log('[pre-commit] Running lint check...');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      console.log('[pre-commit] Lint passed.');
    } catch {
      console.error('[pre-commit] Lint failed. Fix the errors above before committing.');
      process.exit(1);
    }
  }
} catch {
  // Non-JSON input or unexpected error — don't block the bash call.
}
process.exit(0);
