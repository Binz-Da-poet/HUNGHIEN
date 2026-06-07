import fs from 'fs';
import { execSync } from 'child_process';

const ALLOWLIST_PATH = 'security/audit-allowlist.json';

const raw = fs.readFileSync(ALLOWLIST_PATH, 'utf8');
const allowlist = JSON.parse(raw);

if (new Date(allowlist.expiresOn) < new Date()) {
  console.error('ERROR: Audit allowlist đã hết hạn (%s). Cập nhật expiresOn hoặc vá dependency.', allowlist.expiresOn);
  process.exit(1);
}

let auditOutput;
try {
  auditOutput = execSync('pnpm audit --prod --json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
} catch (e) {
  // pnpm audit exits non-zero when advisories exist, but still outputs JSON
  auditOutput = e.stdout || '';
}

const lines = auditOutput.trim().split('\n').filter(Boolean);
const advisories = lines.map(l => {
  try { return JSON.parse(l); } catch { return null; }
}).filter(Boolean);

const allowed = new Set(allowlist.advisories);
const criticalHigh = advisories.filter(
  a => (a.severity === 'critical' || a.severity === 'high') && !allowed.has(String(a.advisory_id))
);

if (criticalHigh.length > 0) {
  console.error('FAIL: Critical/High advisories không có trong allowlist:');
  criticalHigh.forEach(a => console.error('  %s: %s - %s', a.advisory_id, a.severity, a.title));
  process.exit(1);
}

console.log('PASS: Production audit — %d advisories, %d allowlisted', advisories.length, allowlist.advisories.length);
