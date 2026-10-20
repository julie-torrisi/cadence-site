// Builds data/stats.json from Julie's public GitHub activity + data/ship-log.json.
// Runs daily in GitHub Actions. Node 20+, no dependencies.
//   GITHUB_TOKEN  (provided by Actions)
//   OFFLINE=1     skip GitHub and use only the ship log (for local previews)
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const LOG = 'data/ship-log.json';
const OUT = 'data/stats.json';
const WEEKS = 12;
const TZ = 'America/New_York';
const AI_RE = /co-authored-by:\s*(claude|cursor|copilot)|generated with \[?claude code|claude-session:/i;
const SYSTEM_PATTERNS = [
  ['Skills', /(^|\/)SKILL\.md$/i],
  ['Rules files', /(^|\/)(CLAUDE|DESIGN|AGENTS)\.md$|(^|\/)\.cursor\/rules\/|\.cursorrules$/i],
  ['Prompts', /(^|\/)prompts?\/.+\.(md|txt)$|\.prompt\.md$/i],
  ['Evals', /(^|\/)evals?\/.+\.(json|jsonl|md|ya?ml)$|golden/i],
];

const log = JSON.parse(await readFile(LOG, 'utf8'));
const owner = log.owner;
const token = process.env.GITHUB_TOKEN;
const offline = process.env.OFFLINE === '1';

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (res.status === 404 || res.status === 409) return null; // missing or empty repo
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}
async function pages(path, max = 5) {
  const out = [];
  for (let p = 1; p <= max; p++) {
    const page = await gh(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${p}`);
    if (!page || !page.length) break;
    out.push(...page);
    if (page.length < 100) break;
  }
  return out;
}
const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

// ---- GitHub ----
const since = new Date(Date.now() - WEEKS * 7 * 864e5);
since.setUTCHours(0, 0, 0, 0);
const commitsByDay = {};
const aiByDay = {};
const system = Object.fromEntries(SYSTEM_PATTERNS.map(([k]) => [k, 0]));
let repos = [];
let totalCommits = 0, aiCommits = 0;

if (!offline) {
  repos = (await pages(`/users/${owner}/repos?type=owner&sort=pushed`)).filter((r) => !r.fork && !r.archived);
  for (const r of repos) {
    const commits = await pages(`/repos/${r.full_name}/commits?since=${since.toISOString()}`);
    for (const c of commits) {
      if (/^Update AI output stats/.test(c.commit.message)) continue; // skip this workflow's own commits
      const k = dayKey(c.commit.author?.date || c.commit.committer?.date);
      commitsByDay[k] = (commitsByDay[k] || 0) + 1;
      totalCommits++;
      if (AI_RE.test(c.commit.message)) { aiByDay[k] = (aiByDay[k] || 0) + 1; aiCommits++; }
    }
    const tree = await gh(`/repos/${r.full_name}/git/trees/${encodeURIComponent(r.default_branch)}?recursive=1`);
    for (const f of tree?.tree || []) {
      if (f.type !== 'blob') continue;
      for (const [k, re] of SYSTEM_PATTERNS) if (re.test(f.path)) { system[k]++; break; }
    }
  }
}

// ---- Ship log, with auto-ship on release ----
const items = [];
for (const it of log.items) {
  const item = { ...it };
  delete item.confirm;
  if (!offline && it.ship_on_release && it.status !== 'shipped') {
    const rel = await gh(`/repos/${it.ship_on_release}/releases/latest`);
    if (rel && !rel.draft && !rel.prerelease) {
      item.status = 'shipped';
      item.shipped = dayKey(rel.published_at);
      item.proof = [...(it.proof || []), { label: `Release ${rel.tag_name}`, url: rel.html_url }];
      if (!item.proof.some((p) => /github\.com/.test(p.url) && !/releases/.test(p.url))) {
        item.proof.push({ label: 'Code', url: `https://github.com/${it.ship_on_release}` });
      }
      item.auto_shipped = true;
    }
  }
  // Public builds with at least one real link only.
  if (item.visibility !== 'public') continue;
  if (!item.next && !(item.proof || []).some((p) => /^https:\/\//.test(p.url))) continue;
  items.push(item);
}

const shipped = items.filter((i) => i.status === 'shipped');
const shipDays = Object.fromEntries(shipped.map((i) => [i.shipped, i.name]));

// Activity grid: WEEKS columns x 7 days, oldest first, Monday-start weeks.
const today = new Date(new Date().toLocaleDateString('en-CA', { timeZone: TZ }) + 'T12:00:00Z');
const dow = (today.getUTCDay() + 6) % 7;
const start = new Date(today); start.setUTCDate(today.getUTCDate() - dow - (WEEKS - 1) * 7);
const grid = [];
let activeDays = 0;
for (let w = 0; w < WEEKS; w++) {
  const col = [];
  for (let d = 0; d < 7; d++) {
    const dt = new Date(start); dt.setUTCDate(start.getUTCDate() + w * 7 + d);
    const k = dt.toISOString().slice(0, 10);
    const n = commitsByDay[k] || 0;
    if (n && dt <= today) activeDays++;
    col.push({ date: k, commits: n, ai: aiByDay[k] || 0, ship: shipDays[k] || null, future: dt > today });
  }
  grid.push(col);
}

const counts = { exploring: 0, building: 0, shipped: 0, stopped: 0 };
items.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1; });
const speed = shipped
  .filter((i) => i.started && i.shipped)
  .map((i) => ({ name: i.name, days: Math.max(1, daysBetween(i.started, i.shipped)) }))
  .sort((a, b) => a.days - b.days);
const median = speed.length ? speed[Math.floor((speed.length - 1) / 2)].days : null;
const next = items.find((i) => i.next) || null;

const stats = {
  updated: new Date().toISOString(),
  sample: false,
  offline,
  owner,
  repos_tracked: repos.length,
  activity: { weeks: WEEKS, grid, active_days: activeDays, commits: totalCommits, ai_commits: aiCommits,
    ai_share: totalCommits ? Math.round((aiCommits / totalCommits) * 100) : null },
  funnel: { ...counts, started: items.filter((i) => !i.next).length },
  system,
  speed: { items: speed, median_days: median, stopped: counts.stopped },
  ledger: items.filter((i) => !i.next),
  next,
};

await mkdir('data', { recursive: true });
await writeFile(OUT, JSON.stringify(stats, null, 2));
console.log(`Wrote ${OUT}: ${shipped.length} shipped, ${totalCommits} commits (${aiCommits} AI co-authored), ${repos.length} repos.`);
