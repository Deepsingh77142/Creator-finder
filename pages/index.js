import { useState, useEffect } from 'react';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [minSubs, setMinSubs] = useState(10000);
  const [maxSubs, setMaxSubs] = useState(200000);
  const [country, setCountry] = useState('random');
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
      const excludeIds = history.map(h => h.id).filter(Boolean).join(',');
      const res = await fetch(`/api/search?niche=${encodeURIComponent(niche)}&minSubs=${minSubs}&maxSubs=${maxSubs}&country=${country}&excludeIds=${encodeURIComponent(excludeIds)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results);

      const existingUrls = new Set(history.map(h => h.url));
      const newOnes = data.results.filter(r => !existingUrls.has(r.url)).map(r => ({
        ...r, addedAt: new Date().toISOString(), contacted: false
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

  function removeHistory(i) {
    const updated = [...history];
    updated.splice(i, 1);
    saveHistory(updated);
  }

  const gold = '#c9a86a';
  const card = '#13121a';
  const cardBorder = '#262432';
  const bgMain = '#08070d';
  const textMain = '#eee9f5';
  const textMuted = '#75708a';

  const thStyle = { textAlign: 'left', padding: '12px 10px', fontSize: 10.5, color: textMuted, borderBottom: `1px solid ${cardBorder}`, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 };
  const tdStyle = { padding: '13px 10px', fontSize: 13.5, borderBottom: `1px solid ${cardBorder}`, verticalAlign: 'middle', color: textMain };
  const inputStyle = { padding: '13px 14px', borderRadius: 10, border: `1px solid ${cardBorder}`, fontSize: 14, background: '#0e0d14', color: textMain, outline: 'none' };
  const selectStyle = { ...inputStyle, width: 140 };

  const countries = [
    { value: 'random', label: 'Random (Global)' },
    { value: 'india', label: 'India' },
    { value: 'usa', label: 'USA' },
    { value: 'uk', label: 'UK' },
    { value: 'canada', label: 'Canada' },
    { value: 'australia', label: 'Australia' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: bgMain, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 18px 70px' }}>

        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${gold}, #8a6d3b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#0a0a0a' }}>C</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: textMain, letterSpacing: '-0.01em', margin: 0 }}>Creator Lead Finder</h1>
            <p style={{ fontSize: 12.5, color: textMuted, margin: '2px 0 0' }}>Search YouTube · auto-save leads · track outreach</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: card, borderRadius: 12, padding: 4, maxWidth: 340, border: `1px solid ${cardBorder}` }}>
          <button onClick={() => setTab('find')} style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 9, background: tab === 'find' ? gold : 'transparent', color: tab === 'find' ? '#0a0a0a' : textMuted, fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Find</button>
          <button onClick={() => setTab('history')} style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 9, background: tab === 'history' ? gold : 'transparent', color: tab === 'history' ? '#0a0a0a' : textMuted, fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>History · {history.length}</button>
        </div>

        {tab === 'find' && (
          <div>
            <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 22, marginBottom: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Niche — e.g. tech reviews, fitness, finance"
                  value={niche}
                  onChange={e => setNiche(e.target.value)}
                  style={{ ...inputStyle, flex: '1 1 220px' }}
                />
                <select value={country} onChange={e => setCountry(e.target.value)} style={selectStyle}>
                  {countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <input type="number" value={minSubs} onChange={e => setMinSubs(e.target.value)} placeholder="Min subs" style={{ ...inputStyle, flex: 1 }} />
                <input type="number" value={maxSubs} onChange={e => setMaxSubs(e.target.value)} placeholder="Max subs" style={{ ...inputStyle, flex: 1 }} />
              </div>
              <button onClick={searchCreators} disabled={loading} style={{
                width: '100%', padding: 14, borderRadius: 10, border: 'none',
                background: loading ? '#4a4030' : `linear-gradient(135deg, ${gold}, #8a6d3b)`,
                color: '#0a0a0a', fontWeight: 700, fontSize: 14.5, cursor: loading ? 'default' : 'pointer',
                letterSpacing: '0.01em'
              }}>
                {loading ? 'Searching...' : 'Search YouTube'}
              </button>
            </div>

            {error && <div style={{ color: '#e0a3a3', marginBottom: 16, fontSize: 13, background: '#241313', border: '1px solid #3d1d1d', padding: 12, borderRadius: 10 }}>{error}</div>}

            {results.length > 0 && (
              <p style={{ fontSize: 12.5, color: gold, marginBottom: 14, fontWeight: 600, letterSpacing: '0.02em' }}>{results.length} NEW CHANNELS FOUND — AUTO-SAVED TO HISTORY</p>
            )}
            {!loading && results.length === 0 && niche && !error && (
              <p style={{ fontSize: 12.5, color: textMuted, marginBottom: 14 }}>No new channels found — try a different niche or country, or widen your subscriber range.</p>
            )}

            {results.length > 0 && (
              <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 6, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Subs</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Instagram</th>
                      <th style={thStyle}>Channel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id}>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{r.name}</td>
                        <td style={tdStyle}><span style={{ background: '#211d2c', color: gold, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{r.category}</span></td>
                        <td style={{ ...tdStyle, color: textMuted }}>{r.subs}</td>
                        <td style={{ ...tdStyle, color: r.email === 'N/A' ? textMuted : '#9fd8a8' }}>{r.email}</td>
                        <td style={{ ...tdStyle, color: r.instagram === 'N/A' ? textMuted : '#9fd8a8' }}>
                          {r.instagram === 'N/A' ? 'N/A' : <a href={`https://${r.instagram}`} target="_blank" rel="noreferrer" style={{ color: '#9fd8a8', textDecoration: 'none' }}>{r.instagram}</a>}
                        </td>
                        <td style={tdStyle}><a href={r.url} target="_blank" rel="noreferrer" style={{ color: gold, textDecoration: 'none', fontWeight: 500 }}>view ↗</a></td>
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
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 440 }}>
              <div style={{ flex: 1, background: card, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 18, textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: gold }}>{history.length}</div>
                <div style={{ fontSize: 11.5, color: textMuted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total leads</div>
              </div>
              <div style={{ flex: 1, background: card, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: 18, textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#9fd8a8' }}>{history.filter(h => h.contacted).length}</div>
                <div style={{ fontSize: 11.5, color: textMuted, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacted</div>
              </div>
            </div>

            {history.length === 0 && <div style={{ textAlign: 'center', color: textMuted, padding: 50, background: card, borderRadius: 16, border: `1px solid ${cardBorder}`, fontSize: 13.5 }}>No leads yet. Search in the Find tab — results save here automatically.</div>}

            {history.length > 0 && (
              <div style={{ background: card, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 6, overflowX: 'auto' }}>
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
                        <td style={tdStyle}><span style={{ background: '#211d2c', color: gold, padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{h.category}</span></td>
                        <td style={{ ...tdStyle, color: h.instagram === 'N/A' ? textMuted : '#9fd8a8' }}>
                          {h.instagram === 'N/A' ? 'N/A' : <a href={`https://${h.instagram}`} target="_blank" rel="noreferrer" style={{ color: '#9fd8a8', textDecoration: 'none' }}>{h.instagram}</a>}
                        </td>
                        <td style={{ ...tdStyle, color: h.email === 'N/A' ? textMuted : '#9fd8a8' }}>{h.email}</td>
                        <td style={tdStyle}>
                          <input type="checkbox" checked={h.contacted} onChange={() => toggleContacted(i)} style={{ width: 17, height: 17, accentColor: gold }} />
                        </td>
                        <td style={tdStyle}>
                          <button onClick={() => removeHistory(i)} style={{ border: 'none', background: 'transparent', color: '#d98787', fontSize: 19, cursor: 'pointer' }}>×</button>
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
