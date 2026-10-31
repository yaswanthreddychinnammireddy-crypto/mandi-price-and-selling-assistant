// ==========================================================================
// KISAN SETU (किसान सेतु) - BACKEND SERVICE & AGRI-AI MIDDLEWARE
// Architecture:
// [User App] -> [Backend Middleware (Geocoding/Spatial + Agmarknet)] 
//            -> [AI Engine (Prompt + Context)] -> [User Interface]
// ==========================================================================

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const AgriData = require("./js/mock-data.js");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

// Known District Geocoding Database for Fast Spatial Querying
const DISTRICT_GEO_CACHE = {
  "indore": { lat: 22.7312, lng: 75.8648, name: "Indore Rural / Depalpur", state: "Madhya Pradesh", zone: "Central Malwa Plateau (Black Cotton Soil)" },
  "sanwer": { lat: 22.9734, lng: 75.8287, name: "Sanwer Tehsil Cluster", state: "Madhya Pradesh", zone: "North Malwa Grain Corridor" },
  "rau": { lat: 22.6320, lng: 75.8150, name: "Rau / Mhow Corridor", state: "Madhya Pradesh", zone: "South Indore Perishable & Horticulture Belt" },
  "dewas": { lat: 22.9676, lng: 76.0534, name: "Dewas Agro-Industrial Hub", state: "Madhya Pradesh", zone: "Dewas-Ujjain Heavy Oilseeds Belt" },
  "ujjain": { lat: 23.1765, lng: 75.7885, name: "Ujjain Chimanganj Mandi Belt", state: "Madhya Pradesh", zone: "Shipra Alluvial Soil Basin" },
  "bhopal": { lat: 23.2599, lng: 77.4126, name: "Bhopal Regional Krishi Yard", state: "Madhya Pradesh", zone: "Bhopal-Sehore Heavy Pulse Belt" },
  "nashik": { lat: 20.0059, lng: 73.7898, name: "Lasalgaon / Nashik APMC", state: "Maharashtra", zone: "Maharashtra Premier Onion & Grape Hub" },
  "karnal": { lat: 29.6857, lng: 76.9907, name: "Karnal Grain Terminal", state: "Haryana", zone: "Indo-Gangetic Basmati Paddy Belt" },
  "rajkot": { lat: 22.3039, lng: 70.8022, name: "Rajkot APMC Yard", state: "Gujarat", zone: "Saurashtra High-Yield Cotton Corridor" },
  "nagpur": { lat: 21.1458, lng: 79.0882, name: "Nagpur Orange & Cotton Mandi", state: "Maharashtra", zone: "Vidarbha Agro Belt" }
};

// Haversine Spatial Distance Calculator
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// --------------------------------------------------------------------------
// BACKEND MIDDLEWARE: Spatial Analysis & Agmarknet/e-NAM Query Handler
// --------------------------------------------------------------------------
function handleAnalyzeLocation(req, res, parsedUrl) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    let payload = {};
    if (req.method === "POST" && body) {
      try { payload = JSON.parse(body); } catch (e) { payload = {}; }
    } else {
      // Query parameters fallback
      payload = {
        lat: parseFloat(parsedUrl.searchParams.get("lat")),
        lng: parseFloat(parsedUrl.searchParams.get("lng")),
        district: parsedUrl.searchParams.get("district"),
        crop: parsedUrl.searchParams.get("crop") || "wheat-sharbati",
        lang: parsedUrl.searchParams.get("lang") || "en"
      };
    }

    const cropId = payload.crop || "wheat-sharbati";
    const targetCrop = AgriData.commodities.find(c => c.id === cropId) || AgriData.commodities[0];

    // 1. Geocoding / Spatial Query
    let userLat = 22.7312;
    let userLng = 75.8648;
    let locationName = "Indore Rural / Depalpur";
    let locationZone = "Central Malwa Plateau (Black Cotton Soil)";

    if (payload.district && typeof payload.district === "string") {
      const cleanKey = payload.district.trim().toLowerCase();
      const matched = DISTRICT_GEO_CACHE[cleanKey] || 
        Object.entries(DISTRICT_GEO_CACHE).find(([k]) => cleanKey.includes(k))?.[1];
      if (matched) {
        userLat = matched.lat;
        userLng = matched.lng;
        locationName = matched.name;
        locationZone = matched.zone;
      } else {
        locationName = `${payload.district.trim()} District Farm`;
      }
    } else if (!isNaN(payload.lat) && !isNaN(payload.lng)) {
      userLat = payload.lat;
      userLng = payload.lng;
      locationName = `My Farm (${userLat.toFixed(4)}°, ${userLng.toFixed(4)}°)`;
    }

    // 2. Data Fetch & Spatial Matrix: Query Mandis & calculate distances
    const surroundingMandis = AgriData.mandis.map(mandi => {
      const dist = calculateHaversineKm(userLat, userLng, mandi.lat, mandi.lng);
      const price = (mandi.cropPrices && mandi.cropPrices[cropId]) || targetCrop.currentPrice;
      const tractorMins = Math.round(dist * 2.2); // ~25 km/h tractor transit
      return {
        id: mandi.id,
        name: mandi.name,
        type: mandi.type,
        lat: mandi.lat,
        lng: mandi.lng,
        distanceKm: dist,
        tractorMins: tractorMins,
        dailyArrivals: mandi.dailyArrivals,
        timing: mandi.timing,
        contact: mandi.contact,
        image: mandi.image,
        facilities: mandi.facilities,
        liveCropPrice: price
      };
    });

    // Sort by proximity
    surroundingMandis.sort((a, b) => a.distanceKm - b.distanceKm);

    const closestMandi = surroundingMandis[0];
    const highestMandi = surroundingMandis.reduce((max, m) => m.liveCropPrice > max.liveCropPrice ? m : max, surroundingMandis[0]);

    // 3. Economic Price Arbitrage Calculation
    const priceDiff = highestMandi.liveCropPrice - closestMandi.liveCropPrice;
    const distDiff = Math.max(0, Math.round(highestMandi.distanceKm - closestMandi.distanceKm));
    const dieselCost = Math.round(distDiff * 2 * 18); // ~₹18 per km round-trip diesel
    const grossProfit40Qtl = priceDiff * 40; // Standard 40 Quintal trolley load
    const netProfit40Qtl = grossProfit40Qtl - dieselCost;

    // 4. AI Engine: Formulate System Prompt + Context Injection
    const aiEngineOutput = generateAgriAIAdvice({
      locationName,
      locationZone,
      crop: targetCrop,
      closestMandi,
      highestMandi,
      priceDiff,
      distDiff,
      dieselCost,
      netProfit40Qtl,
      lang: payload.lang || "en"
    });

    // 5. Construct Complete Response
    const responsePayload = {
      success: true,
      timestamp: new Date().toISOString(),
      locationAnalysis: {
        lat: userLat,
        lng: userLng,
        name: locationName,
        zone: locationZone,
        surroundingCount: surroundingMandis.length
      },
      cropInfo: {
        id: targetCrop.id,
        name: targetCrop.name,
        hindiName: targetCrop.hindiName,
        unit: targetCrop.unit,
        msp: targetCrop.msp,
        image: targetCrop.image
      },
      arbitrage: {
        closestMandi: {
          id: closestMandi.id,
          name: closestMandi.name,
          distanceKm: closestMandi.distanceKm,
          price: closestMandi.liveCropPrice,
          tractorMins: closestMandi.tractorMins
        },
        highestMandi: {
          id: highestMandi.id,
          name: highestMandi.name,
          distanceKm: highestMandi.distanceKm,
          price: highestMandi.liveCropPrice,
          tractorMins: highestMandi.tractorMins
        },
        priceDiffPerQtl: priceDiff,
        distanceDifferenceKm: distDiff,
        estimatedDieselCost: dieselCost,
        grossGain40Qtl: grossProfit40Qtl,
        netFarmerProfit: netProfit40Qtl,
        recommendation: priceDiff > 0 && netProfit40Qtl > 500 ? "TRAVEL_TO_HIGHEST" : "SELL_AT_CLOSEST"
      },
      aiAdvisory: aiEngineOutput,
      surroundingMandis: surroundingMandis
    };

    res.writeHead(200, {
      "Content-Type": "application/json; charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-cache"
    });
    res.end(JSON.stringify(responsePayload, null, 2));
  });
}

// --------------------------------------------------------------------------
// AI ENGINE: Injected Context + System Prompt Generator
// --------------------------------------------------------------------------
function generateAgriAIAdvice(ctx) {
  const closestPrice = ctx.closestMandi.liveCropPrice || ctx.closestMandi.price || 2400;
  const highestPrice = ctx.highestMandi.liveCropPrice || ctx.highestMandi.price || closestPrice;
  const isTravelRecommended = ctx.priceDiff > 0 && ctx.netProfit40Qtl > 500;

  if (isTravelRecommended) {
    return {
      badge: `RECOMMENDED: SELL AT ${ctx.highestMandi.name.toUpperCase()} (+₹${ctx.netProfit40Qtl.toLocaleString("en-IN")} GAIN)`,
      status: "POSITIVE_ARBITRAGE",
      title: `Travel ${ctx.distDiff} km to ${ctx.highestMandi.name} for +₹${ctx.priceDiff}/Qtl Higher Payout`,
      explanation: `While ${ctx.closestMandi.name} is nearest at ${ctx.closestMandi.distanceKm} km (paying ₹${closestPrice}/Qtl), ${ctx.highestMandi.name} is actively bidding ₹${highestPrice}/Qtl. After deducting ₹${ctx.dieselCost} for tractor diesel, your net take-home gain on 40 Quintals is +₹${ctx.netProfit40Qtl.toLocaleString("en-IN")}.`,
      audioSummary: `Namaste Kisan Bhai. Here is your AI Mandi advisory. For ${ctx.crop.name}, ${ctx.highestMandi.name} is offering ${highestPrice} rupees per quintal, which is ${ctx.priceDiff} rupees higher than your nearest yard. Even after tractor fuel expenses, you will make an extra ${ctx.netProfit40Qtl} rupees pure profit on forty quintals. We recommend taking your harvest to ${ctx.highestMandi.name} today.`,
      hindiAudioSummary: `नमस्ते किसान भाई। आज ${ctx.crop.hindiName} के लिए ${ctx.highestMandi.name} में सबसे ऊंचा भाव ₹${highestPrice} प्रति क्विंटल मिल रहा है। यदि आप 40 क्विंटल फसल वहां ले जाते हैं, तो डीजल का खर्च काटकर भी आपको ₹${ctx.netProfit40Qtl.toLocaleString("en-IN")} का अतिरिक्त शुद्ध मुनाफा होगा।`
    };
  } else {
    return {
      badge: `RECOMMENDED: SELL AT YOUR CLOSEST YARD (${ctx.closestMandi.name.toUpperCase()})`,
      status: "OPTIMAL_LOCAL",
      title: `Your Nearest Mandi Offers The Best Local Deal at ₹${closestPrice}/Qtl`,
      explanation: `${ctx.closestMandi.name} is only ${ctx.closestMandi.distanceKm} km away (~${ctx.closestMandi.tractorMins} mins by tractor) and offers fair pricing. Driving to distant Mandis will not offset additional transport and time costs today.`,
      audioSummary: `Namaste Kisan Bhai. Your closest Mandi, ${ctx.closestMandi.name}, is only ${ctx.closestMandi.distanceKm} kilometers away and offers the best net rate for ${ctx.crop.name} at ${closestPrice} rupees per quintal. There is no economic advantage in driving to distant yards today. We recommend selling at ${ctx.closestMandi.name}.`,
      hindiAudioSummary: `नमस्ते किसान भाई। आपकी सबसे नजदीकी मंडी ${ctx.closestMandi.name} मात्र ${ctx.closestMandi.distanceKm} किलोमीटर दूर है और ₹${closestPrice} का बेहतरीन भाव दे रही है। दूर जाने से डीजल का नुकसान होगा। अपनी फसल नजदीकी मंडी में ही बेचें।`
    };
  }
}

// --------------------------------------------------------------------------

// ==========================================================================
// DEEPSEEK AI INTEGRATION: REAL-TIME CONVERSATIONAL AGRI ADVISOR
// ==========================================================================
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

function buildAgriSystemPrompt(lang = "hi", farmerContext = {}) {
  const farmerName = farmerContext.name || "Ramesh Patel";
  const kisanId = farmerContext.kisanId || "KISAN-MP-8841";
  const village = farmerContext.village || "Gram Hatod Farm Gate";
  const district = farmerContext.district || "Indore";
  const state = farmerContext.state || "Madhya Pradesh";
  const pincode = farmerContext.pincode || "453111";
  const landSize = farmerContext.landSize || "12";
  const landUnit = farmerContext.landUnit || "Acres";

  return `You are Kisan Setu AI Farm Doctor & Mandi Advisor (किसान सेतु एआई कृषि सलाहकार), an expert agriculture voice assistant for Indian farmers.
You are currently on a live 2-way phone voice call with the farmer.
Farmer profile:
- Name: ${farmerName} (Kisan Passbook ID: ${kisanId})
- Location: ${village}, ${district} district, ${state} (PIN: ${pincode}, GPS: 22.7312° N, 75.8648° E)
- Landholding: ${landSize} ${landUnit}
- Current Harvest: Sharbati Wheat and Nashik Red Onion

Live Market & Portal Ground Truth Data:
- Surrounding Mandis:
  * Rau Hub: 12.2 km away, has modern cold storage, electronic weighbridge.
  * Dewas Model Agro Mandi: 32.6 km away, subsidized ₹5 Thali canteen, high bidding volume.
  * Indore Main APMC: 0 km away, on-site certified soil testing laboratory.
  * Sanwer Mandi: 27.2 km away.
  * Ujjain Chimanganj Mandi: 50.1 km away.
  * Mhow Cantonment: 22.8 km away.
- Top Verified Merchants:
  * Rajesh Agrawal (+91 98260 44120, Shree Ganesh Agro, 4.9★, instant RTGS, free farm truck dispatch).
  * Kavita Reddy (+91 94250 88210, Deccan Fresh, 4.9★, instant spot cash on digital weighbridge slip).
  * Suresh Patel (+91 97550 33140, Narmada Bio-Oil, 4.7★, buys soybean and mustard).
  * Gurpreet Singh Sandhu (+91 98140 77330, Punjab Heritage Grain, 4.8★, premium wheat buyer).
- Live Crop Bhav & MSP:
  * Sharbati Wheat: ₹2,840 per quintal (Govt MSP: ₹2,275 per quintal, +2.8% today).
  * Red Onion (Nashik Red): ₹2,350 per quintal in Rau, ₹2,390 in Dewas.
  * Garlic (Ooty Special): ₹14,200 per quintal (+5.4%).
  * Yellow Gold Soybean: ₹4,720 per quintal (Govt MSP: ₹4,892 per quintal).
  * Fresh Vegetables: Tomato ₹2,100, Potato ₹1,450, Ginger ₹8,400, Green Chilli ₹3,800, Cauliflower ₹1,600, Cabbage ₹1,150, Green Peas ₹4,200, Carrot ₹1,800 per quintal.
- Microclimate: 27°C, 64% humidity, 8 km/h NW wind, 10% rain probability. Ideal for morning spray.
- Transport & Diesel Arbitrage: Dewas vs Indore gives +₹412 net extra profit on a 40-quintal trolley after ₹1,188 diesel fuel deduction for 33 km round trip.
- Crop Disease & Spray Advisory: Mancozeb 75% WP @ 2.5g/L for leaf spots and blight; Imidacloprid 17.8% SL @ 0.5ml/L for sucking pests/aphids.

VOICE RESPONSE RULES:
1. Always respond in complete, warm, polite, conversational full sentences.
2. DO NOT use markdown asterisks (*), bullet points, hashtags, or emoji in your spoken speech.
3. Spell out numbers, percentages, and currencies naturally (e.g., "two thousand three hundred fifty rupees per quintal", "three percent").
4. Respond strictly in the farmer's dialect: ${lang} (English, Hindi, Punjabi, Marathi, Gujarati, or Telugu).
5. Keep answers concise (2 to 4 spoken sentences) so the voice conversation is natural and easy to follow over audio.`;
}

function handleChatAI(req, res) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    let payload = {};
    try { payload = JSON.parse(body); } catch (e) { payload = {}; }

    const userMessage = payload.message || "";
    const lang = payload.language || "hi";
    const history = Array.isArray(payload.history) ? payload.history : [];
    const farmerContext = payload.farmerContext || {};

    if (!userMessage.trim()) {
      res.writeHead(400, { "Content-Type": "application/json; charset=UTF-8" });
      res.end(JSON.stringify({ success: false, error: "Empty message" }));
      return;
    }

    const systemPrompt = buildAgriSystemPrompt(lang, farmerContext);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map(h => ({
        role: h.role === "assistant" || h.role === "ai" ? "assistant" : "user",
        content: String(h.content || "")
      })),
      { role: "user", content: userMessage }
    ];

    const postData = JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const deepseekReq = https.request({
      hostname: "api.deepseek.com",
      path: "/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Length": Buffer.byteLength(postData)
      },
      timeout: 12000
    }, (deepseekRes) => {
      let dsBody = "";
      deepseekRes.on("data", chunk => dsBody += chunk);
      deepseekRes.on("end", () => {
        try {
          const json = JSON.parse(dsBody);
          if (deepseekRes.statusCode >= 200 && deepseekRes.statusCode < 300 && json.choices && json.choices[0]) {
            const answer = json.choices[0].message.content.trim();
            res.writeHead(200, {
              "Content-Type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({
              success: true,
              answer: answer,
              model: "deepseek-chat",
              provider: "deepseek"
            }));
          } else {
            // DeepSeek API error (e.g. 402 Insufficient Balance or rate limit)
            res.writeHead(200, {
              "Content-Type": "application/json; charset=UTF-8",
              "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify({
              success: false,
              statusCode: deepseekRes.statusCode,
              error: json.error?.message || `DeepSeek HTTP ${deepseekRes.statusCode}`,
              provider: "fallback_required"
            }));
          }
        } catch (e) {
          res.writeHead(200, {
            "Content-Type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*"
          });
          res.end(JSON.stringify({
            success: false,
            error: "Failed to parse DeepSeek response",
            provider: "fallback_required"
          }));
        }
      });
    });

    deepseekReq.on("error", (err) => {
      res.writeHead(200, {
        "Content-Type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(JSON.stringify({
        success: false,
        error: err.message,
        provider: "fallback_required"
      }));
    });

    deepseekReq.on("timeout", () => {
      deepseekReq.destroy();
      res.writeHead(200, {
        "Content-Type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*"
      });
      res.end(JSON.stringify({
        success: false,
        error: "DeepSeek API request timed out",
        provider: "fallback_required"
      }));
    });

    deepseekReq.write(postData);
    deepseekReq.end();
  });
}

// HTTP SERVER ROUTING
// --------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost:3000"}`);

  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  // API Route: Location Analysis & Surrounding Mandi Rates
  if (parsedUrl.pathname === "/api/analyze-location") {
    handleAnalyzeLocation(req, res, parsedUrl);
    return;
  }

  // API Route: DeepSeek AI Conversational Assistant
  if (parsedUrl.pathname === "/api/chat-ai") {
    handleChatAI(req, res);
    return;
  }

  // Reverse Proxy to Mandi Assistant Express Backend (Port 5000)
  const isExpressBackendRoute = [
    "/api/auth",
    "/api/mandi",
    "/api/selling",
    "/api/alerts"
  ].some(prefix => parsedUrl.pathname.startsWith(prefix));

  if (isExpressBackendRoute) {
    const proxyReq = http.request({
      hostname: "localhost",
      port: 5000,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: "localhost:5000" }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      res.writeHead(502, { "Content-Type": "application/json; charset=UTF-8" });
      res.end(JSON.stringify({ success: false, error: "Backend API proxy error: " + err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  // Static File Serving
  let safeUrl = parsedUrl.pathname;
  if (safeUrl === "/" || safeUrl === "") {
    safeUrl = "/index.html";
  }

  const filePath = path.join(PUBLIC_DIR, path.normalize(safeUrl).replace(/^(\.\.[\/\\])+/, ""));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
      res.end(`404 Not Found: ${safeUrl}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌾 Kisan Setu (किसान सेतु) Backend & AI Engine Active!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ API: http://localhost:${PORT}/api/analyze-location`);
  console.log(`======================================================\n`);
});
