// Tests for pure logic from app.jsx
// Run: node tests.mjs

let passed = 0, failed = 0;
const fail = (msg) => { failed++; console.error('  ✗', msg); };
const ok = (msg) => { passed++; console.log('  ✓', msg); };
const eq = (a, b, msg) => JSON.stringify(a) === JSON.stringify(b) ? ok(msg) : fail(`${msg}\n      expected: ${JSON.stringify(b)}\n      actual:   ${JSON.stringify(a)}`);
const truthy = (v, msg) => v ? ok(msg) : fail(msg);

// ========== Reproduce the pure helpers ==========
const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const parseDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const fmtDate = (s) => parseDate(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);

// ========== 1. Date helpers ==========
console.log('\n1. Date helpers');

eq(today().length, 10, 'today() returns YYYY-MM-DD');
truthy(/^\d{4}-\d{2}-\d{2}$/.test(today()), 'today() matches ISO local format');

eq(daysBetween('2026-03-01', '2026-03-08'), 7, 'daysBetween 1 week');
eq(daysBetween('2026-03-01', '2026-03-01'), 0, 'daysBetween same day');
eq(daysBetween('2026-03-08', '2026-03-01'), -7, 'daysBetween reversed = negative');

// Leap year (2024 was a leap year)
eq(daysBetween('2024-02-28', '2024-03-01'), 2, 'daysBetween across Feb 29 (leap)');
eq(daysBetween('2025-02-28', '2025-03-01'), 1, 'daysBetween across Feb (non-leap)');

// DST transitions in Europe (last Sunday of March → forward)
// 2026-03-29 is the DST start in EU (lose 1 hour). Math.round handles 23h day.
eq(daysBetween('2026-03-28', '2026-03-30'), 2, 'daysBetween across DST start (EU spring)');
// 2026-10-25 DST end (gain 1 hour, day = 25h)
eq(daysBetween('2026-10-24', '2026-10-26'), 2, 'daysBetween across DST end (EU fall)');

// Year boundary
eq(daysBetween('2025-12-31', '2026-01-01'), 1, 'daysBetween across year boundary');

// Month boundary
eq(daysBetween('2026-01-31', '2026-02-01'), 1, 'daysBetween across month boundary');

// fmtDate
truthy(typeof fmtDate('2026-03-01') === 'string', 'fmtDate returns string');
truthy(fmtDate('2026-03-01').length > 0, 'fmtDate non-empty');

// ========== 2. Session save/update logic ==========
console.log('\n2. Session save/update');

// Reproduce the upsert logic from saveSession
const upsertSession = (sessions, session) => [
  ...sessions.filter(s => !(s.date === session.date && s.programId === session.programId)),
  session,
];

let sessions = [];
sessions = upsertSession(sessions, { date: '2026-04-19', programId: 1, logs: { dips_l: [{ weight: 20, reps: 3 }] }, notes: '' });
eq(sessions.length, 1, 'first session inserted');
eq(sessions[0].logs.dips_l[0].weight, 20, 'set weight stored');

// Update set #1 weight to 22.5
sessions = upsertSession(sessions, { date: '2026-04-19', programId: 1, logs: { dips_l: [{ weight: 22.5, reps: 3 }] }, notes: '' });
eq(sessions.length, 1, 'update preserves count (no duplicate)');
eq(sessions[0].logs.dips_l[0].weight, 22.5, 'set weight updated');

// Add second exercise
sessions = upsertSession(sessions, { date: '2026-04-19', programId: 1, logs: { dips_l: [{ weight: 22.5, reps: 3 }], bench_c: [{ weight: 60, reps: 10 }] }, notes: 'felt strong' });
eq(Object.keys(sessions[0].logs).length, 2, 'second exercise added');
eq(sessions[0].notes, 'felt strong', 'notes saved');

// Different day, same program → distinct session
sessions = upsertSession(sessions, { date: '2026-04-20', programId: 1, logs: {}, notes: '' });
eq(sessions.length, 2, 'different date keeps as separate session');

// Different program same day → distinct session
sessions = upsertSession(sessions, { date: '2026-04-19', programId: 2, logs: {}, notes: '' });
eq(sessions.length, 3, 'different programId keeps as separate session');

// ========== 3. Body upsert + sort ==========
console.log('\n3. Body upsert + sort');

const upsertBody = (body, entry) => [
  ...body.filter(e => e.date !== entry.date),
  entry,
].sort((a, b) => a.date.localeCompare(b.date));

let body = [{ date: '2026-03-01', weight: 80.7, bf: 16.6 }];
body = upsertBody(body, { date: '2026-04-15', weight: 78.2, bf: 14.5 });
body = upsertBody(body, { date: '2026-03-15', weight: 79.8, bf: 15.8 });
eq(body.map(b => b.date), ['2026-03-01', '2026-03-15', '2026-04-15'], 'body sorted ascending by date');

body = upsertBody(body, { date: '2026-03-15', weight: 79.5, bf: null });
eq(body.length, 3, 'updating same date does not duplicate');
eq(body.find(b => b.date === '2026-03-15').weight, 79.5, 'body update applied');

// ========== 4. JSON export/import roundtrip ==========
console.log('\n4. JSON export/import roundtrip');

const original = {
  sessions: [{ date: '2026-04-19', programId: 1, programName: 'Push Force', logs: { dips_l: [{ weight: 22.5, reps: 3 }, { weight: 22.5, reps: 3 }] }, notes: 'pump fou' }],
  body: [{ date: '2026-03-01', weight: 80.7, bf: 16.6 }],
  gtg: { '2026-04-19': 4, '2026-04-18': 6 },
};
const json = JSON.stringify(original, null, 2);
const restored = JSON.parse(json);
eq(restored, original, 'roundtrip preserves structure');
eq(restored.sessions[0].logs.dips_l[1].reps, 3, 'nested arrays preserved');
eq(restored.gtg['2026-04-19'], 4, 'gtg map preserved');

// Validation logic from handleImport
const validateImport = (d) => {
  if (!d || typeof d !== 'object') throw new Error('not object');
  const validSessions = Array.isArray(d.sessions) ? d.sessions.filter(s => s && typeof s.date === 'string' && typeof s.programId === 'number') : null;
  const validBody = Array.isArray(d.body) ? d.body.filter(b => b && typeof b.date === 'string' && typeof b.weight === 'number') : null;
  const validGtg = d.gtg && typeof d.gtg === 'object' && !Array.isArray(d.gtg) ? d.gtg : null;
  return { sessions: validSessions, body: validBody, gtg: validGtg };
};

const v = validateImport(restored);
eq(v.sessions.length, 1, 'import keeps valid sessions');
eq(v.body.length, 1, 'import keeps valid body');
eq(Object.keys(v.gtg).length, 2, 'import keeps gtg');

// Malicious / malformed
let threw = false;
threw = false; try { validateImport(null); } catch { threw = true; }
truthy(threw, 'null payload throws');
threw = false; try { validateImport('hack'); } catch { threw = true; }
truthy(threw, 'string payload throws');

const dirty = validateImport({ sessions: [{ date: 123, programId: 'oops' }, { date: '2026-04-19', programId: 1 }], body: [{ date: '2026-04-19' }, { date: '2026-04-20', weight: 75 }], gtg: [] });
eq(dirty.sessions.length, 1, 'invalid sessions filtered out');
eq(dirty.body.length, 1, 'invalid body filtered out');
eq(dirty.gtg, null, 'gtg as array rejected');

// ========== 5. localStorage quota simulation ==========
console.log('\n5. localStorage quota simulation');

const fakeStorage = {
  data: {},
  setItem(k, v) {
    if (this.full) { const e = new Error('QuotaExceeded'); e.name = 'QuotaExceededError'; throw e; }
    this.data[k] = v;
  },
};
const saveKey = (storage, key, val) => { try { storage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } };

eq(saveKey(fakeStorage, 'k', { a: 1 }), true, 'normal save returns true');
fakeStorage.full = true;
eq(saveKey(fakeStorage, 'k', { a: 2 }), false, 'quota exceeded returns false (no throw)');

// ========== 6. PR logic ==========
console.log('\n6. PR logic — max preserved through regression');

const getPRHistory = (sessions, exId, type) => {
  const entries = [];
  sessions.forEach(s => {
    const exLogs = s.logs?.[exId] || [];
    let best = null;
    exLogs.forEach(l => {
      if (!l) return;
      if (type === 'weight' && l.weight != null && l.reps != null && l.reps > 0) {
        if (!best || l.weight > best.value) best = { date: s.date, value: l.weight, reps: l.reps };
      } else if (type === 'reps' && l.reps != null && l.reps > 0) {
        if (!best || l.reps > best.value) best = { date: s.date, value: l.reps };
      }
    });
    if (best) entries.push(best);
  });
  return entries.sort((a, b) => a.date.localeCompare(b.date));
};

const prSessions = [
  { date: '2026-03-01', programId: 1, logs: { dips_l: [{ weight: 20, reps: 3 }, { weight: 20, reps: 3 }] } },
  { date: '2026-03-08', programId: 1, logs: { dips_l: [{ weight: 22.5, reps: 3 }, { weight: 22.5, reps: 2 }] } },
  { date: '2026-03-15', programId: 1, logs: { dips_l: [{ weight: 25, reps: 3 }] } }, // PR
  { date: '2026-03-22', programId: 1, logs: { dips_l: [{ weight: 22.5, reps: 3 }] } }, // regression
];
const hist = getPRHistory(prSessions, 'dips_l', 'weight');
eq(hist.length, 4, 'PR history covers all sessions with data');
const pr = hist.reduce((max, e) => !max || e.value > max.value ? e : max, null);
eq(pr.value, 25, 'PR remains max value (25kg) despite later regression');
eq(pr.date, '2026-03-15', 'PR date is the historical max date');
eq(hist[hist.length - 1].value, 22.5, 'latest perf is 22.5 (regression visible)');

// PR for reps type
const repsSessions = [
  { date: '2026-03-01', logs: { trac_max: [{ reps: 5 }] } },
  { date: '2026-03-08', logs: { trac_max: [{ reps: 8 }] } },
  { date: '2026-03-15', logs: { trac_max: [{ reps: 6 }] } },
];
const repsHist = getPRHistory(repsSessions, 'trac_max', 'reps');
const repsPR = repsHist.reduce((max, e) => !max || e.value > max.value ? e : max, null);
eq(repsPR.value, 8, 'reps PR correct');
eq(repsPR.date, '2026-03-08', 'reps PR date correct');

// Empty / null logs
const emptyHist = getPRHistory([{ date: '2026-03-01', logs: { dips_l: [null, {}, { weight: null, reps: 0 }] } }], 'dips_l', 'weight');
eq(emptyHist.length, 0, 'no PR from empty/null/zero logs');

// ========== 7. GTG aggregation ==========
console.log('\n7. GTG aggregation');

const aggregateGtgByWeek = (gtg) => {
  const byWeek = {};
  Object.entries(gtg).forEach(([date, count]) => {
    const d = parseDate(date);
    const st = new Date(d);
    st.setDate(d.getDate() - d.getDay());
    const y = st.getFullYear();
    const m = String(st.getMonth() + 1).padStart(2, '0');
    const day = String(st.getDate()).padStart(2, '0');
    const k = `${y}-${m}-${day}`;
    byWeek[k] = (byWeek[k] || 0) + count;
  });
  return byWeek;
};

const weeks = aggregateGtgByWeek({
  '2026-04-13': 4, // Mon
  '2026-04-14': 5, // Tue
  '2026-04-15': 6, // Wed (same week as 13/14, week starts Sunday 2026-04-12)
  '2026-04-20': 3, // Mon (next week)
});
eq(weeks['2026-04-12'], 15, 'week of Apr 12 sums Mon+Tue+Wed = 15');
eq(weeks['2026-04-19'], 3, 'week of Apr 19 has just Apr 20 = 3');

// ========== Summary ==========
console.log(`\n${'='.repeat(40)}`);
console.log(`Tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
