// Mock aggregated prediction market data across major platforms.
export const PLATFORMS = {
  polymarket: { name: 'Polymarket', color: '#3b82f6' },
  kalshi:     { name: 'Kalshi',     color: '#60a5fa' },
  manifold:   { name: 'Manifold',   color: '#1d4ed8' },
  predictit:  { name: 'PredictIt',  color: '#93c5fd' },
}

export const CATEGORIES = ['All', 'Politics', 'Crypto', 'Sports', 'Economy', 'Tech', 'Culture']

export const MARKETS = [
  {
    id: 1,
    question: 'Will the Fed cut rates at the June 2026 meeting?',
    category: 'Economy',
    volume: 4_820_000,
    deadline: '2026-06-18',
    quotes: { polymarket: 0.62, kalshi: 0.59, manifold: 0.64, predictit: 0.60 },
  },
  {
    id: 2,
    question: 'Bitcoin above $150k by end of 2026?',
    category: 'Crypto',
    volume: 9_140_000,
    deadline: '2026-12-31',
    quotes: { polymarket: 0.41, kalshi: 0.38, manifold: 0.45, predictit: null },
  },
  {
    id: 3,
    question: 'Democrats win the 2026 US House majority?',
    category: 'Politics',
    volume: 12_300_000,
    deadline: '2026-11-03',
    quotes: { polymarket: 0.54, kalshi: 0.52, manifold: 0.57, predictit: 0.55 },
  },
  {
    id: 4,
    question: 'Lakers make the 2026 NBA Finals?',
    category: 'Sports',
    volume: 2_110_000,
    deadline: '2026-06-01',
    quotes: { polymarket: 0.18, kalshi: null, manifold: 0.22, predictit: null },
  },
  {
    id: 5,
    question: 'OpenAI releases GPT-6 in 2026?',
    category: 'Tech',
    volume: 3_540_000,
    deadline: '2026-12-31',
    quotes: { polymarket: 0.33, kalshi: 0.30, manifold: 0.39, predictit: null },
  },
  {
    id: 6,
    question: 'US GDP growth above 2.5% in Q2 2026?',
    category: 'Economy',
    volume: 1_780_000,
    deadline: '2026-07-30',
    quotes: { polymarket: 0.47, kalshi: 0.49, manifold: 0.44, predictit: 0.48 },
  },
  {
    id: 7,
    question: 'Taylor Swift announces new album before July?',
    category: 'Culture',
    volume: 980_000,
    deadline: '2026-07-01',
    quotes: { polymarket: 0.71, kalshi: null, manifold: 0.68, predictit: null },
  },
  {
    id: 8,
    question: 'Ethereum flips Bitcoin market cap in 2026?',
    category: 'Crypto',
    volume: 2_640_000,
    deadline: '2026-12-31',
    quotes: { polymarket: 0.08, kalshi: null, manifold: 0.12, predictit: null },
  },
]

export const avgPrice = (quotes) => {
  const vals = Object.values(quotes).filter((v) => v != null)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export const spread = (quotes) => {
  const vals = Object.values(quotes).filter((v) => v != null)
  return Math.max(...vals) - Math.min(...vals)
}

export const bestYes = (quotes) => {
  let best = { platform: null, price: Infinity }
  for (const [p, v] of Object.entries(quotes)) {
    if (v != null && v < best.price) best = { platform: p, price: v }
  }
  return best
}

export const bestNo = (quotes) => {
  let best = { platform: null, price: Infinity }
  for (const [p, v] of Object.entries(quotes)) {
    if (v != null && 1 - v < best.price) best = { platform: p, price: 1 - v }
  }
  return best
}
