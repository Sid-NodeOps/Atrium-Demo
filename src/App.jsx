import React, { useMemo, useState } from 'react'
import { MARKETS, PLATFORMS, CATEGORIES, avgPrice, spread, bestYes, bestNo } from './data.js'

const fmtPct = (v) => (v == null ? '—' : `${(v * 100).toFixed(0)}¢`)
const fmtVol = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${(v / 1e3).toFixed(0)}K`)

function Header({ query, setQuery }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">◆</div>
        <div>
          <h1>OracleHub</h1>
          <span className="tag">Prediction Market Aggregator</span>
        </div>
      </div>
      <input
        className="search"
        placeholder="Search markets..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="platforms">
        {Object.values(PLATFORMS).map((p) => (
          <span key={p.name} className="chip" style={{ borderColor: p.color }}>
            <span className="dot" style={{ background: p.color }} />
            {p.name}
          </span>
        ))}
      </div>
    </header>
  )
}

function StatStrip() {
  const totalVol = MARKETS.reduce((a, m) => a + m.volume, 0)
  const avgSpread = MARKETS.reduce((a, m) => a + spread(m.quotes), 0) / MARKETS.length
  return (
    <div className="stats">
      <Stat label="Tracked Markets" value={MARKETS.length} />
      <Stat label="Total Volume" value={fmtVol(totalVol)} />
      <Stat label="Platforms" value={Object.keys(PLATFORMS).length} />
      <Stat label="Avg Spread" value={`${(avgSpread * 100).toFixed(1)}¢`} />
    </div>
  )
}

const Stat = ({ label, value }) => (
  <div className="stat">
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
)

function MarketCard({ m, onOpen }) {
  const avg = avgPrice(m.quotes)
  const sp = spread(m.quotes)
  const arb = sp > 0.05
  return (
    <div className="card" onClick={() => onOpen(m)}>
      <div className="card-top">
        <span className="cat">{m.category}</span>
        {arb && <span className="arb">ARB {(sp * 100).toFixed(0)}¢</span>}
      </div>
      <h3 className="q">{m.question}</h3>
      <div className="big-price">
        <span className="pct">{(avg * 100).toFixed(0)}%</span>
        <span className="pct-label">consensus YES</span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${avg * 100}%` }} />
      </div>
      <div className="quotes">
        {Object.entries(m.quotes).map(([key, v]) => (
          <div key={key} className="quote">
            <span className="qdot" style={{ background: PLATFORMS[key].color }} />
            <span className="qname">{PLATFORMS[key].name}</span>
            <span className="qval">{fmtPct(v)}</span>
          </div>
        ))}
      </div>
      <div className="card-foot">
        <span>Vol {fmtVol(m.volume)}</span>
        <span>Ends {m.deadline}</span>
      </div>
    </div>
  )
}

function Modal({ market, onClose }) {
  if (!market) return null
  const by = bestYes(market.quotes)
  const bn = bestNo(market.quotes)
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose}>×</button>
        <span className="cat">{market.category}</span>
        <h2>{market.question}</h2>
        <div className="best-row">
          <div className="best">
            <div className="best-label">Best YES</div>
            <div className="best-val">{fmtPct(by.price)}</div>
            <div className="best-plat">{PLATFORMS[by.platform]?.name}</div>
          </div>
          <div className="best">
            <div className="best-label">Best NO</div>
            <div className="best-val">{fmtPct(bn.price)}</div>
            <div className="best-plat">{PLATFORMS[bn.platform]?.name}</div>
          </div>
          <div className="best">
            <div className="best-label">Volume</div>
            <div className="best-val">{fmtVol(market.volume)}</div>
            <div className="best-plat">across venues</div>
          </div>
        </div>
        <h4>Order book by venue</h4>
        <table className="book">
          <thead>
            <tr><th>Platform</th><th>YES</th><th>NO</th><th>Action</th></tr>
          </thead>
          <tbody>
            {Object.entries(market.quotes).map(([k, v]) => (
              <tr key={k}>
                <td><span className="qdot" style={{ background: PLATFORMS[k].color }} /> {PLATFORMS[k].name}</td>
                <td>{fmtPct(v)}</td>
                <td>{v == null ? '—' : fmtPct(1 - v)}</td>
                <td>{v == null ? <span className="muted">unlisted</span> : <button className="trade">Trade →</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [sort, setSort] = useState('volume')
  const [active, setActive] = useState(null)

  const filtered = useMemo(() => {
    let r = MARKETS.filter((m) =>
      (cat === 'All' || m.category === cat) &&
      m.question.toLowerCase().includes(query.toLowerCase())
    )
    if (sort === 'volume') r = [...r].sort((a, b) => b.volume - a.volume)
    if (sort === 'spread') r = [...r].sort((a, b) => spread(b.quotes) - spread(a.quotes))
    if (sort === 'deadline') r = [...r].sort((a, b) => a.deadline.localeCompare(b.deadline))
    return r
  }, [query, cat, sort])

  return (
    <div className="app">
      <Header query={query} setQuery={setQuery} />
      <StatStrip />
      <div className="controls">
        <div className="cats">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`cat-btn ${cat === c ? 'active' : ''}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort">
          <option value="volume">Sort: Volume</option>
          <option value="spread">Sort: Arbitrage</option>
          <option value="deadline">Sort: Deadline</option>
        </select>
      </div>
      <div className="grid">
        {filtered.map((m) => <MarketCard key={m.id} m={m} onOpen={setActive} />)}
      </div>
      {filtered.length === 0 && <div className="empty">No markets match your filters.</div>}
      <Modal market={active} onClose={() => setActive(null)} />
      <footer className="footer">Demo UI · Mock data · OracleHub © 2026</footer>
    </div>
  )
}
