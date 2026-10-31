# KisanSetu (किसान सेतु) — Frosted Glass AgriTech Frontend

> **Designed by:** Principal UI/UX Architect (10+ Years Experience in Mobile-First & Rural Ergonomics)  
> **Aesthetic System:** *Frosted Terra (Glassmorphism 2.0 with Agricultural Grounding)*

---

## 🌾 Design Philosophy & Human-Centered UX Rationale

Designing for farmers requires bridging the gap between high-tech intelligent tools (AI, live bidding, geospatial tracking) and challenging physical realities (harsh direct sunlight, weathered hands, intermittent literacy, varying bandwidth, and local dialects).

### 1. The "Frosted Terra" Visual Language
- **Tactile Glassmorphism (`backdrop-filter: blur(16px - 28px)`):** Translucent card surfaces bring an airy, modern, premium aesthetic, reflecting natural lighting and organic earthy backdrops without feeling sterile or corporate.
- **Micro-Bevels & Specular Rim Lights:** Every glass panel features an inset `1px` specular border (`rgba(255, 255, 255, 0.65)`) and subtle ambient shadow, creating tactile separation and depth hierarchy.
- **Earthy Chromatic Palette:**
  - Deep Canopy Green (`#124e2c`) & Chlorophyll (`#16a34a`) for primary actions and trust.
  - Ripened Wheat / Amber Gold (`#f59e0b`) for active buying bids and commerce highlights.
  - Soil Charcoal (`#0f2416`) for crisp, legible typography.

---

## 🚜 Key Architectural Features

### 1. Voice-First "Call to AI Chatbot" (Kisan Vaani)
Farmers often cannot type lengthy queries while in the field.
- **Direct Voice Call Modal:** Clicking **"Call AI Agri-Bot"** opens a live call screen with a Canvas soundwave audio visualizer, call duration timer, and speaker/mute controls.
- **Two-Way Audio Simulation:** Integrated with browser Web Speech Synthesis (`SpeechSynthesisUtterance`) so the AI speaks out loud in natural audio.
- **Instant Topic Chips:** Pre-built chips for rate inquiry, disease diagnosis (e.g. yellow spots on leaves), and weather spray forecast.
- **TTS Readouts on Demand:** Every crop card features an audio button so semi-literate farmers can hear price quotes read out with one tap.

### 2. Real-Time Mandi Prices & Live Fluctuations
- **Infinite Marquee Ticker:** At the very top, streaming active prices across regional APMC Mandis.
- **MSP Support Comparison:** Visual pills clearly indicate whether a crop is trading *above* or *below* Government Minimum Support Price (MSP).
- **SVG Sparklines:** Micro trend graphs reveal 24-hour momentum for each crop (Wheat, Basmati Rice, Soybean, Cotton, Onion, Tomato, Mustard, Chana).
- **Live Market Volatility Engine:** Simulated real-time auction ticks update prices every few seconds with emerald/red micro-flashes.

### 3. Direct Merchant Marketplace (Zero Middlemen)
- **Verified Buyer Profiles:** Ratings, export licenses, verified badges, and active bids.
- **On-Farm Pickup Tags:** Distinguishes merchants who provide free transport/tractors to the farmer's gate.
- **One-Tap Dialing:** Clickable `tel:` links to call merchants directly.
- **Post Harvest Modal:** Instant gross revenue estimation calculator based on quantity (Quintals) and current top bids.

### 4. Geospatial Mandis & Merchant Hubs (Interactive Leaflet Map)
- **Custom Frosted Pins:** Distinct markers for APMC Mandis (🏛️) and Merchant pickup trucks (🚜).
- **Radius Switcher:** Filter distances by 15 km, 25 km, or 50 km.
- **Directions & Facilities:** Displays electronic weighbridges, cold storage capacities, and contact details.

### 5. Rural Accessibility & Outdoor Ergonomics
- ☀️ **Outdoor Sunlight Mode:** Anti-glare high-contrast toggle that boosts contrast and opacity for readability under direct field sunlight.
- 🔤 **Text Size Magnifier (`A+`):** 3-stage font scaling (Normal, Large +12%, Extra Large +25%) for varying eyesight needs.
- 🌐 **Vernacular Readiness:** Language switcher supporting English, हिन्दी (Hindi), and ਪੰਜਾਬੀ (Punjabi).
- 👆 **Ergonomic Touch Targets:** Minimum 48px to 56px touch areas designed for gloved or weathered hands.

---

## 🚀 How to Run & Preview

1. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, run using Node.js:
   ```bash
   npm start
   ```
   Or using any local static server:
   ```bash
   npx serve . -l 3000
   ```

