import { useState, useEffect } from 'react';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [minSubs, setMinSubs] = useState(10000);
  const [maxSubs, setMaxSubs] = useState(200000);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('find');

  useEffect(() => {
    const saved = localStorage.getItem('creator-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function saveHistory(newHistory) {
    setHistory(newHistory);
    localStorage.setItem('creator-history', JSON.stringify(newHistory));
  }

  async function searchCreators() {
    if (!niche) { alert('Type a niche first'); return; }
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await fetch(`/api/search?niche=${encodeURIComponent(niche)}&minSubs=${minSubs}&maxSubs=${maxSubs}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results);

      const existingUrls = new Set(history.map(h => h.url));
      const newOnes = data.results.filter(r => !existingUrls.has(r.url)).map(r => ({
        ...r, addedAt: new Date().toISOString(), contacted: false, instagram: 'N/A'
      }));
      if (newOnes.length > 0) {
        saveHistory([...newOnes, ...history]);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function toggleContacted(i) {
    const updated = [...history];
    updated[i].contacted = !updated[i].contacted;
    saveHistory(updated);
  }

  function updateInstagram(i, value) {
    const updated = [...history];
    updated[i].instagram = value;
    saveHistory(updated);
  }

  function removeHistory(i) {
    const updated = [...history];
    updated.splice(i, 1);
    saveHistory(updated);
  }

  const bg = '#0a0a0f';
  const card = '#15131f';
  const border = '#2a2438';
  const purple = '#a855f7';
  const purpleDark = '#7c3aed';
  const textMain = '#f3f1f8';
  const textMuted = '#8d87a3';

  const thStyle = { textAlign: 'left', padding: '10px 8px', fontSize: 11, color: textMuted, borderBottom: `1px solid ${border}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const tdStyle = { padding: '10px 8px', fontSize: 13, borderBottom: `1px solid ${border}`, verticalAlign: 'top', color: textMain };
  const inputStyle = { padding: 12, borderRadius: 10, border: `1px solid ${border}`, fontSize: 14, background: '#1c1928', color: textMain, outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 16px 60px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 6, fontWeight: 700, color: textMain, letterSpacing: '-0.02em' }}>
            Creator <span style={{ color: purple }}>Lead Finder</span>
          </h1>
          <p style={{ fontSize: 13, color: textMuted }}>Search YouTube, auto-save leads, track outreach.</p>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: card, borderRadius: 12, padding: 4, maxWidth: 340, border: `1px solid ${border}` }}>
          <button onClick={() => setTab('find')} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: tab === 'find' ? purple : 'transparent', color: tab === 'find' ? '#fff' : textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>Find</button>
          <button onClick={() => setTab('history')} style={{ flex: 1, padding: 10, border: 'none', borderRadius: 9, background: tab === 'history' ? purple : 'transparent', color: tab === 'history' ? '#fff' : textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>History ({history.length})</button>
        </div>

        {tab === 'find' && (
          <div>
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Niche e.g. tech reviews, fitness"
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  style={{ ...inputStyle, flex: '1 1 200px' }}
                />
                <input type="number" value={minSubs} onChange={e => setMinSubs(e.target.value)} placeholder="Min subs" style={{ ...inputStyle, width: 110 }} />
                <input type="number" value={maxSubs} onChange={e => setMaxSubs(e.target.value)} placeholder="Max subs" style={{ ...inputStyle, width: 110 }} />
              </div>
              <button onClick={searchCreators} disabled={loading} style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none',
                background: loading ? '#4c3a73' : `linear-gradient(135deg, ${purpleDark}, ${purple})`,
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(168,85,247,0.35)'
              }}>
                {loading ? 'Searching...' : 'Search YouTube'}
              </button>
            </div>

            {error && <div style={{ color: '#fca5a5', marginBottom: 16, fontSize: 13, background: '#3a1212', border: '1px solid #5c1a1a', padding: 12, borderRadius: 10 }}>{error}</div>}

            {results.length > 0 && (
              <p style={{ fontSize: 13, color: '#86efac', marginBottom: 12, fontWeight: 600 }}>● {results.length} channels found — auto-saved to History</p>
            )}

            {results.length > 0 && (
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 8, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Subs</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{r.name}</td>
                        <td style={tdStyle}><span style={{ background: '#2a1f3d', color: '#d4b8ff', padding: '3px 9px', borderRadius: 20, fontSize: 11 }}>{r.category}</span></td>
                        <td style={{ ...tdStyle, color: textMuted }}>{r.subs}</td>
                        <td style={{ ...tdStyle, color: r.email === 'N/A' ? textMuted : '#86efac' }}>{r.email}</td>
                        <td style={tdStyle}><a href={r.url} target="_blank" rel="noreferrer" style={{ color: purple, textDecoration: 'none' }}>open ↗</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, maxWidth: 420 }}>
              <div style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: purple }}>{history.length}</div>
                <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>Total leads</div>
              </div>
              <div style={{ flex: 1, background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#86efac' }}>{history.filter(h => h.contacted).length}</div>
                <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>Contacted</div>
              </div>
            </div>

            {history.length === 0 && <div style={{ textAlign: 'center', color: textMuted, padding: 40, background: card, borderRadius: 16, border: `1px solid ${border}` }}>No leads yet. Search in the Find tab — results save here automatically.</div>}

            {history.length > 0 && (
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 8, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Instagram</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Done</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{h.name}</td>
                        <td style={tdStyle}><span style={{ background: '#2a1f3d', color: '#d4b8ff', padding: '3px 9px', borderRadius: 20, fontSize: 11 }}>{h.category}</span></td>
                        <td style={tdStyle}>
                          <input
                            type="text"
                            placeholder="paste handle"
                            value={h.instagram === 'N/A' ? '' : h.instagram}
                            onChange={e => updateInstagram(i, e.target.value || 'N/A')}
                            style={{ width: 100, padding: 6, fontSize: 12, border: `1px solid ${border}`, borderRadius: 8, background: '#1c1928', color: textMain, outline: 'none' }}
                          />
                        </td>
                        <td style={{ ...tdStyle, color: h.email === 'N/A' ? textMuted : '#86efac' }}>{h.email}</td>
                        <td style={tdStyle}>
                          <input type="checkbox" checked={h.contacted} onChange={() => toggleContacted(i)} style={{ width: 16, height: 16, accentColor: purple }} />
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => removeHistory(i)} style={{ border: 'none', background: 'transparent', color: '#f87171', fontSize: 18, cursor: 'pointer' }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
    }
