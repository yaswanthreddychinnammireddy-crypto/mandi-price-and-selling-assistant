function estimateValues({ quantity, marketPrices, transportCost = 0, otherCosts = 0 }) {
  const best = marketPrices.filter((price) => Number.isFinite(price.modalPrice)).sort((a, b) => b.modalPrice - a.modalPrice)[0];
  if (!best) return { grossValue: null, estimatedCosts: null, netValue: null, basis: null };
  const grossValue = best.modalPrice * quantity;
  const estimatedCosts = Number(transportCost) + Number(otherCosts);
  return { grossValue, estimatedCosts, netValue: grossValue - estimatedCosts, basis: best };
}
module.exports = { estimateValues };
