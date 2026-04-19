const { useState, useEffect, useMemo, useRef } = React;
const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, CartesianGrid } = Recharts;

// ========== ICONS ==========
const makeIcon = (paths) => ({size=20, className='', strokeWidth=2}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>{paths}</svg>
);
const Dumbbell = makeIcon(<><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></>);
const HomeIcon = makeIcon(<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>);
const Trophy = makeIcon(<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>);
const Heart = makeIcon(<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>);
const TrendingUp = makeIcon(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>);
const Plus = makeIcon(<><path d="M5 12h14"/><path d="M12 5v14"/></>);
const Minus = makeIcon(<path d="M5 12h14"/>);
const Check = makeIcon(<polyline points="20 6 9 17 4 12"/>);
const Calendar = makeIcon(<><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></>);
const Flame = makeIcon(<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>);
const Target = makeIcon(<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>);
const Zap = makeIcon(<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>);
const X = makeIcon(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>);
const ChevronRight = makeIcon(<path d="m9 18 6-6-6-6"/>);
const Award = makeIcon(<><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></>);
const Cloud = makeIcon(<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>);
const CloudOff = makeIcon(<><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193"/><path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07"/></>);

// ========== DATA ==========
const PROGRAM = {
  1: { name: 'Push Force', day: 'Lundi', focus: 'Force max dips',
    exercises: [
      { id: 'dips_l', name: 'Dips lestés', sets: 5, reps: '3', rest: '3-4 min', rpe: 8, weighted: true, pr: true, note: '+1-2.5 kg/sem' },
      { id: 'bench_c', name: 'Bench press prise serrée', sets: 3, reps: '10', rest: '2 min', rpe: 8, weighted: true },
      { id: 'oh_tri', name: 'Overhead triceps corde', sets: 3, reps: '12', rest: '60s', rpe: 8, weighted: true },
      { id: 'tri_uni', name: 'Triceps unilatéral poulie', sets: 3, reps: '10', rest: '60s', rpe: 8, weighted: true },
    ]},
  2: { name: 'Pull Force', day: 'Mardi', focus: 'Tractions + biceps',
    exercises: [
      { id: 'trac_max', name: 'Traction PDC test max', sets: 1, reps: 'max', rest: '2 min', rpe: 10, pr: true, note: 'Tracking hebdo' },
      { id: 'trac_neg', name: 'Tractions négatives lentes (5-7s)', sets: 3, reps: '3', rest: '2-3 min', rpe: 8 },
      { id: 'trac_el', name: 'Tractions élastique assistées', sets: 3, reps: '5-8', rest: '2 min', rpe: 8 },
      { id: 'row', name: 'Tirage horizontal', sets: 3, reps: '12', rest: '90s', rpe: 8, weighted: true },
      { id: 'curl_inc', name: 'Curl biceps incliné', sets: 3, reps: '10', rest: '60s', rpe: 8, weighted: true },
      { id: 'curl_ham', name: 'Curl hammer poulie', sets: 3, reps: '10', rest: '60s', rpe: 8, weighted: true },
    ]},
  3: { name: 'Legs', day: 'Mercredi', focus: 'Quads + ischios',
    exercises: [
      { id: 'belt_sq', name: 'Belt squat (ou hack squat lourd)', sets: 5, reps: '3', rest: '3 min', rpe: 8, weighted: true, pr: true, note: 'Zéro charge rachis' },
      { id: 'hack_sq', name: 'Hack squat machine', sets: 3, reps: '10', rest: '2 min', rpe: 8, weighted: true },
      { id: 'bulg', name: 'Fentes bulgares', sets: 3, reps: '10/jambe', rest: '90s', rpe: 8, weighted: true },
      { id: 'leg_curl', name: 'Leg curl assis', sets: 3, reps: '12', rest: '60s', rpe: 8, weighted: true },
    ]},
  4: { name: 'Push Volume', day: 'Jeudi', focus: 'Volume + transition MU',
    exercises: [
      { id: 'dips_max', name: 'Dips PDC max reps', sets: 5, reps: 'max', rest: '2 min', rpe: 9, pr: true, note: 'Note reps cumulés' },
      { id: 'dips_sb', name: 'Dips barre droite', sets: 3, reps: '5-8', rest: '2 min', rpe: 8, note: 'Phase push MU' },
      { id: 'bench_c2', name: 'Bench prise serrée', sets: 3, reps: '10', rest: '90s', rpe: 8, weighted: true },
      { id: 'tri_uni2', name: 'Triceps unilatéral poulie', sets: 3, reps: '10', rest: '60s', rpe: 8, weighted: true },
    ]},
  5: { name: 'Pull Volume + Skill MU', day: 'Vendredi', focus: 'Volume pull + muscle-up',
    exercises: [
      { id: 'trac_vol', name: 'Tractions max reps', sets: 3, reps: 'max', rest: '2-3 min', rpe: 9, pr: true, note: 'Compare vs sem passée' },
      { id: 'mu_neg', name: 'Muscle-up négatifs (5s)', sets: 4, reps: '2-3', rest: '2-3 min', rpe: 8 },
      { id: 'row2', name: 'Tirage horizontal', sets: 3, reps: '12', rest: '90s', rpe: 8, weighted: true },
      { id: 'curl_inc2', name: 'Curl biceps incliné', sets: 3, reps: '10', rest: '60s', rpe: 8, weighted: true },
      { id: 'fg_sus', name: 'Fausse prise suspensions', sets: 3, reps: '15-20s', rest: '60s', rpe: 7 },
      { id: 'mu_try', name: 'Tentatives MU (si 5+ tractions)', sets: 6, reps: '1', rest: '2 min', rpe: 9, pr: true },
    ]},
  0: { name: 'Repos', day: 'Dimanche', focus: 'Meal prep', exercises: [] },
  6: { name: 'Repos', day: 'Samedi', focus: 'Récupération', exercises: [] },
};
const MACROS = { training: { kcal: 1650, p: 170, l: 45, g: 140 }, off: { kcal: 1400, p: 170, l: 50, g: 80 } };
const BASELINE = { weight: 80.70, bf: 16.6, date: '2026-03-01' };
const GOAL = { weight: 72.5, bf: 10 };

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
const fmtDateFull = (s) => parseDate(s).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long' });
const daysBetween = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000);

const load = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
const saveKey = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { console.error('Storage failed', e); return false; } };

function App() {
  const [tab, setTab] = useState('home');
  const [sessions, setSessions] = useState([]);
  const [body, setBody] = useState([]);
  const [gtg, setGtg] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const s = load('st-sessions', []);
    const b = load('st-body', null);
    const g = load('st-gtg', {});
    setSessions(Array.isArray(s) ? s : []);
    if (b === null || !Array.isArray(b) || b.length === 0) {
      const init = [{ date: BASELINE.date, weight: BASELINE.weight, bf: BASELINE.bf }];
      setBody(init);
      setStorageOk(saveKey('st-body', init));
    } else setBody(b);
    setGtg(g && typeof g === 'object' && !Array.isArray(g) ? g : {});
    setLoaded(true);
  }, []);

  const persist = (key, val) => { const ok = saveKey(key, val); setStorageOk(ok); if (ok) setLastSaved(Date.now()); return ok; };

  const saveSession = (session) => {
    setSessions(prev => {
      const updated = [...prev.filter(s => !(s.date === session.date && s.programId === session.programId)), session];
      persist('st-sessions', updated);
      return updated;
    });
  };
  const deleteSession = (date, programId) => {
    setSessions(prev => { const u = prev.filter(s => !(s.date === date && s.programId === programId)); persist('st-sessions', u); return u; });
  };
  const saveBody = (entry) => {
    setBody(prev => { const u = [...prev.filter(e => e.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)); persist('st-body', u); return u; });
  };
  const deleteBody = (date) => {
    setBody(prev => { const u = prev.filter(e => e.date !== date); persist('st-body', u); return u; });
  };
  const saveGtg = (date, count) => {
    setGtg(prev => { const u = { ...prev }; if (count <= 0) delete u[date]; else u[date] = count; persist('st-gtg', u); return u; });
  };

  if (!loaded) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-zinc-400 text-sm animate-pulse">Chargement...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur border-b border-zinc-800 px-4 pb-3 flex items-center justify-between" style={{paddingTop:'calc(env(safe-area-inset-top) + 0.75rem)'}}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Dumbbell size={18} className="text-zinc-950" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Street Lifting <span className="text-zinc-600 font-normal text-xs">v2.0</span></h1>
              <p className="text-xs text-zinc-500">Cut · objectif 72.5 kg</p>
            </div>
          </div>
          <SaveIndicator ok={storageOk} lastSaved={lastSaved} />
        </header>
        <main className="px-4 py-4">
          {tab === 'home' && <HomeView sessions={sessions} body={body} gtg={gtg} saveGtg={saveGtg} setTab={setTab} setActiveSession={setActiveSession} />}
          {tab === 'session' && <SessionView sessions={sessions} saveSession={saveSession} deleteSession={deleteSession} activeSession={activeSession} />}
          {tab === 'prs' && <PRView sessions={sessions} />}
          {tab === 'body' && <BodyView body={body} saveBody={saveBody} deleteBody={deleteBody} />}
          {tab === 'stats' && <StatsView sessions={sessions} body={body} gtg={gtg} />}
        </main>
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800" style={{paddingBottom:'env(safe-area-inset-bottom)'}}>
          <div className="max-w-2xl mx-auto grid grid-cols-5">
            {[
              { id: 'home', label: 'Accueil', Icon: HomeIcon },
              { id: 'session', label: 'Séance', Icon: Dumbbell },
              { id: 'prs', label: 'PRs', Icon: Trophy },
              { id: 'body', label: 'Corps', Icon: Heart },
              { id: 'stats', label: 'Stats', Icon: TrendingUp },
            ].map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)} aria-label={label} aria-current={tab === id ? 'page' : undefined} className={`flex flex-col items-center gap-1 py-3 active:bg-zinc-800/50 transition-colors ${tab === id ? 'text-orange-500' : 'text-zinc-500'}`}>
                <Icon size={20} strokeWidth={tab === id ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function SaveIndicator({ ok, lastSaved }) {
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => { if (lastSaved) { setJustSaved(true); const t = setTimeout(() => setJustSaved(false), 1500); return () => clearTimeout(t); } }, [lastSaved]);
  if (!ok) return <div className="flex items-center gap-1.5 text-xs text-red-400"><CloudOff size={14} /> Erreur</div>;
  return <div className={`flex items-center gap-1.5 text-xs transition-colors ${justSaved ? 'text-green-400' : 'text-zinc-500'}`}>{justSaved ? <Check size={14} strokeWidth={3} /> : <Cloud size={14} />}{justSaved ? 'Sauvé' : 'Auto'}</div>;
}

function HomeView({ sessions, body, gtg, saveGtg, setTab, setActiveSession }) {
  const dow = new Date().getDay();
  const prog = PROGRAM[dow];
  const todayStr = today();
  const todayGtg = gtg[todayStr] || 0;
  const lastBody = body.length ? body[body.length - 1] : null;
  const firstBody = body.length ? body[0] : null;
  const weightLoss = firstBody && lastBody ? (firstBody.weight - lastBody.weight).toFixed(1) : '0.0';
  const toGoal = lastBody ? Math.max(0, lastBody.weight - GOAL.weight).toFixed(1) : '0.0';
  const sessionsThisWeek = sessions.filter(s => {
    const diff = daysBetween(s.date, todayStr);
    return diff >= 0 && diff < 7;
  }).length;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-orange-500/10 to-amber-600/5 border border-orange-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold mb-1">Aujourd'hui · {prog.day}</div>
            <h2 className="text-2xl font-bold">{prog.name}</h2>
            <p className="text-sm text-zinc-400 mt-1">{prog.focus}</p>
          </div>
          <Flame size={32} className="text-orange-500" />
        </div>
        {prog.exercises.length > 0 ? (
          <>
            <div className="text-xs text-zinc-500 mb-3">{prog.exercises.length} exercices</div>
            <button onClick={() => { setActiveSession({ programId: dow, date: todayStr }); setTab('session'); }}
              className="w-full bg-orange-500 active:bg-orange-600 active:scale-[0.98] text-zinc-950 font-bold py-3 rounded-xl transition-transform duration-150 flex items-center justify-center gap-2">
              Démarrer la séance <ChevronRight size={18} strokeWidth={3} />
            </button>
          </>
        ) : <div className="text-sm text-zinc-400">Jour de repos. Hydrate-toi, dors, mange tes protéines.</div>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2"><Target size={14} /> Poids actuel</div>
          <div className="text-2xl font-bold tabular-nums">{lastBody?.weight ?? '—'} <span className="text-sm text-zinc-500 font-normal">kg</span></div>
          <div className="text-xs text-zinc-500 mt-1">{parseFloat(weightLoss) > 0 ? <span className="text-green-400">−{weightLoss} kg depuis départ</span> : 'Aucune variation'}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-2"><Award size={14} /> Reste</div>
          <div className="text-2xl font-bold tabular-nums">{toGoal} <span className="text-sm text-zinc-500 font-normal">kg</span></div>
          <div className="text-xs text-zinc-500 mt-1">vers 72.5 kg</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /><h3 className="font-bold">Grease the Groove</h3></div>
            <p className="text-xs text-zinc-500 mt-1">Objectif : 4-6 sets / jour · 1 traction ou négative</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => saveGtg(todayStr, Math.max(0, todayGtg - 1))} disabled={todayGtg === 0} aria-label="Retirer un set GTG"
            className="w-14 h-14 bg-zinc-800 active:scale-95 disabled:opacity-30 rounded-full flex items-center justify-center transition-transform">
            <Minus size={22} />
          </button>
          <div className="text-center">
            <div className="text-5xl font-bold tabular-nums">{todayGtg}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">sets aujourd'hui</div>
          </div>
          <button onClick={() => saveGtg(todayStr, todayGtg + 1)} aria-label="Ajouter un set GTG"
            className="w-14 h-14 bg-amber-500 active:scale-95 text-zinc-950 rounded-full flex items-center justify-center transition-transform">
            <Plus size={22} strokeWidth={3} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - (6 - i));
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const ds = `${y}-${m}-${day}`;
            const count = gtg[ds] || 0;
            const bar = Math.min(count / 6, 1);
            return (
              <div key={ds} className="flex flex-col items-center gap-1">
                <div className="w-full h-12 bg-zinc-800 rounded-md relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 to-amber-400 transition-[height] duration-300" style={{ height: `${bar * 100}%` }} />
                </div>
                <div className="text-xs text-zinc-600">{['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Calendar size={16} className="text-zinc-400" /><h3 className="font-bold">Cette semaine</h3></div>
          <div className="text-sm text-zinc-400">{sessionsThisWeek}/5 séances</div>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-[width] duration-300" style={{ width: `${Math.min(sessionsThisWeek / 5, 1) * 100}%` }} />
        </div>
      </div>

      <MacrosCard isTraining={prog.exercises.length > 0} />
    </div>
  );
}

function MacrosCard({ isTraining }) {
  const m = isTraining ? MACROS.training : MACROS.off;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Macros · {isTraining ? 'Jour training' : 'Jour off'}</h3>
        <div className="text-2xl font-bold text-orange-500">{m.kcal}<span className="text-xs text-zinc-500 font-normal"> kcal</span></div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[['Prot', m.p], ['Lip', m.l], ['Gluc', m.g]].map(([label, val]) => (
          <div key={label} className="bg-zinc-800/50 rounded-lg py-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
            <div className="text-lg font-bold mt-1">{val}g</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-zinc-500 mt-3 italic">170g de prot = non négociable.</div>
    </div>
  );
}

function SessionView({ sessions, saveSession, deleteSession, activeSession }) {
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = activeSession?.programId ?? new Date().getDay();
    return [1,2,3,4,5].includes(d) ? d : 1;
  });
  const dateStr = activeSession?.date || today();
  const prog = PROGRAM[selectedDay];
  const current = useMemo(() => sessions.find(s => s.date === dateStr && s.programId === selectedDay), [sessions, dateStr, selectedDay]);
  const logs = current?.logs || {};
  const notes = current?.notes || '';
  const lastSession = useMemo(() => sessions.filter(s => s.programId === selectedDay && s.date < dateStr).sort((a, b) => b.date.localeCompare(a.date))[0], [sessions, selectedDay, dateStr]);

  const commitSession = (partial) => {
    saveSession({
      date: dateStr, programId: selectedDay, programName: prog.name,
      logs: partial.logs ?? logs, notes: partial.notes ?? notes,
    });
  };
  const updateSet = (exId, setIdx, field, value) => {
    const exLogs = [...(logs[exId] || [])];
    exLogs[setIdx] = { ...(exLogs[setIdx] || {}), [field]: value };
    commitSession({ logs: { ...logs, [exId]: exLogs } });
  };
  const hasData = Object.values(logs).some(arr => arr?.some(l => l && (l.reps != null || l.weight != null))) || notes;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Sélectionner jour</div>
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5].map(d => (
            <button key={d} onClick={() => setSelectedDay(d)} aria-pressed={selectedDay === d} className={`py-2 px-1 rounded-lg text-xs font-semibold transition-colors ${selectedDay === d ? 'bg-orange-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400 active:bg-zinc-800'}`}>
              J{d}<div className="text-xs font-normal opacity-70 mt-0.5">{PROGRAM[d].day.slice(0, 3)}</div>
            </button>
          ))}
        </div>
      </div>
      {prog.exercises.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <div className="text-zinc-400">Jour de repos</div><div className="text-xs text-zinc-600 mt-1">{prog.focus}</div>
        </div>
      ) : (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{prog.name}</h2>
                <p className="text-sm text-zinc-400">{prog.focus} · {fmtDateFull(dateStr)}</p>
                {lastSession && <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1"><Calendar size={12} /> Dernière séance : {fmtDate(lastSession.date)}</div>}
              </div>
              {hasData && <button onClick={() => { if (confirm('Supprimer toutes les données de cette séance ?')) deleteSession(dateStr, selectedDay); }} className="text-xs text-red-400/70 active:text-red-400">Reset</button>}
            </div>
          </div>
          {prog.exercises.map(ex => (
            <ExerciseLogger key={ex.id} exercise={ex} logs={logs[ex.id] || []} lastLogs={lastSession?.logs?.[ex.id] || []} onUpdate={(setIdx, field, value) => updateSet(ex.id, setIdx, field, value)} />
          ))}
          <NotesField notes={notes} onCommit={(newNotes) => commitSession({ notes: newNotes })} key={`${dateStr}-${selectedDay}`} />
        </>
      )}
    </div>
  );
}

function NotesField({ notes, onCommit }) {
  const [local, setLocal] = useState(notes);
  useEffect(() => { setLocal(notes); }, [notes]);
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Notes</label>
      <textarea value={local} onChange={e => setLocal(e.target.value)} onBlur={() => { if (local !== notes) onCommit(local); }}
        placeholder="Ressenti, fatigue, pump, douleurs..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-base resize-none focus:outline-none focus:border-orange-500" rows={3} />
    </div>
  );
}

function ExerciseLogger({ exercise, logs, lastLogs, onUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const sets = Array.from({ length: exercise.sets }, (_, i) => i);
  const completed = logs.filter(l => l && l.reps != null && l.reps > 0).length;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="w-full p-4 flex items-center justify-between active:bg-zinc-800/50">
        <div className="text-left flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{exercise.name}</h3>
            {exercise.pr && <Trophy size={12} className="text-amber-500" />}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">{exercise.sets} × {exercise.reps} · RPE {exercise.rpe} · Repos {exercise.rest}</div>
          {exercise.note && <div className="text-xs text-orange-400/80 mt-1 italic">{exercise.note}</div>}
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-xs tabular-nums ${completed === exercise.sets ? 'text-green-400' : 'text-zinc-500'}`}>{completed}/{exercise.sets}</div>
          <ChevronRight size={16} className={`transition-transform ${expanded ? 'rotate-90' : ''} text-zinc-500`} />
        </div>
      </button>
      {expanded && (
        <div className="p-4 pt-0 space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 uppercase tracking-wider font-semibold px-1">
            <div className="col-span-2">Set</div>
            {exercise.weighted && <div className="col-span-4">Charge</div>}
            <div className={exercise.weighted ? 'col-span-3' : 'col-span-5'}>Reps</div>
            <div className={exercise.weighted ? 'col-span-3' : 'col-span-5'}>Précéd.</div>
          </div>
          {sets.map(i => <SetRow key={i} idx={i} log={logs[i] || {}} last={lastLogs[i] || {}} weighted={exercise.weighted} onUpdate={(f, v) => onUpdate(i, f, v)} />)}
        </div>
      )}
    </div>
  );
}

function SetRow({ idx, log, last, weighted, onUpdate }) {
  const [w, setW] = useState(log.weight != null ? String(log.weight) : '');
  const [r, setR] = useState(log.reps != null ? String(log.reps) : '');
  useEffect(() => { setW(log.weight != null ? String(log.weight) : ''); }, [log.weight]);
  useEffect(() => { setR(log.reps != null ? String(log.reps) : ''); }, [log.reps]);
  const commitW = () => {
    const trimmed = w.trim();
    const v = trimmed === '' ? null : parseFloat(trimmed);
    const f = (v === null || isNaN(v)) ? null : v;
    if (f !== (log.weight ?? null)) onUpdate('weight', f);
  };
  const commitR = () => {
    const trimmed = r.trim();
    const v = trimmed === '' ? null : parseInt(trimmed, 10);
    const f = (v === null || isNaN(v)) ? null : v;
    if (f !== (log.reps ?? null)) onUpdate('reps', f);
  };
  const filled = log.reps != null && log.reps > 0;
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className={`col-span-2 text-sm font-semibold tabular-nums ${filled ? 'text-green-400' : 'text-zinc-400'}`}>#{idx + 1}</div>
      {weighted && (
        <div className="col-span-4">
          <input type="number" inputMode="decimal" step="0.5" value={w} onChange={e => setW(e.target.value)} onBlur={commitW}
            enterKeyHint="done" onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
            aria-label={`Charge set ${idx + 1}`}
            placeholder="kg" className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-base focus:outline-none focus:border-orange-500 tabular-nums" />
        </div>
      )}
      <div className={weighted ? 'col-span-3' : 'col-span-5'}>
        <input type="number" inputMode="numeric" value={r} onChange={e => setR(e.target.value)} onBlur={commitR}
          enterKeyHint="done" onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
          aria-label={`Reps set ${idx + 1}`}
          placeholder="reps" className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-2 text-base focus:outline-none focus:border-orange-500 tabular-nums" />
      </div>
      <div className={`${weighted ? 'col-span-3' : 'col-span-5'} text-xs text-zinc-500 tabular-nums truncate`}>
        {last.weight != null || last.reps != null ? `${last.weight != null ? last.weight + 'kg · ' : ''}${last.reps ?? '—'}` : '—'}
      </div>
    </div>
  );
}

function PRView({ sessions }) {
  const prExercises = [
    { id: 'dips_l', name: 'Dips lestés', type: 'weight' },
    { id: 'trac_max', name: 'Traction PDC max', type: 'reps' },
    { id: 'dips_max', name: 'Dips PDC max', type: 'reps' },
    { id: 'belt_sq', name: 'Belt squat', type: 'weight' },
    { id: 'trac_vol', name: 'Tractions volume', type: 'reps' },
    { id: 'mu_try', name: 'Muscle-up', type: 'reps' },
  ];
  const getPRHistory = (exId, type) => {
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
  return (
    <div className="space-y-3">
      <div className="mb-4"><h2 className="text-xl font-bold">Records personnels</h2><p className="text-sm text-zinc-500">Meilleure perf par séance · progression</p></div>
      {prExercises.map(ex => {
        const history = getPRHistory(ex.id, ex.type);
        const pr = history.reduce((max, e) => !max || e.value > max.value ? e : max, null);
        const latest = history[history.length - 1];
        return (
          <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div><h3 className="font-semibold">{ex.name}</h3><div className="text-xs text-zinc-500">{history.length ? `${history.length} séances · dernier : ${fmtDate(latest.date)}` : 'Pas encore de données'}</div></div>
              <Trophy size={16} className="text-amber-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <div className="text-xs text-zinc-500 uppercase tracking-wider">PR</div>
                <div className="text-xl font-bold mt-1 tabular-nums">{pr ? (ex.type === 'weight' ? `${pr.value} kg × ${pr.reps}` : `${pr.value} reps`) : '—'}</div>
                {pr && <div className="text-xs text-amber-500 mt-0.5">{fmtDate(pr.date)}</div>}
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Dernier</div>
                <div className="text-xl font-bold mt-1 tabular-nums">{latest ? (ex.type === 'weight' ? `${latest.value} kg × ${latest.reps}` : `${latest.value} reps`) : '—'}</div>
              </div>
            </div>
            {history.length > 1 && (
              <div className="mt-3 h-20">
                <ResponsiveContainer>
                  <LineChart data={history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }} labelFormatter={fmtDate} formatter={(v) => [ex.type === 'weight' ? `${v} kg` : `${v} reps`, ex.name]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BodyView({ body, saveBody, deleteBody }) {
  const [weight, setWeight] = useState('');
  const [bf, setBf] = useState('');
  const [date, setDate] = useState(today());
  const [showForm, setShowForm] = useState(false);
  const handleSave = () => {
    const w = parseFloat(weight); if (!weight || isNaN(w) || w <= 0 || w > 300) return;
    const b = bf ? parseFloat(bf) : null;
    saveBody({ date, weight: w, bf: (b != null && !isNaN(b) && b > 0 && b < 60) ? b : null });
    setWeight(''); setBf(''); setDate(today()); setShowForm(false);
  };
  const latest = body.length ? body[body.length - 1] : null;
  const first = body.length ? body[0] : null;
  const progress = latest && first && first.weight > GOAL.weight ? ((first.weight - latest.weight) / (first.weight - GOAL.weight)) * 100 : 0;
  const chartData = body.map(b => ({ ...b, dateFmt: fmtDate(b.date) }));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Composition corporelle</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-orange-500 active:bg-orange-600 text-zinc-950 font-semibold text-sm px-3 py-2 rounded-lg flex items-center gap-1">
          {showForm ? <X size={14} /> : <Plus size={14} strokeWidth={3} />}{showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>
      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Date</label>
            <input type="date" value={date} max={today()} onChange={e => setDate(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">Poids (kg)</label>
              <input type="number" inputMode="decimal" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} enterKeyHint="done" onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} placeholder="80.7" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">BF (%)</label>
              <input type="number" inputMode="decimal" step="0.1" value={bf} onChange={e => setBf(e.target.value)} enterKeyHint="done" onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }} placeholder="16.6" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-base focus:outline-none focus:border-orange-500" />
            </div>
          </div>
          <button onClick={handleSave} disabled={!weight} className="w-full bg-orange-500 disabled:opacity-40 text-zinc-950 font-bold py-2.5 rounded-lg">Enregistrer</button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Poids</div>
          <div className="text-xl font-bold mt-1 tabular-nums">{latest?.weight ?? '—'}<span className="text-xs text-zinc-500 font-normal"> kg</span></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">BF</div>
          <div className="text-xl font-bold mt-1 tabular-nums">{latest?.bf ?? '—'}<span className="text-xs text-zinc-500 font-normal">%</span></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Perte</div>
          <div className="text-xl font-bold mt-1 tabular-nums text-green-400">−{first && latest ? Math.max(0, first.weight - latest.weight).toFixed(1) : '0.0'}<span className="text-xs text-zinc-500 font-normal"> kg</span></div>
        </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div><div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Progression cut</div><div className="text-sm text-zinc-300 mt-1">{latest?.weight ?? '—'} kg → 72.5 kg</div></div>
          <div className="text-2xl font-bold text-orange-500">{Math.max(0, Math.min(100, progress)).toFixed(0)}%</div>
        </div>
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-[width] duration-300" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      </div>
      {body.length > 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="font-bold mb-3">Évolution poids</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#27272a" />
                <XAxis dataKey="dateFmt" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} domain={[GOAL.weight - 1, 'dataMax + 1']} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }} />
                <ReferenceLine y={GOAL.weight} stroke="#22c55e" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h3 className="font-bold mb-3">Historique</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {body.slice().reverse().map(b => (
            <div key={b.date} className="flex items-center justify-between py-2 px-2 border-b border-zinc-800 last:border-0 active:bg-zinc-800/30 rounded">
              <div className="text-sm text-zinc-400">{fmtDate(b.date)}</div>
              <div className="flex items-center gap-3 text-sm tabular-nums">
                <span className="font-semibold">{b.weight} kg</span>
                {b.bf && <span className="text-zinc-500">{b.bf}%</span>}
                <button onClick={() => { if (confirm(`Supprimer l'entrée du ${fmtDate(b.date)} ?`)) deleteBody(b.date); }} aria-label={`Supprimer entrée ${b.date}`} className="text-red-400/70 active:text-red-400"><X size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsView({ sessions, body, gtg }) {
  const weekVolume = useMemo(() => {
    const byWeek = {};
    sessions.forEach(s => {
      const d = parseDate(s.date);
      const st = new Date(d);
      st.setDate(d.getDate() - d.getDay());
      const y = st.getFullYear();
      const m = String(st.getMonth() + 1).padStart(2, '0');
      const day = String(st.getDate()).padStart(2, '0');
      const k = `${y}-${m}-${day}`;
      byWeek[k] = (byWeek[k] || 0) + 1;
    });
    return Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b)).slice(-8).map(([date, count]) => ({ date: fmtDate(date), count }));
  }, [sessions]);
  const gtgWeekly = useMemo(() => {
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
    return Object.entries(byWeek).sort(([a], [b]) => a.localeCompare(b)).slice(-8).map(([date, total]) => ({ date: fmtDate(date), total }));
  }, [gtg]);
  const totalSessions = sessions.length;
  const totalGtg = Object.values(gtg).reduce((a, b) => a + b, 0);
  const daysSinceStart = body[0] ? daysBetween(body[0].date, today()) : 0;
  const hasAnyData = sessions.length > 0 || Object.keys(gtg).length > 0;

  const handleImport = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert('Fichier trop volumineux (>5 MB)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (!d || typeof d !== 'object') throw new Error('Format invalide');
        const validSessions = Array.isArray(d.sessions) ? d.sessions.filter(s => s && typeof s.date === 'string' && typeof s.programId === 'number') : null;
        const validBody = Array.isArray(d.body) ? d.body.filter(b => b && typeof b.date === 'string' && typeof b.weight === 'number') : null;
        const validGtg = d.gtg && typeof d.gtg === 'object' && !Array.isArray(d.gtg) ? d.gtg : null;
        if (!validSessions && !validBody && !validGtg) throw new Error('Aucune donnée valide trouvée');
        if (confirm('Remplacer toutes les données actuelles par celles du fichier ?')) {
          if (validSessions) saveKey('st-sessions', validSessions);
          if (validBody) saveKey('st-body', validBody);
          if (validGtg) saveKey('st-gtg', validGtg);
          location.reload();
        }
      } catch (err) {
        alert('Fichier invalide : ' + (err.message || 'parse error'));
      }
    };
    reader.onerror = () => alert('Erreur de lecture du fichier');
    reader.readAsText(f);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Statistiques</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><div className="text-xs text-zinc-500 uppercase tracking-wider">Séances</div><div className="text-2xl font-bold mt-1 tabular-nums">{totalSessions}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><div className="text-xs text-zinc-500 uppercase tracking-wider">Sets GTG</div><div className="text-2xl font-bold mt-1 tabular-nums">{totalGtg}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3"><div className="text-xs text-zinc-500 uppercase tracking-wider">Jours</div><div className="text-2xl font-bold mt-1 tabular-nums">{daysSinceStart}</div></div>
      </div>
      {weekVolume.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="font-bold mb-3">Séances / semaine</h3>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={weekVolume} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: '#27272a' }} />
                <ReferenceLine y={5} stroke="#22c55e" strokeDasharray="3 3" />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {gtgWeekly.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="font-bold mb-3">GTG / semaine</h3>
          <div className="h-40">
            <ResponsiveContainer>
              <BarChart data={gtgWeekly} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }} cursor={{ fill: '#27272a' }} />
                <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h3 className="font-bold mb-3">Données</h3>
        <button onClick={() => {
          const data = { sessions: load('st-sessions', []), body: load('st-body', []), gtg: load('st-gtg', {}) };
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `street-lifting-${today()}.json`; a.click();
          URL.revokeObjectURL(url);
        }} className="w-full bg-zinc-800 active:bg-zinc-700 text-zinc-300 text-sm font-medium py-2.5 rounded-lg mb-2">Exporter les données (JSON)</button>
        <label className="block w-full bg-zinc-800 active:bg-zinc-700 text-zinc-300 text-sm font-medium py-2.5 rounded-lg text-center cursor-pointer">
          Importer des données
          <input type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
        </label>
      </div>
      {!hasAnyData && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <Dumbbell size={32} className="text-zinc-700 mx-auto mb-3" />
          <div className="text-zinc-400 text-sm">Pas encore de données</div>
          <div className="text-zinc-600 text-xs mt-1">Log ta première séance pour voir les stats</div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
