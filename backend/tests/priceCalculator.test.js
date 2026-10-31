const test = require('node:test');
const assert = require('node:assert/strict');
const { estimateValues } = require('../src/utils/priceCalculator');
test('uses the highest verified modal price and supplied costs', () => {
  const result = estimateValues({ quantity: 2, transportCost: 100, otherCosts: 50, marketPrices: [{ mandi: 'A', modalPrice: 100 }, { mandi: 'B', modalPrice: 120 }] });
  assert.deepEqual(result, { grossValue: 240, estimatedCosts: 150, netValue: 90, basis: { mandi: 'B', modalPrice: 120 } });
});
test('does not invent values when no verified modal price exists', () => assert.equal(estimateValues({ quantity: 1, marketPrices: [] }).grossValue, null));
