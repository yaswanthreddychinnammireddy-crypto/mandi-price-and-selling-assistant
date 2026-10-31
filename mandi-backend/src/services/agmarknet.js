import { config } from '../config.js';

const BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const PAGE = 500;

// Agmarknet dates come as dd/mm/yyyy
function toIsoDate(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || '');
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function normalize(r) {
  const modal = Number(r.modal_price);
  const date = toIsoDate(r.arrival_date);
  if (!Number.isFinite(modal) || modal <= 0 || !date) return null;
  const num = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : null);
  return {
    state: r.state?.trim(),
    district: r.district?.trim() || '',
    market: r.market?.trim(),
    commodity: r.commodity?.trim(),
    variety: r.variety?.trim() || '',
    grade: r.grade?.trim() || '',
    arrival_date: date,
    min_price: num(r.min_price),
    max_price: num(r.max_price),
    modal_price: modal,
  };
}

export async function fetchStatePrices(state) {
  if (!config.dataGovKey) throw new Error('DATA_GOV_API_KEY is not set');
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const url = new URL(BASE);
    url.searchParams.set('api-key', config.dataGovKey);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', String(PAGE));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('filters[state]', state);

    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`data.gov.in responded ${res.status} for ${state}`);
    const body = await res.json();
    const records = body.records || [];
    for (const r of records) {
      const n = normalize(r);
      if (n && n.state && n.market && n.commodity) out.push(n);
    }
    if (records.length < PAGE) break;
  }
  return out;
}
