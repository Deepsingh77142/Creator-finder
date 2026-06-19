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
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function addToHistory(creator) {
    const entry = { ...creator, addedAt: new Date().toISOString(), contacted: false };
    saveHistory([entry, ...history]);
    alert('Added: ' + creator.name);
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

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>Creator Lead Finder</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: '#f0f0f0', borderRadius: 10, padding: 4 }}>
        <button onClick={() => setTab('find')} style={{ flex: 1, padding: 8, border: 'none', borderRadius: 8, background: tab === 'find' ? '#fff' : 'transparent', fontWeight: tab === 'find' ? 600 : 400 }}>Find</button>
        <button onClick={() => setTab('history')} style={{ flex: 1, padding: 8, border: 'none', borderRadius: 8, background: tab === 'history' ? '#fff' : 'transparent', fontWeight: tab === 'history' ? 600 : 400 }}>History</button>
      </div>

      {tab === 'find' && (
        <div>
          <input
            type="text"
            placeholder="e.g. tech reviews, fitness"
            value={niche}
            onChange={e => setNiche(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 8, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="number" value={minSubs} onChange={e => setMinSubs(e.target.value)} placeholder="Min subs" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
            <input type="number" value={maxSubs} onChange={e => setMaxSubs(e.target.value)} placeholder="Max subs" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          </div>
          <button onClick={searchCreators} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, marginBottom: 16 }}>
            {loading ? 'Searching...' : 'Search YouTube'}
          </button>

          {error && <div style={{ color: 'red', marginBottom: 16, fontSize: 13 }}>{error}</div>}

          {results.map(r => (
            <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                {r.thumb && <img src={r.thumb} alt="" style={{ width: 38, height: 38, borderRadius: '50%' }} />}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{r.subs} subscribers · {r.category}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>Email: {r.email}</div>
              <a href={r.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#2563eb' }}>Open channel ↗</a>
              <button onClick={() => addToHistory(r)} style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600 }}>
                Add to history
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{history.length}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Total leads</div>
            </div>
            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{history.filter(h => h.contacted).length}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Contacted</div>
            </div>
          </div>
          {history.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: 20 }}>No leads saved yet.</div>}
          {history.map((h, i) => (
            <div key={i} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{h.name}</div>
                <div style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.email}</div>
              </div>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={h.contacted} onChange={() => toggleContacted(i)} /> done
              </label>
              <button onClick={() => removeHistory(i)} style={{ border: 'none', background: 'transparent', color: 'red', fontSize: 18 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
