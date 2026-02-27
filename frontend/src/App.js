import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const api = axios.create({ baseURL: API_URL });

const BREED_TRAITS = [
  { key: 'head', label: '🦴 Head & Skull', description: 'Broad, flat skull with well-defined stop and muscular cheeks' },
  { key: 'body', label: '💪 Body Structure', description: 'Broad, deep chest with well-sprung ribs and muscular loin' },
  { key: 'legs', label: '🐾 Legs & Feet', description: 'Strong bone structure, well-angulated hindquarters, compact feet' },
  { key: 'coat', label: '✨ Coat & Color', description: 'Short, dense, smooth coat in fawn, red, brown, or brindle' },
  { key: 'temperament', label: '🧠 Temperament', description: 'Confident, calm, intelligent, and loyal disposition' },
  { key: 'movement', label: '🏃 Movement & Gait', description: 'Powerful, free-flowing movement with good reach and drive' },
  { key: 'size', label: '📏 Size & Proportion', description: 'Males 64-70cm, Females 59-65cm, well-proportioned build' },
];

function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🐕 BreedGrade</Link>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.navLink}>🏠 Home</Link>
        <Link to="/evaluate" style={styles.navLink}>📋 Evaluate</Link>
        <Link to="/evaluations" style={styles.navLink}>📊 History</Link>
      </div>
    </nav>
  );
}

function Home() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });

  useEffect(() => {
    api.get('/api/health')
      .then(res => setHealth(res.data.status))
      .catch(() => setHealth('unreachable'));

    api.get('/api/evaluations/stats')
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>🐕 BreedGrade</h1>
        <p style={styles.heroSubtitle}>Professional Boerboel Evaluation Platform</p>
        <p style={styles.heroDesc}>
          AI-assisted breed evaluation for Boerboel dogs. Score against official breed standards,
          track lineage quality, and get detailed assessment reports.
        </p>
        <Link to="/evaluate" style={styles.ctaButton}>🚀 Start Evaluation</Link>
      </section>

      <section style={styles.statsRow}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{stats.total}</span>
          <span style={styles.statLabel}>📝 Evaluations</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{stats.avgScore || '—'}</span>
          <span style={styles.statLabel}>⭐ Avg Score</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statNumber, color: health === 'healthy' ? '#22c55e' : '#ef4444' }}>
            {health === 'healthy' ? '●' : '○'}
          </span>
          <span style={styles.statLabel}>🔌 System {health || '...'}</span>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Breed Standard Traits</h2>
        <div style={styles.traitGrid}>
          {BREED_TRAITS.map(t => (
            <div key={t.key} style={styles.traitCard}>
              <h3 style={styles.traitName}>{t.label}</h3>
              <p style={styles.traitDesc}>{t.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function EvaluateForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    dogName: '', registrationNumber: '', ownerName: '', age: '', gender: 'male', notes: '',
    scores: BREED_TRAITS.reduce((acc, t) => ({ ...acc, [t.key]: 5 }), {}),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const totalScore = Object.values(form.scores).reduce((a, b) => a + b, 0);
  const maxScore = BREED_TRAITS.length * 10;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const handleScore = (key, val) => {
    setForm(f => ({ ...f, scores: { ...f.scores, [key]: Number(val) } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/api/evaluations', {
        dog_name: form.dogName,
        registration_number: form.registrationNumber,
        owner_name: form.ownerName,
        age_months: Number(form.age),
        gender: form.gender,
        scores: form.scores,
        notes: form.notes,
        total_score: totalScore,
        percentage,
      });
      navigate(`/evaluations/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit evaluation');
    }
    setSubmitting(false);
  };

  return (
    <main style={styles.main}>
      <h1 style={styles.pageTitle}>📋 New Evaluation</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="dogName">Dog Name *</label>
            <input id="dogName" style={styles.input} required value={form.dogName}
              onChange={e => setForm(f => ({ ...f, dogName: e.target.value }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="regNum">Registration Number</label>
            <input id="regNum" style={styles.input} value={form.registrationNumber}
              onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="ownerName">Owner Name *</label>
            <input id="ownerName" style={styles.input} required value={form.ownerName}
              onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="age">Age (months) *</label>
            <input id="age" type="number" min="1" style={styles.input} required value={form.age}
              onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="gender">Gender</label>
            <select id="gender" style={styles.input} value={form.gender}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>🎯 Trait Scores (1-10)</h2>
        <div style={styles.scoreGrid}>
          {BREED_TRAITS.map(t => (
            <div key={t.key} style={styles.scoreRow}>
              <div>
                <label htmlFor={`score-${t.key}`} style={styles.scoreLabel}>{t.label}</label>
                <p style={styles.scoreDesc}>{t.description}</p>
              </div>
              <div style={styles.scoreControl}>
                <input id={`score-${t.key}`} type="range" min="1" max="10" value={form.scores[t.key]}
                  onChange={e => handleScore(t.key, e.target.value)} style={styles.slider} />
                <span style={styles.scoreValue}>{form.scores[t.key]}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.totalBar}>
          <span>Total: {totalScore} / {maxScore}</span>
          <span style={{ color: percentage >= 70 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444' }}>
            {percentage}%
          </span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="notes">Notes</label>
          <textarea id="notes" style={{ ...styles.input, minHeight: 80 }} value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={submitting} style={styles.submitBtn}>
          {submitting ? '⏳ Submitting...' : '✅ Submit Evaluation'}
        </button>
      </form>
    </main>
  );
}

function EvaluationList() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/evaluations')
      .then(res => setEvaluations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={styles.main}>
      <h1 style={styles.pageTitle}>📊 Evaluation History</h1>
      {loading ? <p>Loading...</p> : evaluations.length === 0 ? (
        <div style={styles.empty}>
          <p>No evaluations yet.</p>
          <Link to="/evaluate" style={styles.ctaButton}>🚀 Create First Evaluation</Link>
        </div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={styles.tableCell}>Dog</span>
            <span style={styles.tableCell}>Owner</span>
            <span style={styles.tableCell}>Score</span>
            <span style={styles.tableCell}>Date</span>
            <span style={styles.tableCell}></span>
          </div>
          {evaluations.map(ev => (
            <div key={ev.id} style={styles.tableRow}>
              <span style={styles.tableCell}>{ev.dog_name}</span>
              <span style={styles.tableCell}>{ev.owner_name}</span>
              <span style={styles.tableCell}>{ev.percentage}%</span>
              <span style={styles.tableCell}>{new Date(ev.created_at).toLocaleDateString()}</span>
              <span style={styles.tableCell}>
                <Link to={`/evaluations/${ev.id}`} style={styles.viewLink}>View</Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function EvaluationDetail() {
  const [evaluation, setEvaluation] = useState(null);
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    api.get(`/api/evaluations/${id}`)
      .then(res => setEvaluation(res.data))
      .catch(() => {});
  }, [id]);

  if (!evaluation) return <main style={styles.main}><p>Loading...</p></main>;

  return (
    <main style={styles.main}>
      <Link to="/evaluations" style={styles.backLink}>← Back to History</Link>
      <h1 style={styles.pageTitle}>{evaluation.dog_name}</h1>
      <div style={styles.detailGrid}>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Owner</span>
          <span>{evaluation.owner_name}</span>
        </div>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Registration</span>
          <span>{evaluation.registration_number || '—'}</span>
        </div>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Age</span>
          <span>{evaluation.age_months} months</span>
        </div>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Gender</span>
          <span style={{ textTransform: 'capitalize' }}>{evaluation.gender}</span>
        </div>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Total Score</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{evaluation.percentage}%</span>
        </div>
      </div>
      <h2 style={styles.sectionTitle}>Trait Breakdown</h2>
      {evaluation.scores && BREED_TRAITS.map(t => (
        <div key={t.key} style={styles.breakdownRow}>
          <span style={{ flex: 1 }}>{t.label}</span>
          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${(evaluation.scores[t.key] || 0) * 10}%` }} />
          </div>
          <span style={styles.breakdownScore}>{evaluation.scores[t.key]}/10</span>
        </div>
      ))}
      {evaluation.notes && (
        <>
          <h2 style={styles.sectionTitle}>Notes</h2>
          <p style={styles.notes}>{evaluation.notes}</p>
        </>
      )}
    </main>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evaluate" element={<EvaluateForm />} />
        <Route path="/evaluations" element={<EvaluationList />} />
        <Route path="/evaluations/:id" element={<EvaluationDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1a1a2e', color: '#fff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  logo: { fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: '1.5rem' },
  navLink: { color: '#e2e8f0', textDecoration: 'none', fontSize: '0.95rem' },
  main: { maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#1e293b' },
  hero: { textAlign: 'center', padding: '3rem 0 2rem' },
  heroTitle: { fontSize: '2.5rem', fontWeight: 800, color: '#1a1a2e', margin: 0, letterSpacing: '-0.02em' },
  heroSubtitle: { fontSize: '1.2rem', color: '#64748b', margin: '0.5rem 0' },
  heroDesc: { maxWidth: 600, margin: '1rem auto', color: '#475569', lineHeight: 1.6 },
  ctaButton: { display: 'inline-block', padding: '0.75rem 2rem', background: '#f59e0b', color: '#1a1a2e', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '1rem', marginTop: '1rem' },
  statsRow: { display: 'flex', gap: '1rem', justifyContent: 'center', margin: '2rem 0' },
  statCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 2rem', background: '#f8fafc', borderRadius: 12, minWidth: 120 },
  statNumber: { fontSize: '1.8rem', fontWeight: 700, color: '#1a1a2e' },
  statLabel: { fontSize: '0.85rem', color: '#64748b', marginTop: 4 },
  section: { margin: '3rem 0' },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1a2e' },
  traitGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' },
  traitCard: { padding: '1.25rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' },
  traitName: { fontSize: '1rem', fontWeight: 600, margin: '0 0 0.4rem', color: '#1a1a2e' },
  traitDesc: { fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 },
  pageTitle: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#475569' },
  input: { padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  scoreGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 8, gap: '1rem', flexWrap: 'wrap' },
  scoreLabel: { fontWeight: 600, fontSize: '0.95rem' },
  scoreDesc: { fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' },
  scoreControl: { display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 180 },
  slider: { flex: 1, accentColor: '#f59e0b' },
  scoreValue: { fontWeight: 700, fontSize: '1.1rem', minWidth: 24, textAlign: 'center' },
  totalBar: { display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#1a1a2e', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: '1.1rem' },
  submitBtn: { padding: '0.75rem', background: '#f59e0b', color: '#1a1a2e', border: 'none', borderRadius: 8, fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  error: { color: '#ef4444', fontSize: '0.9rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#64748b' },
  table: { border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' },
  tableHeader: { display: 'flex', background: '#f1f5f9', padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.85rem', color: '#475569' },
  tableRow: { display: 'flex', padding: '0.75rem 1rem', borderTop: '1px solid #e2e8f0', alignItems: 'center' },
  tableCell: { flex: 1, fontSize: '0.9rem' },
  viewLink: { color: '#f59e0b', fontWeight: 600, textDecoration: 'none' },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1rem' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  detailCard: { display: 'flex', flexDirection: 'column', padding: '1rem', background: '#f8fafc', borderRadius: 8 },
  detailLabel: { fontSize: '0.8rem', color: '#64748b', marginBottom: 4 },
  breakdownRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' },
  barBg: { flex: 2, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', background: '#f59e0b', borderRadius: 4, transition: 'width 0.3s' },
  breakdownScore: { minWidth: 45, textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 },
  notes: { background: '#f8fafc', padding: '1rem', borderRadius: 8, lineHeight: 1.6, color: '#475569' },
};
