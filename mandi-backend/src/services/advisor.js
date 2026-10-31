import { db } from '../db.js';

const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const round = (n) => (n == null ? null : Math.round(n));

/** Daily average modal price (Rs/qtl) for a commodity, oldest -> newest. */
export function getSeries({ commodity, state, market, days = 30 }) {
  const params = [commodity, state, daysAgo(days)];
  let marketClause = '';
  if (market) { marketClause = 'AND market = ? COLLATE NOCASE'; params.push(market); }
  return db.prepare(`
    SELECT arrival_date AS date, ROUND(AVG(modal_price)) AS modal
    FROM prices
    WHERE commodity = ? COLLATE NOCASE AND state = ? COLLATE NOCASE
      AND arrival_date >= ? ${marketClause}
    GROUP BY arrival_date ORDER BY arrival_date
  `).all(...params);
}

/** Latest price per market for a commodity in a state (last `withinDays` days). */
export function compareMarkets({ commodity, state, withinDays = 3 }) {
  const since = daysAgo(withinDays);
  return db.prepare(`
    SELECT p.market, p.district, p.arrival_date,
           ROUND(AVG(p.modal_price)) AS modal_price,
           MIN(p.min_price) AS min_price, MAX(p.max_price) AS max_price
    FROM prices p
    JOIN (
      SELECT market, MAX(arrival_date) AS d FROM prices
      WHERE commodity = ? COLLATE NOCASE AND state = ? COLLATE NOCASE AND arrival_date >= ?
      GROUP BY market
    ) x ON x.market = p.market AND x.d = p.arrival_date
    WHERE p.commodity = ? COLLATE NOCASE AND p.state = ? COLLATE NOCASE
    GROUP BY p.market, p.district, p.arrival_date
    ORDER BY modal_price DESC
  `).all(commodity, state, since, commodity, state);
}

// Least-squares slope in Rs/qtl per day
function slope(series) {
  const n = series.length;
  if (n < 3) return 0;
  const xs = series.map((_, i) => i);
  const ys = series.map((s) => s.modal);
  const mx = avg(xs), my = avg(ys);
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  return den ? num / den : 0;
}

/**
 * Rule-based selling advice. This is a heuristic on recent history,
 * NOT a price forecast.
 */
export function adviseSell({ commodity, state, market, quantity_qtl, expected_price }) {
  const series = getSeries({ commodity, state, market, days: 21 });
  if (series.length < 3) {
    return { recommendation: 'INSUFFICIENT_DATA', reasons: ['Not enough recent price records for this commodity/market.'], dataPoints: series.length };
  }

  const latest = series.at(-1).modal;
  const last7 = series.slice(-7).map((s) => s.modal);
  const avg7 = avg(last7);
  const avgAll = avg(series.map((s) => s.modal));
  const perDay = slope(series.slice(-10));
  const trendPct = (perDay * 7 / avgAll) * 100;     // approx weekly % move
  const peak = Math.max(...series.map((s) => s.modal));
  const sd = Math.sqrt(avg(series.map((s) => (s.modal - avgAll) ** 2)));
  const volatilityPct = (sd / avgAll) * 100;

  const reasons = [];
  let recommendation = 'NEUTRAL';

  const nearPeak = latest >= peak * 0.97;
  const aboveAvg = latest >= avgAll * 1.05;

  if (nearPeak || (aboveAvg && trendPct <= 0)) {
    recommendation = 'SELL_NOW';
    if (nearPeak) reasons.push('Price is within 3% of its 3-week high.');
    if (aboveAvg) reasons.push('Price is at least 5% above the 3-week average.');
    if (trendPct <= 0) reasons.push('Momentum has flattened or turned down.');
  } else if (trendPct >= 3 && latest < peak * 0.97) {
    recommendation = 'HOLD_SHORT';
    reasons.push(`Prices rising about ${trendPct.toFixed(1)}% per week.`);
    reasons.push('Still below the recent high, so there may be room to climb.');
  } else if (latest <= avgAll * 0.95 && trendPct < 0) {
    recommendation = 'HOLD_IF_STORABLE';
    reasons.push('Price is 5%+ below the 3-week average and still falling; sell only if you must or the crop cannot be stored.');
  } else {
    reasons.push('No strong signal in recent prices.');
  }

  if (volatilityPct > 10) reasons.push(`Prices are volatile (about ${volatilityPct.toFixed(0)}% spread), so keep a margin of safety.`);

  const result = {
    recommendation,
    reasons,
    stats: {
      latestModal: round(latest), avg7Day: round(avg7), avg21Day: round(avgAll),
      high21Day: round(peak), weeklyTrendPct: Number(trendPct.toFixed(1)),
      volatilityPct: Number(volatilityPct.toFixed(1)), dataPoints: series.length,
    },
    series,
  };

  if (expected_price) {
    const gapPct = ((expected_price - latest) / latest) * 100;
    result.expectedPriceCheck = {
      expected_price, gapVsLatestModalPct: Number(gapPct.toFixed(1)),
      verdict: gapPct > 15 ? 'UNLIKELY_TO_SELL' : gapPct >= -5 ? 'REALISTIC' : 'BELOW_MARKET',
    };
  }
  if (quantity_qtl) result.estimatedValueAtLatestModal = round(latest * quantity_qtl);

  const alternatives = compareMarkets({ commodity, state }).slice(0, 5);
  result.bestMarkets = alternatives;
  if (market && alternatives.length) {
    const here = alternatives.find((m) => m.market.toLowerCase() === market.toLowerCase());
    const top = alternatives[0];
    if (here && top.modal_price > here.modal_price * 1.05) {
      result.reasons.push(`${top.market} pays about Rs ${top.modal_price - here.modal_price}/qtl more than ${here.market}; compare against transport cost.`);
    }
  }
  return result;
}
