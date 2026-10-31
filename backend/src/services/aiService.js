const OpenAI = require('openai');
const env = require('../config/env');

const languages = ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Marathi'];
async function generateSellingAdvice({ request, prices, valuation }) {
  if (!env.openAiKey) return { available: false, message: 'AI service is not configured. Market facts and calculations are returned without generated advice.' };
  const clientOptions = { apiKey: env.openAiKey };
  if (env.openAiBaseUrl) {
    clientOptions.baseURL = env.openAiBaseUrl;
  }
  const client = new OpenAI(clientOptions);
  const facts = prices.map((price) => ({ mandi: price.mandi, state: price.state, district: price.district, variety: price.variety, minPrice: price.minPrice, maxPrice: price.maxPrice, modalPrice: price.modalPrice, unit: price.unit, priceDate: new Date(price.priceDate).toISOString().slice(0, 10), source: price.dataSource }));
  const language = languages.includes(request.language) ? request.language : 'English';
  const completion = await client.chat.completions.create({
    model: env.openAiModel, temperature: 0.2, messages: [
      { role: 'system', content: `You are an Indian farmer selling assistant. Respond in ${language}. Use only the supplied verified market facts and calculations. Do not invent prices, MSP, market trends, schemes, transport costs, or future outcomes. Say when MSP is not supplied. Never guarantee future prices or profits. Clearly state data date/source and risks of waiting.` },
      { role: 'user', content: JSON.stringify({ farmerRequest: request, verifiedMarketFacts: facts, calculation: valuation }) }
    ]
  });
  return { available: true, message: completion.choices[0]?.message?.content || 'No advice generated.' };
}
module.exports = { generateSellingAdvice };
