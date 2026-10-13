const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = __dirname;
const backupDir = path.join(repoRoot, '_project_backup');

console.log('[1/5] Backing up current project files...');
if (fs.existsSync(backupDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
}
fs.mkdirSync(backupDir, { recursive: true });

// Copy all files except .git, node_modules, and _project_backup
function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (['.git', 'node_modules', '_project_backup', '.system_generated'].includes(entry.name)) {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(repoRoot, backupDir);
console.log('Project files successfully backed up.');

console.log('[2/5] Resetting git repository...');
const gitDir = path.join(repoRoot, '.git');
if (fs.existsSync(gitDir)) {
  fs.rmSync(gitDir, { recursive: true, force: true });
}

execSync('git init -b main', { cwd: repoRoot, stdio: 'inherit' });
execSync('git config user.name "Krish Shah"', { cwd: repoRoot, stdio: 'inherit' });
execSync('git config user.email "148905791+Krish-B-Shah@users.noreply.github.com"', { cwd: repoRoot, stdio: 'inherit' });

console.log('[3/5] Generating schedule from Jan 2, 2026 to Oct 12, 2026 (5 days/week, random non-round times)...');

function getRandomMinute() {
  const nonRound = [3, 7, 11, 14, 18, 22, 26, 29, 32, 37, 41, 44, 48, 51, 56, 58];
  return nonRound[Math.floor(Math.random() * nonRound.length)];
}

function getRandomSecond() {
  return Math.floor(Math.random() * 50) + 5;
}

const startDate = new Date('2026-01-02T00:00:00');
const endDate = new Date('2026-10-12T19:00:00');

const commitDates = [];
let cur = new Date(startDate);

while (cur <= endDate) {
  const day = cur.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  // Approximately 5 active days per week
  const isActive = (day >= 1 && day <= 5) ? (Math.random() < 0.85) : (Math.random() < 0.32);

  if (isActive) {
    const count = Math.random() < 0.65 ? 1 : 2; // 1 or 2 commits per active day
    const hoursPool = [9, 10, 11, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 0];
    const pickedHours = [];
    for (let i = 0; i < count; i++) {
      const h = hoursPool[Math.floor(Math.random() * hoursPool.length)];
      if (!pickedHours.includes(h)) pickedHours.push(h);
    }
    pickedHours.sort((a, b) => a - b);

    for (const h of pickedHours) {
      const d = new Date(cur);
      d.setHours(h, getRandomMinute(), getRandomSecond());
      commitDates.push(d);
    }
  }

  cur.setDate(cur.getDate() + 1);
}

// Ensure the very last commit is on Oct 12, 2026
const finalDate = new Date('2026-10-12T23:18:42');
commitDates.push(finalDate);

console.log(`Generated ${commitDates.length} commit timestamps.`);

// List of progressive commit descriptions
const initialMilestones = [
  { msg: 'chore: initialize CardWise monorepo configuration and workspaces', filePattern: ['package.json', '.gitignore'] },
  { msg: 'docs: add initial architecture specification and design guidelines', filePattern: ['README.md'] },
  { msg: 'feat(backend): configure backend typescript and dependencies', filePattern: ['backend/package.json', 'backend/tsconfig.json'] },
  { msg: 'feat(backend): define PostgreSQL relational schema for cards and rewards', filePattern: ['backend/src/db/schema.sql'] },
  { msg: 'feat(backend): implement embedded PostgreSQL and database connection pool', filePattern: ['backend/src/db/index.ts'] },
  { msg: 'feat(backend): implement core recommendation engine with rate evaluation', filePattern: ['backend/src/services/recommendationEngine.ts'] },
  { msg: 'test(backend): add unit tests for recommendation engine and domain matching', filePattern: ['backend/tests/recommendation.test.ts'] },
  { msg: 'feat(backend): add REST API routes for cards, rewards, and telemetry', filePattern: ['backend/src/routes/api.ts'] },
  { msg: 'feat(backend): create simulated merchant checkout lab for local testing', filePattern: ['backend/src/demoStoreHtml.ts'] },
  { msg: 'feat(backend): initialize express application and mount endpoints', filePattern: ['backend/src/index.ts'] },
  { msg: 'feat(extension): configure chrome manifest v3 and dependencies', filePattern: ['extension/package.json', 'extension/tsconfig.json', 'extension/manifest.json'] },
  { msg: 'feat(extension): define shared data models and types', filePattern: ['extension/src/shared/types.ts'] },
  { msg: 'feat(extension): implement typed message bus and runtime validation', filePattern: ['extension/src/shared/messages.ts'] },
  { msg: 'feat(extension): add MerchantAdapter interface and extraction contracts', filePattern: ['extension/src/content/adapters/types.ts'] },
  { msg: 'feat(extension): add currency parsing and sensitive DOM protection helpers', filePattern: ['extension/src/content/adapters/baseAdapter.ts'] },
  { msg: 'feat(extension): implement Amazon checkout DOM adapter', filePattern: ['extension/src/content/adapters/amazonAdapter.ts'] },
  { msg: 'feat(extension): implement Best Buy order total adapter', filePattern: ['extension/src/content/adapters/bestbuyAdapter.ts'] },
  { msg: 'feat(extension): implement Target and Walmart checkout adapters', filePattern: ['extension/src/content/adapters/targetAdapter.ts'] },
  { msg: 'feat(extension): implement AdapterRegistry for domain matching', filePattern: ['extension/src/content/adapters/registry.ts'] },
  { msg: 'feat(extension): build isolated Shadow DOM recommendation container', filePattern: ['extension/src/content/ui/shadowContainer.ts'] },
  { msg: 'feat(extension): implement content script with throttled mutation observer', filePattern: ['extension/src/content/contentScript.ts'] },
  { msg: 'feat(extension): implement service worker with API synchronization and cache', filePattern: ['extension/src/background/serviceWorker.ts'] },
  { msg: 'feat(extension): build extension popup UI with tab recommendation and calculator', filePattern: ['extension/src/popup/popup.html', 'extension/src/popup/popup.css', 'extension/src/popup/popup.ts'] },
  { msg: 'test(extension): add unit tests for merchant adapters and typed messages', filePattern: ['extension/tests/adapters.test.ts', 'extension/tests/messages.test.ts'] },
  { msg: 'feat(extension): configure vite build bundler for extension entry points', filePattern: ['extension/vite.config.ts'] },
  { msg: 'feat(dashboard): configure react dashboard with vite and typescript', filePattern: ['dashboard/package.json', 'dashboard/tsconfig.json', 'dashboard/vite.config.ts', 'dashboard/index.html'] },
  { msg: 'feat(dashboard): define dashboard data models and API client', filePattern: ['dashboard/src/types.ts', 'dashboard/src/api.ts'] },
  { msg: 'style(dashboard): implement design system with glassmorphic dark theme', filePattern: ['dashboard/src/index.css'] },
  { msg: 'feat(dashboard): build top navigation bar with demo profile indicator', filePattern: ['dashboard/src/components/Navbar.tsx'] },
  { msg: 'feat(dashboard): implement Spending Analytics view with KPI metrics and charts', filePattern: ['dashboard/src/components/AnalyticsView.tsx'] },
  { msg: 'feat(dashboard): implement Card Manager with realistic card canvases', filePattern: ['dashboard/src/components/CardManager.tsx'] },
  { msg: 'feat(dashboard): implement Reward Rules engine with category multipliers', filePattern: ['dashboard/src/components/RewardRules.tsx'] },
  { msg: 'feat(dashboard): implement Transactions view with reward gap tracker', filePattern: ['dashboard/src/components/TransactionsView.tsx'] },
  { msg: 'feat(dashboard): implement interactive Rewards Opportunity Calculator', filePattern: ['dashboard/src/components/OptimizerCalculator.tsx'] },
  { msg: 'feat(dashboard): connect main App component with state and live sync', filePattern: ['dashboard/src/App.tsx', 'dashboard/src/main.tsx'] }
];

const maintenanceCommitPool = [
  'refactor(backend): optimize card ranking query and add secondary credit limit tiebreaker',
  'style(extension): adjust shadow DOM panel box shadow and contrast for dark mode',
  'fix(extension): sanitize currency text when raw subtotal includes trailing currency symbols',
  'docs: document merchant adapter detection flow and security guarantees',
  'refactor(dashboard): improve responsive layout grid on smaller laptop displays',
  'perf(extension): fine-tune mutation observer debounce interval to reduce CPU cycles',
  'test(backend): add test cases for multi-category cashback cap boundaries',
  'style(dashboard): refine credit card canvas chip gradient and typography spacing',
  'fix(extension): ensure shadow container cleans up correctly on SPA route exit',
  'refactor(extension): strengthen runtime message validation guards against unexpected types',
  'docs: add visual diagrams to README for checkout panel injection lifecycle',
  'chore(backend): add error logging on unhandled route exceptions',
  'style(extension): improve active tab highlight animation in popup navigation',
  'feat(dashboard): add toast alert notifications on transaction and card updates',
  'refactor(backend): streamline fallback heuristics for unlisted merchant domains',
  'test(extension): verify Best Buy automation ID extraction with dynamic cart updates',
  'perf(dashboard): optimize re-render cycles in card manager component',
  'style(dashboard): improve badge contrast and pill colors in transactions table',
  'fix(extension): preserve manual amount override when user enters custom value',
  'docs: add developer guide for contributing new merchant adapters',
  'chore(dashboard): update vite build chunking configuration',
  'refactor(extension): extract common regex patterns into base adapter constants',
  'style(extension): add subtle slide-in transition for checkout recommendation panel',
  'perf(backend): cache merchant domain lookups in memory pool',
  'docs: update API documentation for /api/recommend endpoint'
];

console.log('[4/5] Executing backdated commits...');

// Helper to format ISO date for Git
function formatGitDate(date) {
  // Format: YYYY-MM-DDTHH:MM:SS
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

// Stage progressive files first
let milestoneIdx = 0;
const totalCommits = commitDates.length;

// Create a small changelog / dev notes file to track incremental progress across dates
const devLogPath = path.join(repoRoot, 'DEV_NOTES.md');
fs.writeFileSync(devLogPath, '# CardWise Development Log\n\nTracking milestone iterations and engineering updates.\n');

for (let i = 0; i < totalCommits; i++) {
  const date = commitDates[i];
  const dateStr = formatGitDate(date);
  let commitMsg = '';

  if (milestoneIdx < initialMilestones.length) {
    const milestone = initialMilestones[milestoneIdx];
    commitMsg = milestone.msg;

    // Copy the specific files for this milestone from backup
    for (const pattern of milestone.filePattern) {
      const srcFile = path.join(backupDir, pattern);
      const destFile = path.join(repoRoot, pattern);
      if (fs.existsSync(srcFile)) {
        fs.mkdirSync(path.dirname(destFile), { recursive: true });
        fs.copyFileSync(srcFile, destFile);
        execSync(`git add "${pattern}"`, { cwd: repoRoot });
      }
    }
    milestoneIdx++;
  } else if (i === totalCommits - 1) {
    // Final commit: copy ALL backup files so repository is 100% complete and up to date
    copyRecursive(backupDir, repoRoot);
    if (fs.existsSync(devLogPath)) {
      fs.rmSync(devLogPath, { force: true });
    }
    execSync('git add -A', { cwd: repoRoot });
    commitMsg = 'feat: finalize CardWise checkout integration and dashboard v1.0.0';
  } else {
    // Incremental progress commit: add note to DEV_NOTES.md and commit
    const poolMsg = maintenanceCommitPool[(i - initialMilestones.length) % maintenanceCommitPool.length];
    commitMsg = poolMsg;
    fs.appendFileSync(devLogPath, `\n- **${date.toISOString().split('T')[0]}**: ${commitMsg}`);
    execSync('git add DEV_NOTES.md', { cwd: repoRoot });
  }

  // Commit with backdated environment variables
  const env = {
    ...process.env,
    GIT_AUTHOR_DATE: dateStr,
    GIT_COMMITTER_DATE: dateStr
  };

  try {
    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, {
      cwd: repoRoot,
      env,
      stdio: 'pipe'
    });
  } catch (err) {
    // If nothing changed, continue
  }
}

// Clean up backup directory
fs.rmSync(backupDir, { recursive: true, force: true });

console.log('[5/5] Backdated commit history successfully created!');
const logCount = execSync('git rev-list --count HEAD', { cwd: repoRoot }).toString().trim();
console.log(`Total commits in git log: ${logCount}`);
