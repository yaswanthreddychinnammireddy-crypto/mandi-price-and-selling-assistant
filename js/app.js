/* ==========================================================================
   KISAN SETU - CLIENT APPLICATION CONTROLLER
   Author: Principal UI/UX Architect
   Features: Voice AI Call Engine with Canvas Visualizer, Live Market Ticker,
   Merchant Bid Negotiation, Leaflet Geo-Spatial Hub, Outdoor Anti-Glare Mode.
   ========================================================================== */

if (typeof window === "undefined") {
  console.log("🌾 Kisan Setu Client Application Controller");
  console.log("👉 To start the web server, run: node server.js (or npm start)");
  console.log("👉 Or open index.html directly in any browser.");
  if (typeof module !== "undefined") {
    module.exports = {};
  }
} else {
  // Browser execution
  document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    selectedCategory: "All",
    searchQuery: "",
    radiusKm: 25,
    isSunlightMode: false,
    fontSizeLevel: 0, // -1, 0, +1
    currentLang: "hi",
    isCallActive: false,
    isMuted: false,
    isSpeakerOn: true,
    recognition: null,
    isListening: false,
    isAiSpeaking: false,
    callDurationSeconds: 0,
    callTimerInterval: null,
    audioAnimationId: null,
    currentAiSpeechText: "",
    isPlayingAiVoice: false,
    userLocation: {
      lat: 22.7312,
      lng: 75.8648,
      name: "Indore Rural / Depalpur",
      zone: "Central Malwa Agro Zone (Black Cotton Soil)"
    },
    selectedMatrixCrop: "onion-red",
    callHistory: [],
    callHistoryFilter: "all",
    callHistorySearch: "",
    activeCallRecord: null,
    currentlyPlayingAudioId: null,
    isLoggedIn: typeof localStorage !== "undefined" && localStorage.getItem("kisan_logged_in") === "false" ? false : true,
    farmerProfile: {
      name: "Ramesh Patel",
      phone: "98260 12345",
      landSize: "12",
      landUnit: "Acres",
      primaryCrop: "onion-red",
      state: "Madhya Pradesh",
      district: "Indore",
      village: "Gram Hatod Farm Gate",
      pincode: "453111",
      kisanId: "KISAN-MP-8841",
      lat: 22.7312,
      lng: 75.8648
    },
    commodities: [...window.AgriData.commodities],
    merchants: [...window.AgriData.merchants],
    mandis: [...window.AgriData.mandis]
  };

  // Translations Dictionary for Key UI Touchpoints (Multi-Lingual)
  const i18n = {
    en: {
      heroTitle: "Empowering Farmers with Real-Time Markets & AI Advisory",
      heroSubtitle: "Direct merchant selling, live Mandi rates, and 24/7 Voice AI crop doctor.",
      callBotBtn: "Call AI Agri-Bot",
      callBotSub: "Speak in your local language",
      livePrices: "Live Mandi Commodity Prices",
      merchantsTitle: "Verified Local Buyers & Instant Offers",
      geoTitle: "Nearby Mandis & Merchant Hubs",
      sellHarvestBtn: "Sell Harvest Now",
      sunlightModeBtn: "Sunlight Mode",
      statusLive: "LIVE TRADING",
      callHistoryNav: "Call History",
      callHistoryTitle: "Kisan Call History & Voice Recordings",
      callHistorySubtitle: "Every voice consultation with Kisan AI Doctor, live Mandi rate inquiry, and merchant phone call is automatically recorded, transcribed, and indexed for instant audio replay."
    },
    hi: {
      heroTitle: "किसानों के लिए सीधा बाज़ार और AI कृषि सलाहकार",
      heroSubtitle: "सीधे व्यापारियों को बेचें, लाइव मंडी भाव देखें और 24 घंटे वॉइस AI से सलाह लें।",
      callBotBtn: "AI किसान बॉट को कॉल करें",
      callBotSub: "अपनी भाषा में बोलकर बात करें",
      livePrices: "लाइव मंडी भाव (आज के भाव)",
      merchantsTitle: "सत्यापित व्यापारी और तत्काल ख़रीद",
      geoTitle: "निकटतम मंडियां और व्यापारी केंद्र",
      sellHarvestBtn: "फसल बेचें",
      sunlightModeBtn: "धूप मोड (तेज रोशनी)",
      statusLive: "लाइव व्यापार",
      callHistoryNav: "कॉल इतिहास",
      callHistoryTitle: "किसान कॉल इतिहास एवं ऑडियो रिकॉर्डिंग",
      callHistorySubtitle: "किसान एआई डॉक्टर के साथ हर बातचीत, मंडी भाव पूछताछ और व्यापारी कॉल स्वचालित रूप से रिकॉर्ड और ट्रांसक्राइब होकर यहाँ सुरक्षित रहती है।"
    },
    pa: {
      heroTitle: "ਕਿਸਾਨਾਂ ਲਈ ਸਿੱਧਾ ਬਾਜ਼ਾਰ ਅਤੇ AI ਸਹਾਇਕ",
      heroSubtitle: "ਵਪਾਰੀਆਂ ਨੂੰ ਸਿੱਧਾ ਵੇਚੋ, ਲਾਈਵ ਮੰਡੀ ਭਾਅ ਦੇਖੋ ਅਤੇ ਬੋਲ ਕੇ ਸਲਾਹ ਲਵੋ।",
      callBotBtn: "AI ਕਿਸਾਨ ਬੋਟ ਨੂੰ ਕਾਲ ਕਰੋ",
      callBotSub: "ਆਪਣੀ ਬੋਲੀ ਵਿੱਚ ਗੱਲ ਕਰੋ",
      livePrices: "ਤਾਜ਼ਾ ਮੰਡੀ ਭਾਅ",
      merchantsTitle: "ਤਸਦੀਕਸ਼ੁਦਾ ਵਪਾਰੀ",
      geoTitle: "ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ",
      sellHarvestBtn: "ਫਸਲ ਵੇਚੋ",
      sunlightModeBtn: "ਧੁੱਪ ਮੋਡ",
      statusLive: "ਲਾਈਵ",
      callHistoryNav: "ਕਾਲ ਇਤਿਹਾਸ",
      callHistoryTitle: "ਕਿਸਾਨ ਕਾਲ ਇਤਿਹਾਸ ਅਤੇ ਵੌਇਸ ਰਿਕਾਰਡਿੰਗ",
      callHistorySubtitle: "ਕਿਸਾਨ ਏਆਈ ਡਾਕਟਰ ਨਾਲ ਹੋਈ ਹਰ ਗੱਲਬਾਤ ਅਤੇ ਮੰਡੀ ਭਾਅ ਪੁੱਛਗਿੱਛ ਆਪਣੇ-ਆਪ ਰਿਕਾਰਡ ਹੁੰਦੀ ਹੈ।"
    },
    mr: {
      heroTitle: "शेतकऱ्यांसाठी थेट बाजार आणि AI सल्लागार",
      heroSubtitle: "थेट व्यापाऱ्यांना विका, थेट बाजारभाव पहा आणि २४ तास व्हॉइस AI चा सल्ला मिळवा.",
      callBotBtn: "AI कृषी बॉटला कॉल करा",
      callBotSub: "आपल्या भाषेत बोला",
      livePrices: "थेट बाजारभाव (आजचे दर)",
      merchantsTitle: "अधिकृत स्थानिक खरेदीदार",
      geoTitle: "जवळचे बाजार व व्यापारी केंद्र",
      sellHarvestBtn: "माल विका",
      sunlightModeBtn: "उजेड मोड",
      statusLive: "थेट खरेदी",
      callHistoryNav: "कॉल इतिहास",
      callHistoryTitle: "शेतकरी कॉल इतिहास आणि ऑडिओ रेकॉर्डिंग",
      callHistorySubtitle: "किसान एआय डॉक्टरशी झालेली प्रत्येक चर्चा आणि बाजारभाव चौकशी येथे सुरक्षित रेकॉर्ड राहते."
    },
    gu: {
      heroTitle: "ખેડૂતો માટે સીધું માર્કેટ અને AI સલાહકાર",
      heroSubtitle: "વેપારીઓને સીધો પાક વેચો, લાઈવ મંડી ભાવ જુઓ અને વૉઇસ AI સાથે વાત કરો.",
      callBotBtn: "AI કિસાન બૉટને કૉલ કરો",
      callBotSub: "પોતાની ભાષામાં બોલો",
      livePrices: "લાઈવ મંડી ભાવ",
      merchantsTitle: "અધિકૃત વેપારીઓ",
      geoTitle: "નજીકની મંડીઓ",
      sellHarvestBtn: "પાક વેચો",
      sunlightModeBtn: "તડકો મોડ",
      statusLive: "લાઈવ સોદા"
    },
    te: {
      heroTitle: "రైతుల కోసం ప్రత్యక్ష మార్కెట్ & AI సలహాదారు",
      heroSubtitle: "వ్యాపారులకు నేరుగా అమ్మండి, లైవ్ మార్కెట్ ధరలు చూడండి మరియు వాయిస్ AI తో మాట్లాడండి.",
      callBotBtn: "AI కిసాన్ బాట్‌కు కాల్ చేయండి",
      callBotSub: "మీ భాషలో మాట్లాడండి",
      livePrices: "లైవ్ మార్కెట్ ధరలు",
      merchantsTitle: "ధృవీకరించబడిన వ్యాపారులు",
      geoTitle: "సమీప మార్కెట్లు",
      sellHarvestBtn: "పంట అమ్మండి",
      sunlightModeBtn: "ఎండ మోడ్",
      statusLive: "లైవ్ ట్రేడింగ్"
    }
  };

  // DOM Elements References
  const dom = {
    tickerTrack: document.getElementById("tickerTrack"),
    commoditiesGrid: document.getElementById("commoditiesGrid"),
    merchantsList: document.getElementById("merchantsList"),
    mandisList: document.getElementById("mandisList"),
    categoryPills: document.querySelectorAll(".category-pill"),
    cropSearchInput: document.getElementById("cropSearchInput"),
    sunlightToggle: document.getElementById("sunlightToggle"),
    fontSizeBtn: document.getElementById("fontSizeBtn"),
    langSelector: document.getElementById("langSelector"),
    
    // Call UI elements
    callModalOverlay: document.getElementById("callModalOverlay"),
    callLangSelector: document.getElementById("callLangSelector"),
    callPromptChipsContainer: document.getElementById("callPromptChipsContainer"),
    micPulseStatus: document.getElementById("micPulseStatus"),
    openCallBtns: document.querySelectorAll(".trigger-call-bot"),
    endCallBtn: document.getElementById("endCallBtn"),
    muteCallBtn: document.getElementById("muteCallBtn"),
    speakerToggleBtn: document.getElementById("speakerToggleBtn"),
    callTimerDisplay: document.getElementById("callTimerDisplay"),
    callStatusSub: document.getElementById("callStatusSub"),
    voiceCanvas: document.getElementById("voiceWaveCanvas"),
    transcriptContainer: document.getElementById("transcriptContainer"),
    quickPromptChips: document.querySelectorAll(".prompt-chip"),
    callInputText: document.getElementById("callInputText"),
    callSendBtn: document.getElementById("callSendBtn"),

    // Sell Modal Elements
    sellModalOverlay: document.getElementById("sellModalOverlay"),
    openSellBtns: document.querySelectorAll(".trigger-sell-modal"),
    closeSellModalBtn: document.getElementById("closeSellModalBtn"),
    sellForm: document.getElementById("sellHarvestForm"),
    sellCropSelect: document.getElementById("sellCropSelect"),
    sellQuantityInput: document.getElementById("sellQuantityInput"),
    estimatedRevenueBadge: document.getElementById("estimatedRevenueBadge"),

    // Location Intelligence, District Search & AI Advisory Elements
    detectLocationBtn: document.getElementById("detectLocationBtn"),
    locationPresetSelect: document.getElementById("locationPresetSelect"),
    districtSearchInput: document.getElementById("districtSearchInput"),
    districtSearchBtn: document.getElementById("districtSearchBtn"),
    userLocationName: document.getElementById("userLocationName"),
    userCoordinatesText: document.getElementById("userCoordinatesText"),
    userAgroZoneText: document.getElementById("userAgroZoneText"),
    surroundingMandisCount: document.getElementById("surroundingMandisCount"),
    arbitrageSummaryBadge: document.getElementById("arbitrageSummaryBadge"),
    matrixCropSelect: document.getElementById("matrixCropSelect"),
    arbitrageCalloutBox: document.getElementById("arbitrageCalloutBox"),
    surroundingMandisGrid: document.getElementById("surroundingMandisGrid"),
    gpsBtnIcon: document.getElementById("gpsBtnIcon"),
    gpsBtnText: document.getElementById("gpsBtnText"),
    aiVoiceAdvisoryCard: document.getElementById("aiVoiceAdvisoryCard"),
    aiAdvisoryVerdictBadge: document.getElementById("aiAdvisoryVerdictBadge"),
    aiAdvisoryExplanationText: document.getElementById("aiAdvisoryExplanationText"),
    
    // Call History DOM references
    callHistoryContainer: document.getElementById("callHistoryContainer"),
    historyTotalCalls: document.getElementById("historyTotalCalls"),
    historyTotalDuration: document.getElementById("historyTotalDuration"),
    filterCountAll: document.getElementById("filterCountAll"),
    filterCountAi: document.getElementById("filterCountAi"),
    filterCountMerchant: document.getElementById("filterCountMerchant"),
    callFilterBtns: document.querySelectorAll(".call-filter-btn"),
    callHistorySearchInput: document.getElementById("callHistorySearchInput"),
    clearCallHistoryBtn: document.getElementById("clearCallHistoryBtn"),
    exportCallsBtn: document.getElementById("exportCallsBtn"),
    navCallHistoryBadge: document.getElementById("navCallHistoryBadge"),
    navCallHistoryBadgeMobile: document.getElementById("navCallHistoryBadgeMobile"),
    heroCallCountBadge: document.getElementById("heroCallCountBadge"),
    playAiVoiceSummaryBtn: document.getElementById("playAiVoiceSummaryBtn"),
    playVoiceIcon: document.getElementById("playVoiceIcon"),
    playVoiceText: document.getElementById("playVoiceText"),

    // Farmer Auth, Login & Passbook Elements
    farmerAuthSection: document.getElementById("farmer-auth-section"),
    farmerLoggedOutView: document.getElementById("farmerLoggedOutView"),
    farmerLoggedInView: document.getElementById("farmerLoggedInView"),
    tabBtnOtp: document.getElementById("tabBtnOtp"),
    tabBtnRegister: document.getElementById("tabBtnRegister"),
    paneOtpLogin: document.getElementById("paneOtpLogin"),
    paneRegister: document.getElementById("paneRegister"),
    farmerLoginForm: document.getElementById("farmerLoginForm"),
    loginMobileInput: document.getElementById("loginMobileInput"),
    sendOtpBtn: document.getElementById("sendOtpBtn"),
    loginOtpInput: document.getElementById("loginOtpInput"),
    resendOtpBtn: document.getElementById("resendOtpBtn"),
    otpStatusNotice: document.getElementById("otpStatusNotice"),
    quickDemoFillBtn: document.getElementById("quickDemoFillBtn"),
    loginSubmitBtn: document.getElementById("loginSubmitBtn"),
    switchToRegisterLink: document.getElementById("switchToRegisterLink"),
    switchToLoginLink: document.getElementById("switchToLoginLink"),
    farmerRegisterForm: document.getElementById("farmerRegisterForm"),
    regFarmerName: document.getElementById("regFarmerName"),
    regFarmerPhone: document.getElementById("regFarmerPhone"),
    regPrimaryCrop: document.getElementById("regPrimaryCrop"),
    regState: document.getElementById("regState"),
    regDistrict: document.getElementById("regDistrict"),
    regLandSize: document.getElementById("regLandSize"),
    regLandUnit: document.getElementById("regLandUnit"),
    regVillage: document.getElementById("regVillage"),
    regPincode: document.getElementById("regPincode"),
    navAuthBtn: document.getElementById("navAuthBtn"),
    navAuthUserText: document.getElementById("navAuthUserText"),
    farmerLogoutBtn: document.getElementById("farmerLogoutBtn"),
    passbookFarmerName: document.getElementById("passbookFarmerName"),
    passbookFarmerPhone: document.getElementById("passbookFarmerPhone"),
    passbookFarmerLocation: document.getElementById("passbookFarmerLocation"),
    passbookFarmerCoords: document.getElementById("passbookFarmerCoords"),
    passbookFarmerCrop: document.getElementById("passbookFarmerCrop"),
    passbookKisanId: document.getElementById("passbookKisanId"),
    openEditProfileBtn: document.getElementById("openEditProfileBtn"),
    editProfileModalOverlay: document.getElementById("editProfileModalOverlay"),
    closeEditProfileBtn: document.getElementById("closeEditProfileBtn"),
    cancelEditProfileBtn: document.getElementById("cancelEditProfileBtn"),
    editProfileForm: document.getElementById("editProfileForm"),
    editFarmerName: document.getElementById("editFarmerName"),
    editFarmerPhone: document.getElementById("editFarmerPhone"),
    editPrimaryCrop: document.getElementById("editPrimaryCrop"),
    editFarmerDistrict: document.getElementById("editFarmerDistrict"),
    editFarmerState: document.getElementById("editFarmerState"),
    editFarmerVillage: document.getElementById("editFarmerVillage"),
    editLandSize: document.getElementById("editLandSize"),
    editLandUnit: document.getElementById("editLandUnit"),
    editGpsCoordsBadge: document.getElementById("editGpsCoordsBadge"),
    editFarmGpsBtn: document.getElementById("editFarmGpsBtn"),

    // Legacy fallbacks for compatibility
    farmerProfileForm: document.getElementById("farmerProfileForm"),
    farmerNameInput: document.getElementById("farmerNameInput"),
    farmerPhoneInput: document.getElementById("farmerPhoneInput"),
    farmerLandSizeInput: document.getElementById("farmerLandSizeInput"),
    farmerLandUnitSelect: document.getElementById("farmerLandUnitSelect"),
    farmerPrimaryCropSelect: document.getElementById("farmerPrimaryCropSelect"),
    farmerWhatsappAlertsCheckbox: document.getElementById("farmerWhatsappAlertsCheckbox"),
    farmerStateSelect: document.getElementById("farmerStateSelect"),
    farmerDistrictInput: document.getElementById("farmerDistrictInput"),
    farmerVillageInput: document.getElementById("farmerVillageInput"),
    farmerPincodeInput: document.getElementById("farmerPincodeInput"),
    farmGateGpsBtn: document.getElementById("farmGateGpsBtn"),
    farmGateCoordBadge: document.getElementById("farmGateCoordBadge"),
    savedProfileSummaryText: document.getElementById("savedProfileSummaryText"),
    profileSavedStatus: document.getElementById("profileSavedStatus"),

    // Geo radius controls
    radiusSelect: document.getElementById("radiusSelect"),
    mapElement: document.getElementById("mapElement")
  };

  /* --------------------------------------------------------------------------
     1. INITIALIZATION & SETUP
     -------------------------------------------------------------------------- */
  function init() {
    loadFarmerProfile();
    initCallHistory();
    renderTicker();
    recalculateDistances();
    initLeafletMap();
    setupEventListeners();
    startRealtimePriceSimulation();
    initCanvasVisualizer();
  }

  /* --------------------------------------------------------------------------
     GEOSPATIAL DISTANCE & AGRI-AI BACKEND MIDDLEWARE CONNECTOR
     -------------------------------------------------------------------------- */
  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  async function recalculateDistances(params = {}) {
    // Attempt Backend Spatial & AI Engine Query
    try {
      const payload = {
        lat: params.lat || state.userLocation.lat,
        lng: params.lng || state.userLocation.lng,
        district: params.district || null,
        crop: state.selectedMatrixCrop || "wheat-sharbati",
        lang: state.currentLang || "en"
      };

      const res = await fetch("/api/analyze-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          applyBackendAnalysis(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend API offline or unreachable, using local spatial engine:", e);
    }

    // Local spatial fallback
    recalculateDistancesLocally();
  }

  function applyBackendAnalysis(data) {
    if (data.locationAnalysis) {
      state.userLocation.lat = data.locationAnalysis.lat;
      state.userLocation.lng = data.locationAnalysis.lng;
      state.userLocation.name = data.locationAnalysis.name;
      state.userLocation.zone = data.locationAnalysis.zone;
    }

    if (data.surroundingMandis && data.surroundingMandis.length > 0) {
      data.surroundingMandis.forEach(m => {
        const localMandi = state.mandis.find(lm => lm.id === m.id);
        if (localMandi) {
          localMandi.distanceKm = m.distanceKm;
          if (m.liveCropPrice && localMandi.cropPrices) {
            localMandi.cropPrices[state.selectedMatrixCrop] = m.liveCropPrice;
          }
        }
      });
      state.mandis.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    // AI Engine Output Injection
    if (data.aiAdvisory) {
      if (dom.aiAdvisoryVerdictBadge) {
        dom.aiAdvisoryVerdictBadge.textContent = data.aiAdvisory.badge;
      }
      if (dom.aiAdvisoryExplanationText) {
        dom.aiAdvisoryExplanationText.innerHTML = `<b>${data.aiAdvisory.title}</b><br><span class="opacity-90 mt-1 block">${data.aiAdvisory.explanation}</span>`;
      }
      state.currentAiSpeechText = state.currentLang === "hi" && data.aiAdvisory.hindiAudioSummary 
        ? data.aiAdvisory.hindiAudioSummary 
        : data.aiAdvisory.audioSummary;
    }

    // Update Telemetry Banner
    if (dom.userLocationName) dom.userLocationName.innerHTML = `<span>🏡</span> <span class="truncate">${state.userLocation.name}</span>`;
    if (dom.userCoordinatesText) dom.userCoordinatesText.textContent = `${state.userLocation.lat.toFixed(4)}° N, ${state.userLocation.lng.toFixed(4)}° E`;
    if (dom.userAgroZoneText) dom.userAgroZoneText.textContent = state.userLocation.zone;
    if (dom.surroundingMandisCount) dom.surroundingMandisCount.textContent = `${state.mandis.length} Mandis Found`;

    renderCommodities();
    renderMerchants();
    renderMandisList();
    renderSurroundingMandiAnalysis(state.selectedMatrixCrop);
    updateMapForUserLocation();
  }

  function recalculateDistancesLocally() {
    state.mandis.forEach(m => {
      m.distanceKm = calculateDistanceKm(state.userLocation.lat, state.userLocation.lng, m.lat, m.lng);
    });
    state.mandis.sort((a, b) => a.distanceKm - b.distanceKm);

    state.merchants.forEach(m => {
      m.distanceKm = calculateDistanceKm(state.userLocation.lat, state.userLocation.lng, m.lat, m.lng);
    });
    state.merchants.sort((a, b) => a.distanceKm - b.distanceKm);

    const closestMandi = state.mandis[0];
    if (closestMandi) {
      state.commodities.forEach(c => {
        c.distanceKm = closestMandi.distanceKm;
        c.mandi = closestMandi.name;
        if (closestMandi.cropPrices && closestMandi.cropPrices[c.id]) {
          c.currentPrice = closestMandi.cropPrices[c.id];
        }
      });
    }

    if (dom.userLocationName) dom.userLocationName.innerHTML = `<span>🏡</span> <span class="truncate">${state.userLocation.name}</span>`;
    if (dom.userCoordinatesText) dom.userCoordinatesText.textContent = `${state.userLocation.lat.toFixed(4)}° N, ${state.userLocation.lng.toFixed(4)}° E`;
    if (dom.userAgroZoneText) dom.userAgroZoneText.textContent = state.userLocation.zone;
    if (dom.surroundingMandisCount) dom.surroundingMandisCount.textContent = `${state.mandis.length} Mandis Found`;

    renderCommodities();
    renderMerchants();
    renderMandisList();
    renderSurroundingMandiAnalysis(state.selectedMatrixCrop);
    updateMapForUserLocation();
  }

  function searchDistrictLocation() {
    if (!dom.districtSearchInput) return;
    const query = dom.districtSearchInput.value.trim();
    if (!query) {
      window.showToast("Please type a district name, e.g. 'Indore', 'Nashik', or 'Karnal'", "info");
      return;
    }
    window.showToast(`🔍 Querying Agmarknet database for ${query}...`, "info");
    recalculateDistances({ district: query });
  }

  function toggleAiVoicePlayback() {
    if (!("speechSynthesis" in window)) {
      window.showToast("Speech audio not supported in this browser.", "info");
      return;
    }

    if (state.isPlayingAiVoice) {
      window.speechSynthesis.cancel();
      state.isPlayingAiVoice = false;
      if (dom.playVoiceIcon) dom.playVoiceIcon.textContent = "🔊";
      if (dom.playVoiceText) dom.playVoiceText.textContent = "Play AI Voice Advice";
      return;
    }

    if (!state.currentAiSpeechText) {
      state.currentAiSpeechText = "Namaste Kisan Bhai. Analyzing live Mandi rates and transport diesel costs for your district.";
    }

    window.speechSynthesis.cancel();
    const lang = state.currentLang || "hi";
    const utterance = new SpeechSynthesisUtterance(state.currentAiSpeechText);
    utterance.lang = LANG_TAGS[lang] || "hi-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = (LANG_TAGS[lang] || "hi").substring(0, 2).toLowerCase();
      const nativeVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
        || voices.find(v => v.lang.toLowerCase().includes("in"));
      if (nativeVoice) {
        utterance.voice = nativeVoice;
      }
    }

    utterance.onstart = () => {
      state.isPlayingAiVoice = true;
      if (dom.playVoiceIcon) dom.playVoiceIcon.innerHTML = `<span class="animate-pulse">⏸️</span>`;
      if (dom.playVoiceText) dom.playVoiceText.textContent = "Pause Voice Advice";
    };

    utterance.onend = utterance.onerror = () => {
      state.isPlayingAiVoice = false;
      if (dom.playVoiceIcon) dom.playVoiceIcon.textContent = "🔊";
      if (dom.playVoiceText) dom.playVoiceText.textContent = "Play AI Voice Advice";
    };

    window.speechSynthesis.speak(utterance);
  }

  function detectUserLocation() {
    if (!navigator.geolocation) {
      window.showToast("Geolocation is not supported by your browser.", "info");
      return;
    }

    if (dom.gpsBtnIcon) dom.gpsBtnIcon.innerHTML = `<span class="animate-spin inline-block">⏳</span>`;
    if (dom.gpsBtnText) dom.gpsBtnText.textContent = "Locating your farm...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        state.userLocation = {
          lat: lat,
          lng: lng,
          name: "My Live Farm (GPS Verified)",
          zone: "Local Agro-Climatic Micro-Zone"
        };

        if (dom.gpsBtnIcon) dom.gpsBtnIcon.textContent = "✅";
        if (dom.gpsBtnText) dom.gpsBtnText.textContent = "GPS Farm Locked";

        recalculateDistances();
        window.showToast(`📍 GPS Farm Locked! Analyzed ${state.mandis.length} surrounding Mandis.`, "success");
      },
      (error) => {
        if (dom.gpsBtnIcon) dom.gpsBtnIcon.textContent = "📍";
        if (dom.gpsBtnText) dom.gpsBtnText.textContent = "Detect My Farm GPS";
        window.showToast("GPS access was not allowed. Using high-precision regional presets.", "info");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  /* --------------------------------------------------------------------------
     FARMER AUTHENTICATION, LOGIN, REGISTRATION & PASSBOOK PROFILE
     -------------------------------------------------------------------------- */
  function loadFarmerProfile() {
    try {
      const saved = localStorage.getItem("kisan_profile");
      if (saved) {
        state.farmerProfile = Object.assign(state.farmerProfile, JSON.parse(saved));
      }
      const savedAuth = localStorage.getItem("kisan_logged_in");
      if (savedAuth !== null) {
        state.isLoggedIn = savedAuth === "true";
      }
    } catch (e) {
      console.warn("Could not load stored profile", e);
    }
    renderAuthState();
  }

  function renderAuthState() {
    if (state.isLoggedIn) {
      if (dom.farmerLoggedOutView) dom.farmerLoggedOutView.classList.add("hidden");
      if (dom.farmerLoggedInView) dom.farmerLoggedInView.classList.remove("hidden");
      
      const p = state.farmerProfile;
      if (dom.passbookFarmerName) dom.passbookFarmerName.textContent = p.name || "Ramesh Patel";
      if (dom.passbookFarmerPhone) {
        dom.passbookFarmerPhone.innerHTML = `<span>📱 +91 ${p.phone || "98260 12345"}</span> <span class="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-900 font-bold">WhatsApp Active</span>`;
      }
      if (dom.passbookFarmerLocation) {
        dom.passbookFarmerLocation.innerHTML = `<span>📍</span> <span>${p.district || "Indore"} (${p.village || "Gram Hatod"}), ${p.state || "Madhya Pradesh"}</span>`;
      }
      if (dom.passbookFarmerCoords) {
        dom.passbookFarmerCoords.textContent = `Coordinates: ${state.userLocation.lat.toFixed(4)}° N, ${state.userLocation.lng.toFixed(4)}° E`;
      }
      if (dom.passbookKisanId) {
        dom.passbookKisanId.textContent = `ID: ${p.kisanId || "KISAN-MP-8841"}`;
      }
      if (dom.passbookFarmerCrop) {
        const cropObj = state.commodities.find(c => c.id === p.primaryCrop) || state.commodities[1];
        dom.passbookFarmerCrop.innerHTML = `<span>${cropObj ? cropObj.icon : "🧅"}</span> <span>${cropObj ? cropObj.name.split(" ")[0] : "Red Onion"} • ${p.landSize || "12"} ${p.landUnit || "Acres"}</span>`;
      }
      if (dom.navAuthUserText) {
        dom.navAuthUserText.textContent = `👨‍🌾 ${p.name || "Ramesh Patel"}`;
      }
      if (dom.savedProfileSummaryText) {
        dom.savedProfileSummaryText.textContent = `Profile: ${p.name} (+91 ${p.phone})`;
      }
    } else {
      if (dom.farmerLoggedOutView) dom.farmerLoggedOutView.classList.remove("hidden");
      if (dom.farmerLoggedInView) dom.farmerLoggedInView.classList.add("hidden");
      if (dom.navAuthUserText) {
        dom.navAuthUserText.textContent = `🔑 Kisan Login`;
      }
    }
  }

  async function handleOtpLogin(e) {
    if (e) e.preventDefault();
    const phone = dom.loginMobileInput ? dom.loginMobileInput.value.trim() : "9826012345";
    const otp = dom.loginOtpInput ? dom.loginOtpInput.value.trim() : "1234";

    if (phone.length < 10) {
      window.showToast("Please enter a valid 10-digit mobile number.", "info");
      return;
    }

    if (!otp || otp.length < 4) {
      window.showToast("Please enter the 4-digit OTP code (Demo: 1234).", "info");
      return;
    }

    state.isLoggedIn = true;
    state.farmerProfile.phone = phone;

    // Connect to Express Backend Authentication API
    try {
      const email = `${phone}@kisansetu.in`;
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: "KisanPassword123!" })
      });
      const authData = await res.json();
      if (authData?.data?.token) {
        localStorage.setItem("kisan_jwt_token", authData.data.token);
      }
    } catch (err) {
      console.warn("Backend auth sync:", err.message);
    }

    try {
      localStorage.setItem("kisan_logged_in", "true");
      localStorage.setItem("kisan_profile", JSON.stringify(state.farmerProfile));
    } catch (err) {}

    renderAuthState();
    recalculateDistances({ district: state.farmerProfile.district, crop: state.farmerProfile.primaryCrop });
    window.showToast(`🎉 Login Successful! Welcome back ${state.farmerProfile.name} ji. Mandi rates synced for ${state.farmerProfile.district}.`, "success");
  }

  async function handleFarmerRegister(e) {
    if (e) e.preventDefault();
    const name = dom.regFarmerName ? dom.regFarmerName.value.trim() : "Farmer";
    const phone = dom.regFarmerPhone ? dom.regFarmerPhone.value.trim() : "9826012345";
    const crop = dom.regPrimaryCrop ? dom.regPrimaryCrop.value : "onion-red";
    const stateVal = dom.regState ? dom.regState.value : "Madhya Pradesh";
    const district = dom.regDistrict ? dom.regDistrict.value.trim() : "Indore";
    const landSize = dom.regLandSize ? dom.regLandSize.value.trim() : "12";
    const landUnit = dom.regLandUnit ? dom.regLandUnit.value : "Acres";
    const village = dom.regVillage ? dom.regVillage.value.trim() : "Farm Gate";
    const pincode = dom.regPincode ? dom.regPincode.value.trim() : "453111";

    if (!name || phone.length < 10) {
      window.showToast("Please fill in your name and valid 10-digit mobile number.", "info");
      return;
    }

    const randomId = `KISAN-${stateVal.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    state.farmerProfile = {
      name: name,
      phone: phone,
      primaryCrop: crop,
      state: stateVal,
      district: district,
      landSize: landSize,
      landUnit: landUnit,
      village: village,
      pincode: pincode,
      kisanId: randomId,
      lat: state.userLocation.lat,
      lng: state.userLocation.lng
    };

    // Connect to Express Backend Authentication API
    try {
      const email = `${phone}@kisansetu.in`;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          password: "KisanPassword123!",
          phone: phone,
          state: stateVal,
          district: district,
          preferredLanguage: "Hindi"
        })
      });
      const authData = await res.json();
      if (authData?.data?.token) {
        localStorage.setItem("kisan_jwt_token", authData.data.token);
      }
    } catch (err) {
      console.warn("Backend registration sync:", err.message);
    }

    state.isLoggedIn = true;
    try {
      localStorage.setItem("kisan_logged_in", "true");
      localStorage.setItem("kisan_profile", JSON.stringify(state.farmerProfile));
    } catch (err) {}

    renderAuthState();
    recalculateDistances({ district: district, crop: crop });
    window.showToast(`🌾 Registration Complete! Welcome ${name} ji to Kisan Setu. Your Kisan ID is ${randomId}.`, "success");
  }

  function handleFarmerLogout() {
    state.isLoggedIn = false;
    try {
      localStorage.setItem("kisan_logged_in", "false");
    } catch (err) {}
    renderAuthState();
    if (dom.farmerAuthSection) {
      dom.farmerAuthSection.scrollIntoView({ behavior: "smooth" });
    }
    window.showToast("👋 Logged out successfully. You can sign in anytime with your mobile number.", "info");
  }

  function handleQuickDemoFill() {
    if (dom.loginMobileInput) dom.loginMobileInput.value = "98260 12345";
    if (dom.loginOtpInput) dom.loginOtpInput.value = "1234";
    if (dom.otpStatusNotice) dom.otpStatusNotice.classList.remove("hidden");
    window.showToast("⚡ Demo farmer credentials loaded (+91 98260 12345, OTP: 1234)", "info");
  }

  function openEditProfileModal() {
    if (!dom.editProfileModalOverlay) return;
    const p = state.farmerProfile;
    if (dom.editFarmerName) dom.editFarmerName.value = p.name || "Ramesh Patel";
    if (dom.editFarmerPhone) dom.editFarmerPhone.value = p.phone || "98260 12345";
    if (dom.editPrimaryCrop) dom.editPrimaryCrop.value = p.primaryCrop || "onion-red";
    if (dom.editFarmerDistrict) dom.editFarmerDistrict.value = p.district || "Indore";
    if (dom.editFarmerState) dom.editFarmerState.value = p.state || "Madhya Pradesh";
    if (dom.editFarmerVillage) dom.editFarmerVillage.value = p.village || "Gram Hatod Farm Gate";
    if (dom.editLandSize) dom.editLandSize.value = p.landSize || "12";
    if (dom.editLandUnit) dom.editLandUnit.value = p.landUnit || "Acres";
    if (dom.editGpsCoordsBadge) {
      dom.editGpsCoordsBadge.textContent = `${state.userLocation.lat.toFixed(4)}° N, ${state.userLocation.lng.toFixed(4)}° E`;
    }
    dom.editProfileModalOverlay.classList.add("active");
  }

  function closeEditProfileModal() {
    if (dom.editProfileModalOverlay) {
      dom.editProfileModalOverlay.classList.remove("active");
    }
  }

  function handleSaveEditProfile(e) {
    if (e) e.preventDefault();
    const name = dom.editFarmerName ? dom.editFarmerName.value.trim() : state.farmerProfile.name;
    const phone = dom.editFarmerPhone ? dom.editFarmerPhone.value.trim() : state.farmerProfile.phone;
    const crop = dom.editPrimaryCrop ? dom.editPrimaryCrop.value : state.farmerProfile.primaryCrop;
    const district = dom.editFarmerDistrict ? dom.editFarmerDistrict.value.trim() : state.farmerProfile.district;
    const stateVal = dom.editFarmerState ? dom.editFarmerState.value.trim() : state.farmerProfile.state;
    const village = dom.editFarmerVillage ? dom.editFarmerVillage.value.trim() : state.farmerProfile.village;
    const landSize = dom.editLandSize ? dom.editLandSize.value.trim() : state.farmerProfile.landSize;
    const landUnit = dom.editLandUnit ? dom.editLandUnit.value : state.farmerProfile.landUnit;

    state.farmerProfile = Object.assign(state.farmerProfile, {
      name,
      phone,
      primaryCrop: crop,
      district,
      state: stateVal,
      village,
      landSize,
      landUnit
    });

    try {
      localStorage.setItem("kisan_profile", JSON.stringify(state.farmerProfile));
    } catch (err) {}

    closeEditProfileModal();
    renderAuthState();
    recalculateDistances({ district, crop });
    window.showToast(`✅ Farm details updated! Mandi rates and distances refreshed for ${district}.`, "success");
  }

  function saveFarmerProfile(e) {
    if (e) e.preventDefault();
    handleSaveEditProfile(e);
  }

  function setLocationPreset(presetId) {
    const preset = window.AgriData.locationPresets.find(p => p.id === presetId);
    if (!preset) return;

    state.userLocation = {
      lat: preset.lat,
      lng: preset.lng,
      name: preset.name,
      zone: preset.zone
    };

    if (dom.gpsBtnIcon) dom.gpsBtnIcon.textContent = "📍";
    if (dom.gpsBtnText) dom.gpsBtnText.textContent = "Detect My Farm GPS";

    recalculateDistances();
    window.showToast(`Location switched to ${preset.name}`, "info");
  }

  function renderSurroundingMandiAnalysis(cropId) {
    if (!dom.surroundingMandisGrid || !dom.arbitrageCalloutBox) return;

    state.selectedMatrixCrop = cropId;
    const cropData = state.commodities.find(c => c.id === cropId) || state.commodities[0];

    // Compute prices and travel time for each Mandi
    const mandisForCrop = state.mandis.map(m => {
      const price = (m.cropPrices && m.cropPrices[cropId]) || 2800;
      const tractorMins = Math.round(m.distanceKm * 2.2); // ~25 km/h tractor transit
      return {
        ...m,
        priceForCrop: price,
        tractorMins: tractorMins
      };
    });

    const closestMandi = mandisForCrop[0];
    const highestMandi = mandisForCrop.reduce((max, m) => m.priceForCrop > max.priceForCrop ? m : max, mandisForCrop[0]);

    const priceDiff = highestMandi.priceForCrop - closestMandi.priceForCrop;
    const distDiff = Math.max(0, Math.round(highestMandi.distanceKm - closestMandi.distanceKm));
    const dieselCost = Math.round(distDiff * 2 * 18); // approx ₹18/km round-trip fuel
    const grossProfit40Qtl = priceDiff * 40;
    const netProfit40Qtl = grossProfit40Qtl - dieselCost;

    // Update Summary Badge in Telemetry Banner
    if (dom.arbitrageSummaryBadge) {
      if (priceDiff > 0) {
        dom.arbitrageSummaryBadge.textContent = `${highestMandi.name.split(" ")[0]} pays +₹${priceDiff}/Qtl more!`;
      } else {
        dom.arbitrageSummaryBadge.textContent = `Closest Mandi pays top rate!`;
      }
    }

    // Render Highlight Callout Box
    if (priceDiff > 0) {
      dom.arbitrageCalloutBox.innerHTML = `
        <div class="flex items-start gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center text-2xl shrink-0 shadow-md border border-white/40">
            💰
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-extrabold text-gray-950 text-sm sm:text-base">Top Paying Yard: ${highestMandi.name}</span>
              <span class="badge-glass badge-green text-xs font-bold">+₹${priceDiff}/Qtl Premium</span>
            </div>
            <p class="text-xs text-gray-700 mt-1 max-w-2xl">
              <b>${closestMandi.name}</b> is your closest yard (${closestMandi.distanceKm} km away at ₹${closestMandi.priceForCrop}/Qtl). However, driving ${highestMandi.distanceKm} km to <b>${highestMandi.name}</b> earns you <b>₹${highestMandi.priceForCrop}/Qtl</b>.
            </p>
            <div class="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-gray-700 bg-white/70 p-2 rounded-xl border border-white/80">
              <span>🚜 Extra Distance: <b>+${distDiff} km</b></span>
              <span class="text-gray-300">|</span>
              <span>⛽ Est. Diesel: <b>₹${dieselCost}</b></span>
              <span class="text-gray-300">|</span>
              <span class="text-emerald-800 font-extrabold">🎉 Net Gain on 40 Qtl Trolley: +₹${netProfit40Qtl.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
        <div class="shrink-0 flex items-center gap-2 mt-2 md:mt-0">
          <a 
            href="https://maps.google.com/?q=${highestMandi.lat},${highestMandi.lng}" 
            target="_blank" 
            class="btn-agri btn-gold py-2.5 px-4 text-xs font-bold shadow-sm whitespace-nowrap"
          >
            Navigate Best Mandi →
          </a>
        </div>
      `;
    } else {
      dom.arbitrageCalloutBox.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
            ✅
          </div>
          <div>
            <h4 class="font-extrabold text-emerald-950 text-sm sm:text-base">Your Nearest Mandi (${closestMandi.name}) Has The Best Price!</h4>
            <p class="text-xs text-gray-700 mt-0.5">
              Trading at <b>₹${closestMandi.priceForCrop}/Qtl</b> just <b>${closestMandi.distanceKm} km</b> from your farm. No need for distant travel today.
            </p>
          </div>
        </div>
      `;
    }

    // Render Surrounding Mandis Grid
    dom.surroundingMandisGrid.innerHTML = mandisForCrop.map((m, idx) => {
      const isClosest = idx === 0;
      const isHighest = m.priceForCrop === highestMandi.priceForCrop;
      const diffFromClosest = m.priceForCrop - closestMandi.priceForCrop;

      return `
        <div class="glass-panel p-4 flex flex-col justify-between relative group hover:border-emerald-500 transition-all ${isHighest ? 'border-2 border-amber-400 bg-amber-50/20' : ''}">
          <div>
            <!-- Top Row: Yard Photo & Identification -->
            <div class="flex items-start gap-3">
              <img src="${m.image}" alt="${m.name}" class="w-16 h-16 rounded-xl object-cover border border-white/80 shadow-xs shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4 class="font-bold text-gray-950 text-sm truncate leading-tight">${m.name}</h4>
                  ${isClosest ? '<span class="badge-glass badge-green text-[10px]">Closest Mandi</span>' : ''}
                  ${isHighest ? '<span class="badge-glass badge-gold text-[10px]">Highest Rate</span>' : ''}
                </div>
                <p class="text-xs text-emerald-800 font-semibold mt-0.5">${m.type}</p>
                <p class="text-[11px] text-gray-500 font-medium">🚜 ~${m.tractorMins} mins tractor drive</p>
              </div>
            </div>

            <!-- Price Breakdown for Selected Crop -->
            <div class="mt-3.5 pt-3 border-t border-emerald-950/10 flex items-baseline justify-between">
              <div>
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">${cropData.name.split(" ")[0]} Rate</span>
                <div class="text-2xl font-extrabold text-gray-950 font-mono price-value mt-0.5">
                  ₹${m.priceForCrop.toLocaleString("en-IN")}<span class="text-xs font-normal text-gray-500">/Qtl</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-extrabold text-emerald-900 font-mono">${m.distanceKm} KM</span>
                <div class="text-[11px] font-bold ${diffFromClosest > 0 ? 'text-emerald-700' : diffFromClosest < 0 ? 'text-rose-600' : 'text-gray-500'}">
                  ${diffFromClosest > 0 ? `+₹${diffFromClosest} vs closest` : diffFromClosest < 0 ? `-₹${Math.abs(diffFromClosest)} vs closest` : 'Baseline Rate'}
                </div>
              </div>
            </div>

            <!-- Facilities Pill Strip -->
            <div class="mt-3 flex flex-wrap gap-1">
              ${m.facilities.slice(0, 2).map(f => `<span class="px-2 py-0.5 rounded text-[10px] bg-white/70 text-gray-700 border border-gray-200">✓ ${f}</span>`).join("")}
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 pt-2 flex gap-2">
            <a 
              href="https://maps.google.com/?q=${m.lat},${m.lng}" 
              target="_blank" 
              class="btn-agri btn-glass flex-1 py-1.5 text-xs text-center font-bold"
            >
              📍 GPS Route
            </a>
            <a 
              href="tel:${m.contact}" 
              class="btn-agri btn-primary py-1.5 px-3 text-xs text-center font-bold"
              title="Call Mandi Weighbridge"
            >
              📞 Call
            </a>
          </div>
        </div>
      `;
    }).join("");
  }

  /* --------------------------------------------------------------------------
     2. TICKER BAR (Live Commodities Stream with Crop Photos)
     -------------------------------------------------------------------------- */
  function renderTicker() {
    if (!dom.tickerTrack) return;
    const tickerItems = [...state.commodities, ...state.commodities]; // Duplicate for seamless infinite loop
    dom.tickerTrack.innerHTML = tickerItems
      .map(
        (c) => `
        <button 
          type="button"
          onclick="window.scrollToCrop('${c.id}')"
          class="ticker-crop-item inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/75 hover:bg-white backdrop-blur-md border border-white/70 hover:border-emerald-500/80 shadow-xs hover:shadow-md text-xs font-semibold cursor-pointer transition-all active:scale-95 group shrink-0"
          title="Click to view live market trading and mandi prices for ${c.name}"
        >
          <img src="${c.image}" alt="${c.name}" class="w-5 h-5 rounded-full object-cover border border-emerald-600/50 shadow-2xs group-hover:scale-110 transition-transform" />
          <span class="text-emerald-950 font-extrabold group-hover:text-emerald-700 transition-colors">${c.name.split(" ")[0]}</span>
          <span class="price-value font-mono font-bold text-gray-900">₹${c.currentPrice.toLocaleString("en-IN")}</span>
          <span class="inline-flex items-center text-[11px] font-bold ${
            c.isPositive ? "text-emerald-700" : "text-rose-600"
          }">
            ${c.isPositive ? "▲" : "▼"} ${Math.abs(c.changePercent)}%
          </span>
          <span class="text-gray-400">|</span>
          <span class="text-gray-600 text-[11px] group-hover:text-gray-900">${c.mandi.split(" ")[0]}</span>
          <span class="text-[11px] text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>
        </button>
      `
      )
      .join("");
  }

  // Interactive direct navigation to a commodity card from live trading ticker
  window.scrollToCrop = function(cropId) {
    if (!cropId) return;

    const crop = state.commodities.find((c) => c.id === cropId);
    if (!crop) return;

    // 1. Reset category filter if this crop is hidden under a different category
    if (state.selectedCategory !== "All" && crop.category !== state.selectedCategory) {
      state.selectedCategory = "All";
      if (dom.categoryPills) {
        dom.categoryPills.forEach((p) => {
          const isAll = p.dataset.category === "All";
          p.classList.toggle("active", isAll);
          p.classList.toggle("bg-emerald-700", isAll);
          p.classList.toggle("text-white", isAll);
          p.classList.toggle("bg-white/60", !isAll);
          p.classList.toggle("text-gray-800", !isAll);
        });
      }
      renderCommodities();
    }

    // 2. Clear search input if crop was filtered out by active search
    if (state.searchQuery && state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase();
      const isVisibleInSearch =
        crop.name.toLowerCase().includes(q) ||
        crop.hindiName.includes(q) ||
        crop.mandi.toLowerCase().includes(q);

      if (!isVisibleInSearch) {
        state.searchQuery = "";
        if (dom.cropSearchInput) dom.cropSearchInput.value = "";
        renderCommodities();
      }
    }

    // 3. Sync the Arbitrage Matrix Select to this crop
    if (dom.matrixCropSelect) {
      dom.matrixCropSelect.value = cropId;
      state.selectedMatrixCrop = cropId;
      recalculateDistances({ crop: cropId });
    }

    // 4. Smoothly scroll into view and trigger highlight animation
    setTimeout(() => {
      const targetCard = document.getElementById(`crop-${cropId}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });

        // Trigger highlight pulse
        targetCard.classList.remove("crop-card-highlighted");
        void targetCard.offsetWidth; // Force reflow
        targetCard.classList.add("crop-card-highlighted");

        setTimeout(() => {
          targetCard.classList.remove("crop-card-highlighted");
        }, 3200);

        window.showToast(`Navigated to ${crop.name} (${crop.hindiName}) · Live rate ₹${crop.currentPrice.toLocaleString("en-IN")}/Qtl at ${crop.mandi}`, "info");
      } else {
        const section = document.getElementById("market-prices");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    }, 60);
  };

  /* --------------------------------------------------------------------------
     3. COMMODITY PRICES GRID WITH PROMINENT IDENTIFICATION PHOTOS
     -------------------------------------------------------------------------- */
  function renderCommodities() {
    if (!dom.commoditiesGrid) return;
    
    let filtered = state.commodities.filter((item) => {
      const matchesCategory = state.selectedCategory === "All" || item.category === state.selectedCategory;
      const q = state.searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.hindiName.includes(q) ||
        item.mandi.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      dom.commoditiesGrid.innerHTML = `
        <div class="col-span-full p-8 text-center glass-panel">
          <p class="text-xl font-bold text-emerald-900">🌾 No crop found matching "${state.searchQuery}"</p>
          <p class="text-sm text-gray-600 mt-1">Try searching for Wheat, Soybean, Cotton, or Onion.</p>
        </div>
      `;
      return;
    }

    dom.commoditiesGrid.innerHTML = filtered
      .map((crop) => {
        const mspDiff = crop.msp ? crop.currentPrice - crop.msp : null;
        const mspLabel =
          mspDiff !== null
            ? mspDiff >= 0
              ? `<span class="badge-glass badge-green text-[11px]">₹${mspDiff} above MSP</span>`
              : `<span class="badge-glass badge-red text-[11px]">₹${Math.abs(mspDiff)} below MSP</span>`
            : `<span class="badge-glass badge-gold text-[11px]">Free Market</span>`;

        // Generate mini SVG sparkline
        const minVal = Math.min(...crop.trend);
        const maxVal = Math.max(...crop.trend);
        const range = maxVal - minVal || 1;
        const points = crop.trend
          .map((val, idx) => {
            const x = (idx / (crop.trend.length - 1)) * 90;
            const y = 32 - ((val - minVal) / range) * 26;
            return `${x},${y}`;
          })
          .join(" ");

        const strokeColor = crop.isPositive ? "#16a34a" : "#dc2626";

        return `
          <div class="glass-panel glass-panel-interactive p-4 relative group flex flex-col justify-between overflow-hidden" id="crop-${crop.id}">
            <div>
              <!-- Visual Crop Identification Photo Banner -->
              <div class="relative w-full h-40 rounded-2xl overflow-hidden mb-3.5 border border-white/70 shadow-sm group-hover:shadow-md transition-shadow">
                <img 
                  src="${crop.image}" 
                  alt="${crop.name}" 
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" 
                  loading="lazy" 
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10"></div>
                
                <!-- Category & Quality Badge -->
                <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                  <span>${crop.icon}</span>
                  <span>${crop.category}</span>
                </div>

                <!-- 24h Movement Badge -->
                <div class="absolute top-2.5 right-2.5 px-2 py-1 rounded-full ${crop.isPositive ? 'bg-emerald-600/90' : 'bg-rose-600/90'} backdrop-blur-md text-white text-[11px] font-extrabold shadow-sm flex items-center gap-1">
                  <span>${crop.isPositive ? '▲' : '▼'}</span>
                  <span>${crop.isPositive ? '+' : ''}${crop.changePercent}%</span>
                </div>

                <!-- Crop Name & Audio Readout on Photo -->
                <div class="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h3 class="font-extrabold text-white text-base leading-tight drop-shadow-md">
                      ${crop.name}
                    </h3>
                    <p class="text-xs font-bold text-amber-300 drop-shadow-sm mt-0.5">
                      ${crop.hindiName}
                    </p>
                  </div>

                  <!-- Tap to Hear Price Audio Button -->
                  <button 
                    class="w-9 h-9 rounded-full bg-white/90 hover:bg-emerald-500 text-emerald-900 hover:text-white flex items-center justify-center shadow-lg border border-white/80 transition-all active:scale-90"
                    title="Speak out price in audio"
                    onclick="window.speakCropPrice('${crop.name}', ${crop.currentPrice}, '${crop.mandi}')"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"/></svg>
                  </button>
                </div>
              </div>

              <!-- Price Showcase -->
              <div class="flex items-baseline justify-between px-1">
                <div>
                  <div class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mandi Rate (Per ${crop.unit})</div>
                  <div class="text-2xl sm:text-3xl font-extrabold text-gray-950 font-mono tracking-tight price-value mt-0.5">
                    ₹${crop.currentPrice.toLocaleString("en-IN")}
                  </div>
                </div>
                
                <div class="text-right">
                  ${mspLabel}
                </div>
              </div>

              <!-- Sparkline & Trend row -->
              <div class="mt-3 pt-2.5 border-t border-emerald-950/5 flex items-center justify-between px-1">
                <span class="text-[11px] font-semibold text-gray-500">24h Price Curve:</span>
                <div class="w-24 h-7">
                  <svg class="w-full h-full overflow-visible" viewBox="0 0 90 35">
                    <polyline fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
                  </svg>
                </div>
              </div>

              <!-- Location & Arrivals Details -->
              <div class="mt-3 space-y-1.5 text-xs text-gray-600 bg-white/45 p-2.5 rounded-xl border border-white/60">
                <div class="flex justify-between">
                  <span class="text-gray-500">📍 Primary Yard:</span>
                  <span class="font-bold text-gray-900">${crop.mandi}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">🚚 Distance:</span>
                  <span class="font-bold text-emerald-800">${crop.distanceKm} km away</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">📦 Today's Volume:</span>
                  <span class="font-semibold text-gray-800">${crop.arrivals}</span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="mt-4 pt-2 flex gap-2">
              <button 
                class="btn-agri btn-primary flex-1 py-2 text-xs font-bold shadow-xs"
                onclick="window.quickSellCrop('${crop.id}', '${crop.name}', ${crop.currentPrice})"
              >
                Sell to Merchants
              </button>
              <button 
                class="btn-agri btn-glass px-3 py-2 text-xs font-semibold"
                onclick="window.askBotAboutCrop('${crop.name}')"
                title="Ask AI if this is the right time to sell"
              >
                Ask AI 🤖
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  /* --------------------------------------------------------------------------
     4. VERIFIED MERCHANTS & DIRECT SELLING CARDS
     -------------------------------------------------------------------------- */
  function renderMerchants() {
    if (!dom.merchantsList) return;

    dom.merchantsList.innerHTML = state.merchants
      .map((m) => `
        <div class="glass-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-emerald-600 hover:border-l-amber-500 transition-colors">
          <div class="flex items-start gap-4">
            <img src="${m.avatar}" alt="${m.name}" class="w-14 h-14 rounded-2xl object-cover border-2 border-white/80 shadow-sm" />
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h4 class="font-bold text-gray-950 text-base">${m.name}</h4>
                <span class="badge-glass badge-green text-[11px]">✓ ${m.badge}</span>
                <span class="badge-glass badge-gold text-[11px]">⭐ ${m.rating} (${m.reviewsCount})</span>
              </div>
              <p class="text-xs font-medium text-gray-600 mt-0.5">${m.company} • <span class="text-emerald-800 font-semibold">${m.distanceKm} km away (${m.location})</span></p>
              
              <div class="mt-2 flex flex-wrap gap-1.5">
                ${m.cropsBuying.map(c => `<span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/60">Buying: ${c}</span>`).join("")}
                ${m.pickupAvailable ? `<span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">🚜 Free Farm Pickup</span>` : ''}
              </div>

              <div class="mt-2 text-xs text-emerald-950 font-bold bg-emerald-100/60 inline-block px-2.5 py-1 rounded-lg border border-emerald-300/60">
                💰 Active Offer: ${m.currentOffer}
              </div>
            </div>
          </div>

          <!-- Merchant Action Buttons -->
          <div class="w-full md:w-auto flex md:flex-col gap-2 shrink-0">
            <a 
              href="tel:${m.phone}" 
              class="btn-agri btn-primary flex-1 md:flex-initial py-2.5 px-5 text-xs text-center shadow-sm"
              onclick="window.trackMerchantCall('${m.name}')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Direct Call Merchant
            </a>
            <button 
              class="btn-agri btn-gold flex-1 md:flex-initial py-2.5 px-5 text-xs text-center font-bold"
              onclick="window.negotiateDeal('${m.id}', '${m.name}')"
            >
              Lock Instant Deal
            </button>
          </div>
        </div>
      `)
      .join("");
  }

  /* --------------------------------------------------------------------------
     5. MANDI HUB LIST & GEOSPATIAL DETAILS
     -------------------------------------------------------------------------- */
  function renderMandisList() {
    if (!dom.mandisList) return;
    
    dom.mandisList.innerHTML = state.mandis
      .map(mandi => `
        <div class="glass-panel p-4 hover:border-emerald-500 transition-all cursor-pointer flex flex-col sm:flex-row gap-3.5 items-start sm:items-center" onclick="window.panToMandi(${mandi.lat}, ${mandi.lng}, '${mandi.name}')">
          <div class="w-full sm:w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/80 shadow-xs relative">
            <img src="${mandi.image}" alt="${mandi.name}" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <span class="absolute bottom-1.5 left-2 text-[10px] font-bold text-white uppercase tracking-wider">Yard Photo</span>
          </div>

          <div class="flex-1 min-w-0 w-full">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-bold text-gray-900 text-sm truncate">${mandi.name}</h4>
                <p class="text-xs text-emerald-800 font-semibold">${mandi.type} • ${mandi.distanceKm} km away</p>
              </div>
              <span class="badge-glass badge-green text-[10px] shrink-0">${mandi.timing.split(" ")[1]} Open</span>
            </div>

            <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600 bg-white/50 p-2 rounded-xl border border-white/60">
              <div><span class="text-gray-400">Daily Arrivals:</span> <b class="text-gray-800">${mandi.dailyArrivals}</b></div>
              <div><span class="text-gray-400">Helpline:</span> <b class="text-emerald-900">${mandi.contact}</b></div>
            </div>

            <div class="mt-2 flex flex-wrap gap-1">
              ${mandi.facilities.slice(0, 3).map(f => `<span class="px-2 py-0.5 rounded text-[10px] bg-white/80 text-gray-700 border border-gray-200">✓ ${f}</span>`).join("")}
            </div>
          </div>
        </div>
      `)
      .join("");
  }

  /* --------------------------------------------------------------------------
     6. INTERACTIVE LEAFLET GEOSPATIAL MAP & ROUTE TRACER
     -------------------------------------------------------------------------- */
  let leafletMapInstance = null;
  let mapMarkers = [];
  let userMarker = null;
  let radarCircle = null;
  let connectionLines = [];

  function initLeafletMap() {
    if (!dom.mapElement || typeof L === "undefined") return;

    // Centered around farmer's current location
    const initialLat = state.userLocation.lat;
    const initialLng = state.userLocation.lng;

    leafletMapInstance = L.map("mapElement", {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([initialLat, initialLng], 11);

    // High quality OpenStreetMap tiles with custom saturation
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(leafletMapInstance);

    // Draw Mandi Pins
    state.mandis.forEach((mandi) => {
      const mandiIcon = L.divIcon({
        className: "custom-pin-mandi",
        html: `<div class="px-2.5 py-1 rounded-full bg-emerald-900 text-white font-bold text-xs border border-white shadow-md flex items-center gap-1">🏛️ ${mandi.name.split(" ")[1] || "Mandi"}</div>`,
        iconSize: [90, 28],
        iconAnchor: [45, 14]
      });

      const marker = L.marker([mandi.lat, mandi.lng], { icon: mandiIcon })
        .addTo(leafletMapInstance)
        .bindPopup(`
          <div class="text-xs space-y-1">
            <h4 class="font-bold text-emerald-950 text-sm">${mandi.name}</h4>
            <p class="text-emerald-800 font-semibold">${mandi.distanceKm} km away • ${mandi.type}</p>
            <p><b>Today's Volume:</b> ${mandi.dailyArrivals}</p>
            <p><b>Facilities:</b> ${mandi.facilities.slice(0, 2).join(", ")}</p>
            <a href="https://maps.google.com/?q=${mandi.lat},${mandi.lng}" target="_blank" class="inline-block mt-1 font-bold text-emerald-700 underline">Open in Google Maps Navigation →</a>
          </div>
        `);
      mapMarkers.push(marker);
    });

    // Draw Merchant Pickup Trucks Pins
    state.merchants.forEach((m) => {
      const merchantIcon = L.divIcon({
        className: "custom-pin-merchant",
        html: `<div class="px-2.5 py-1 rounded-full bg-amber-600 text-white font-bold text-xs border border-white shadow-md flex items-center gap-1">🚜 ${m.name.split(" ")[0]}</div>`,
        iconSize: [85, 28],
        iconAnchor: [42, 14]
      });

      const marker = L.marker([m.lat, m.lng], { icon: merchantIcon })
        .addTo(leafletMapInstance)
        .bindPopup(`
          <div class="text-xs space-y-1">
            <h4 class="font-bold text-amber-950 text-sm">${m.name}</h4>
            <p class="text-amber-800 font-semibold">${m.company}</p>
            <p><b>Paying:</b> ${m.currentOffer}</p>
            <p><b>Distance:</b> ${m.distanceKm} km away</p>
            <a href="tel:${m.phone}" class="inline-block mt-1 px-3 py-1 bg-amber-600 text-white rounded font-bold">Call Merchant</a>
          </div>
        `);
      mapMarkers.push(marker);
    });

    // Draw User Location Pin, Radar, and Routes
    updateMapForUserLocation();
    setTimeout(() => {
      if (leafletMapInstance) leafletMapInstance.invalidateSize();
    }, 400);
  }

  function updateMapForUserLocation() {
    if (!leafletMapInstance || typeof L === "undefined") return;

    const lat = state.userLocation.lat;
    const lng = state.userLocation.lng;

    // Clean up previous user elements
    if (userMarker) leafletMapInstance.removeLayer(userMarker);
    if (radarCircle) leafletMapInstance.removeLayer(radarCircle);
    connectionLines.forEach(line => leafletMapInstance.removeLayer(line));
    connectionLines = [];

    // Custom Farmer Farm Gate Pin
    const farmerIcon = L.divIcon({
      className: "custom-pin-farmer",
      html: `<div class="w-9 h-9 rounded-full bg-emerald-600 text-white border-2 border-white shadow-xl flex items-center justify-center font-bold text-lg animate-pulse">🏡</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    userMarker = L.marker([lat, lng], { icon: farmerIcon })
      .addTo(leafletMapInstance)
      .bindPopup(`<b>📍 ${state.userLocation.name}</b><br><span class="text-xs text-emerald-800 font-semibold">Your farm coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>`)
      .openPopup();

    // Radar radius circle around user's farm
    radarCircle = L.circle([lat, lng], {
      radius: (state.radiusKm || 25) * 1000,
      color: '#16a34a',
      fillColor: '#22c55e',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '5, 8'
    }).addTo(leafletMapInstance);

    // Draw dashed lines from user's farm to the 3 closest Mandis
    const closestThree = state.mandis.slice(0, 3);
    closestThree.forEach((mandi, idx) => {
      const strokeColor = idx === 0 ? '#15803d' : '#d97706';
      const poly = L.polyline([[lat, lng], [mandi.lat, mandi.lng]], {
        color: strokeColor,
        weight: 2.5,
        dashArray: '6, 8',
        opacity: 0.85
      }).addTo(leafletMapInstance);
      poly.bindPopup(`<b>Route to ${mandi.name}</b><br>Distance: ${mandi.distanceKm} km (~${Math.round(mandi.distanceKm * 2.2)} mins by tractor)`);
      connectionLines.push(poly);
    });

    leafletMapInstance.flyTo([lat, lng], 11, { duration: 1.2 });
  }

  window.panToMandi = function (lat, lng, name) {
    if (leafletMapInstance) {
      leafletMapInstance.flyTo([lat, lng], 13, { duration: 1.2 });
      window.showToast(`Navigating map to ${name}`, "info");
    }
  };

  /* --------------------------------------------------------------------------
     7. TWO-WAY VOICE AI CALL ASSISTANT (Interactive Speech & Audio Waveform)
     -------------------------------------------------------------------------- */
  /* --------------------------------------------------------------------------
     7. TWO-WAY VOICE AI CALL ASSISTANT (Multi-Lingual Speech & Audio Waveform)
     -------------------------------------------------------------------------- */
  const LANG_TAGS = {
    en: "en-IN",
    hi: "hi-IN",
    pa: "pa-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    te: "te-IN"
  };

  const CALL_PROMPTS_BY_LANG = {
    en: [
      { text: "🌾 Wheat & Onion rates today", prompt: "Tell me today's wheat and onion rates in surrounding mandis" },
      { text: "🚜 Find pickup buyers", prompt: "Which verified merchants are offering free farm pickup today?" },
      { text: "🐛 Cure yellow leaf spots", prompt: "How do I treat yellow spots and blight on my vegetable crop?" }
    ],
    hi: [
      { text: "🌾 आज गेहूं और प्याज के भाव", prompt: "इंदौर और आसपास की मंडियों में आज गेहूं और प्याज के भाव क्या हैं?" },
      { text: "🚜 फार्म पिकअप व्यापारी", prompt: "कौन से सत्यापित व्यापारी खेत से मुफ्त पिकअप और नकद भुगतान दे रहे हैं?" },
      { text: "🐛 पीली पत्तियों का इलाज", prompt: "सब्जियों और फसल में पीली पत्तियों और फंगस का क्या इलाज है?" }
    ],
    pa: [
      { text: "🌾 ਕਣਕ ਤੇ ਪਿਆਜ਼ ਦੇ ਅੱਜ ਦੇ ਰੇਟ", prompt: "ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ ਵਿੱਚ ਕਣਕ ਅਤੇ ਪਿਆਜ਼ ਦੇ ਅੱਜ ਦੇ ਭਾਅ ਕੀ ਹਨ?" },
      { text: "🚜 ਪਿੰਡੋਂ ਫ਼ਸਲ ਚੁੱਕਣ ਵਾਲੇ ਵਪਾਰੀ", prompt: "ਕਿਹੜੇ ਵਪਾਰੀ ਖੇਤ ਵਿੱਚੋਂ ਮੁਫ਼ਤ ਗੱਡੀ ਭੇਜ ਕੇ ਨਕਦ ਖਰੀਦ ਰਹੇ ਹਨ?" },
      { text: "🐛 ਪੀਲੇ ਪੱਤਿਆਂ ਦਾ ਇਲਾਜ", prompt: "ਫ਼ਸਲ ਦੇ ਪੀਲੇ ਪੱਤਿਆਂ ਅਤੇ ਕੀੜਿਆਂ ਦੀ ਰੋਕਥਾਮ ਦਾ ਕੀ ਤਰੀਕਾ ਹੈ?" }
    ],
    mr: [
      { text: "🌾 आजचे गहू व कांदा भाव", prompt: "आजच्या बाजारात गहू आणि कांद्याचे काय भाव चालू आहेत?" },
      { text: "🚜 थेट शेतातून खरेदीदार", prompt: "कोणते व्यापारी शेतातून मोफत गाडी पाठवून रोख भाव देत आहेत?" },
      { text: "🐛 पिकांवरील रोगाचे निवारण", prompt: "पानावरील पिवळ्या डागांसाठी कोणते औषध फवारावे?" }
    ],
    gu: [
      { text: "🌾 આજના ઘઉં અને ડુંગળીના ભાવ", prompt: "આજે મંડીઓમાં ઘઉં અને ડુંગળીના શું ભાવ ચાલે છે?" },
      { text: "🚜 ખેતરેથી પિકઅપ વેપારી", prompt: "ક્યા વેપારીઓ ખેતરેથી મફત ગાડી મોકલીને રોકડા પૈસા આપે છે?" },
      { text: "🐛 પાકમાં રોગ અને છંટકાવ", prompt: "પાકમાં પીળા ડાઘ માટે કઈ દવાનો છંટકાવ કરવો?" }
    ],
    te: [
      { text: "🌾 నేటి గోధుమ, ఉల్లిపాయ ధరలు", prompt: "ఈరోజు మార్కెట్లో గోధుమ మరియు ఉల్లిపాయ ధరలు ఎంత?" },
      { text: "🚜 తోట వద్దే కొనుగోలుదారులు", prompt: "ఏ వ్యాపారులు ఉచిత రవాణా మరియు నగదు అందిస్తున్నారు?" },
      { text: "🐛 ఆకుల తెగులు నివారణ", prompt: "ఆకులపై పసుపు మచ్చలకు ఏ మందు పిచికారీ చేయాలి?" }
    ]
  };

  function renderCallPromptChips(lang) {
    if (!dom.callPromptChipsContainer) return;
    const prompts = CALL_PROMPTS_BY_LANG[lang] || CALL_PROMPTS_BY_LANG.hi;
    dom.callPromptChipsContainer.innerHTML = prompts.map(p => `
      <button
        class="prompt-chip px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 whitespace-nowrap text-white text-[11px] font-semibold transition-all">
        ${p.text}
      </button>
    `).join("");

    dom.callPromptChipsContainer.querySelectorAll(".prompt-chip").forEach((chip, i) => {
      chip.addEventListener("click", () => {
        handleFarmerMessage(prompts[i].prompt);
      });
    });
  }

  /* --------------------------------------------------------------------------
     TWO-WAY SPEECH RECOGNITION (STT) & MICROPHONE LISTENING ENGINE
     -------------------------------------------------------------------------- */
  function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn("SpeechRecognition API not available in this browser. Farmer can still type or click prompt chips.");
      return null;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = LANG_TAGS[state.currentLang] || "hi-IN";

    let currentInterimBubble = null;

    recognition.onstart = () => {
      state.isListening = true;
      if (dom.micPulseStatus) {
        dom.micPulseStatus.classList.remove("hidden");
        dom.micPulseStatus.classList.add("inline-flex");
      }
      if (dom.callStatusSub) {
        dom.callStatusSub.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span> 🎙️ Listening to you speaking (${(state.currentLang || "hi").toUpperCase()})...`;
      }
    };

    recognition.onresult = (event) => {
      // If AI is currently answering out loud, ignore input to avoid echo loops
      if (state.isAiSpeaking) return;

      let interim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      // Show live speech interim preview in transcript window
      if (interim.trim()) {
        if (!currentInterimBubble) {
          currentInterimBubble = document.createElement("div");
          currentInterimBubble.className = "flex gap-2.5 justify-end animate-pulse";
          currentInterimBubble.innerHTML = `
            <div class="max-w-[85%] bg-emerald-700/70 text-white/95 p-3 rounded-2xl rounded-tr-xs text-xs md:text-sm font-medium border border-emerald-400/40">
              <div class="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span> Speaking...
              </div>
              <span class="interim-text">${interim}</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm shadow-md font-bold">👨‍🌾</div>
          `;
          if (dom.transcriptContainer) {
            dom.transcriptContainer.appendChild(currentInterimBubble);
            dom.transcriptContainer.scrollTop = dom.transcriptContainer.scrollHeight;
          }
        } else {
          const textEl = currentInterimBubble.querySelector(".interim-text");
          if (textEl) textEl.textContent = interim;
        }
      }

      if (finalTranscript.trim()) {
        if (currentInterimBubble && currentInterimBubble.parentNode) {
          currentInterimBubble.parentNode.removeChild(currentInterimBubble);
          currentInterimBubble = null;
        }
        handleFarmerMessage(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        window.showToast("🎙️ Please click 'Allow' on the microphone prompt to talk directly to the AI.", "info");
      }
    };

    recognition.onend = () => {
      state.isListening = false;
      if (currentInterimBubble && currentInterimBubble.parentNode) {
        currentInterimBubble.parentNode.removeChild(currentInterimBubble);
        currentInterimBubble = null;
      }
      // If call is active and user has not muted and AI is not speaking, keep listening continuously
      if (state.isCallActive && !state.isMuted && !state.isAiSpeaking) {
        try {
          recognition.lang = LANG_TAGS[state.currentLang] || "hi-IN";
          recognition.start();
        } catch (e) {}
      }
    };

    return recognition;
  }

  function startListening() {
    if (!state.isCallActive || state.isMuted || state.isAiSpeaking) return;
    if (!state.recognition) {
      state.recognition = initSpeechRecognition();
    }
    if (state.recognition && !state.isListening) {
      try {
        state.recognition.lang = LANG_TAGS[state.currentLang] || "hi-IN";
        state.recognition.start();
      } catch (e) {}
    }
  }

  function stopListening() {
    if (state.recognition) {
      try {
        state.recognition.stop();
      } catch (e) {}
    }
    state.isListening = false;
    if (dom.micPulseStatus) {
      dom.micPulseStatus.classList.add("hidden");
      dom.micPulseStatus.classList.remove("inline-flex");
    }
  }

  function openVoiceCall(initialTopic = null) {
    state.isCallActive = true;
    state.callDurationSeconds = 0;
    if (dom.callModalOverlay) {
      dom.callModalOverlay.classList.add("active");
    }

    // Initialize Active Call Record for Audio & Transcript Recording
    state.activeCallRecord = {
      id: "CALL-" + Date.now().toString(36).toUpperCase(),
      type: "ai",
      caller: "Kisan AI Doctor (किसान सहायक)",
      topic: initialTopic ? `Inquiry: ${initialTopic}` : "Wholesale Mandi Rates & Farm Gate Advisory",
      language: state.currentLang || "hi",
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      transcripts: [],
      keySummary: "",
      tags: ["#KisanAIDoctor", "#VoiceAdvisory", "#LiveMandiBhav"]
    };

    const currentLang = state.currentLang || "hi";
    if (dom.callLangSelector) {
      dom.callLangSelector.value = currentLang;
    }
    renderCallPromptChips(currentLang);

    if (dom.callStatusSub) {
      dom.callStatusSub.textContent = "Connecting to Kisan Sahayak AI Server...";
    }

    // Clear transcript
    if (dom.transcriptContainer) {
      dom.transcriptContainer.innerHTML = "";
    }

    // Start timer after 1 second
    setTimeout(() => {
      if (!state.isCallActive) return;
      if (dom.callStatusSub) {
        dom.callStatusSub.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span> Live Voice Call (${LANG_TAGS[currentLang] || "hi-IN"})`;
      }
      startCallTimer();

      const welcomePrompts = {
        en: initialTopic 
          ? `Namaste Kisan Bhai! You asked about ${initialTopic}. I have pulled up today's live wholesale market prices and active verified merchant orders for your farm. How many quintals or crates are you planning to trade today?`
          : `Namaste Kisan Bhai! I am your Kisan Setu Artificial Intelligence Farm Advisor. In your surrounding wholesale markets today, fresh Red Onion is trading firmly at 2,350 rupees per quintal, and Sharbati Wheat is leading at 2,840 rupees. Verified licensed merchants are currently dispatching trucks for direct farm-gate pickups. You can talk to me directly using your microphone. What crop can I assist you with today?`,
        hi: initialTopic
          ? `नमस्ते किसान भाई! आपने ${initialTopic} के बारे में पूछा है। मैंने आपके लिए आज के ताजा मंडी भाव और सत्यापित व्यापारियों के आर्डर निकाल लिए हैं। आप कितने क्विंटल फसल की बिक्री करना चाहते हैं?`
          : `नमस्ते किसान भाई! मैं किसान सेतु एआई कृषि सलाहकार हूँ। आज आपकी नजदीकी मंडियों में लाल नासिक प्याज 2,350 रुपये और शरबती गेहूं 2,840 रुपये प्रति क्विंटल पर मजबूत चल रहा है। आज व्यापारियों के पास खेत से सीधे मुफ्त गाड़ी भेजकर नकद भुगतान की व्यवस्था भी चालू है। आप मुझसे सीधे अपने माइक से बोलकर बात कर सकते हैं। आज मैं आपकी खेती और फसल के लिए क्या सहायता करूँ?`,
        pa: initialTopic
          ? `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ ਜੀ! ਤੁਸੀਂ ${initialTopic} ਬਾਰੇ ਪੁੱਛਿਆ ਸੀ। ਮੈਂ ਅੱਜ ਦੇ ਲਾਈਵ ਮੰਡੀ ਭਾਵ ਅਤੇ ਵਪਾਰੀਆਂ ਦੇ ਆਰਡਰ ਤਿਆਰ ਰੱਖੇ ਹਨ। ਤੁਸੀਂ ਕਿੰਨੇ ਕੁਇੰਟਲ ਫ਼ਸਲ ਵੇਚਣਾ ਚਾਹੁੰਦੇ ਹੋ?`
          : `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ ਜੀ! ਮੈਂ ਕਿਸਾਨ ਸੇਤੂ ਏਆਈ ਖੇਤੀਬਾੜੀ ਸਲਾਹਕਾਰ ਹਾਂ। ਅੱਜ ਮੰਡੀ ਵਿੱਚ ਲਾਲ ਪਿਆਜ਼ 2,350 ਰੁਪਏ ਅਤੇ ਸ਼ਰਬਤੀ ਕਣਕ 2,840 ਰੁਪਏ ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਚੱਲ ਰਹੀ ਹੈ। ਵਪਾਰੀ ਖੇਤ ਵਿੱਚੋਂ ਮੁਫ਼ਤ ਟਰੱਕ ਭੇਜ ਕੇ ਮਾਲ ਖਰੀਦ ਰਹੇ ਹਨ। ਤੁਸੀਂ ਸਿੱਧਾ ਮਾਈਕ 'ਤੇ ਬੋਲ ਕੇ ਮੇਰੇ ਨਾਲ ਗੱਲ ਕਰ ਸਕਦੇ ਹੋ। ਦੱਸੋ ਅੱਜ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰਾਂ?`,
        mr: initialTopic
          ? `नमस्कार शेतकरी बंधू! आपण ${initialTopic} बद्दल विचारले होते. मी आजचे थेट बाजारभाव आणि खरेदीदारांची माहिती तयार ठेवली आहे. आपण किती क्विंटल विक्री करू इच्छिता?`
          : `नमस्कार शेतकरी बंधू! मी किसान सेतू एआय कृषी सल्लागार आहे. आज आपल्या जवळच्या बाजारात लाल कांदा 2,350 रुपये आणि शरबती गहू 2,840 रुपये प्रति क्विंटल दराने तेजीत सुरू आहे. व्यापारी थेट शेतावरून मोफत वाहतूक आणि जागेवर रोख पैसे देत आहेत. आपण थेट माईकद्वारे बोलून माझ्याशी संवाद साधू शकता. आज मी आपल्या शेतीसाठी काय मदत करू?`,
        gu: initialTopic
          ? `નમસ્તે ખેડૂત મિત્ર! તમે ${initialTopic} વિશે પૂછ્યું છે. મેં આજના તાજા મંડી ભાવ અને અધિકૃત વેપારીઓની યાદી તૈયાર રાખી છે. તમારે કેટલા ક્વિન્ટલ પાક વેચવો છે?`
          : `નમસ્તે ખેડૂત મિત્ર! હું કિસਾਨ સેતુ એઆઈ કૃષિ સલાહકાર છું. આજે આપણી નજીકની મંડીઓમાં લાલ ડુંગળી 2,350 રૂપિયા અને શરબતી ઘઉં 2,840 રૂપિયા પ્રતિ ક્વિન્ટલના ઊંચા ભાવે ચાલે છે. વેપારીઓ સીધા ખેતરેથી મફત વાહન મોકલીને રોકડા નાણાં ચૂકવે છે. આપ સીધા માઈકથી બોલીને મારી સાથે વાત કરી શકો છો. આજે હું આપને શું મદદ કરી શકું?`,
        te: initialTopic
          ? `నమస్కారం రైతు సోదరా! మీరు ${initialTopic} గురించి అడిగారు. నేటి లైవ్ మార్కెట్ ధరలు మరియు ధృవీకరించబడిన వ్యాపారుల వివరాలు సిద్ధంగా ఉన్నాయి. మీరు ఎన్ని క్వింటాళ్ళు విక్రయించాలనుకుంటున్నారు?`
          : `నమస్కారం రైతు సోదరా! నేను కిసాన్ సేతు ఏఐ వ్యవసాయ సలహాదారుని. నేడు మీ సమీప మార్కెట్లలో ఎర్ర ఉల్లిపాయలు 2,350 రూపాయలు మరియు శరబతి గోధుమలు 2,840 రూపాయలు ప్రతి క్వింటాకి బలంగా పలుకుతున్నాయి. వ్యాపారులు తోట వద్దకే ఉచిత వాహనాన్ని పంపి తక్షణ నగదు అందిస్తున్నారు. మీరు మైక్రోఫోన్ ద్వారా నాతో నేరుగా మాట్లాడవచ్చు. నేడు నేను మీకు ఎలా సహాయపడగలను?`
      };

      const welcomePrompt = welcomePrompts[currentLang] || welcomePrompts.hi;
      appendTranscript("ai", welcomePrompt);
      speakText(welcomePrompt, currentLang);

      // Safety fallback: ensure listening starts even if speech synthesis is blocked or silent
      setTimeout(() => {
        if (state.isCallActive && !state.isMuted && !state.isListening && !state.isAiSpeaking) {
          startListening();
        }
      }, 3200);
    }, 1100);
  }

  function endVoiceCall() {
    state.isCallActive = false;
    clearInterval(state.callTimerInterval);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    if (dom.callModalOverlay) {
      dom.callModalOverlay.classList.remove("active");
    }

    // Save and record active call into persistent Call History
    if (state.activeCallRecord && state.activeCallRecord.transcripts.length > 0) {
      state.activeCallRecord.durationSeconds = Math.max(state.callDurationSeconds, 15);
      state.activeCallRecord.timestamp = new Date().toISOString();

      const userQuestions = state.activeCallRecord.transcripts.filter(t => t.sender === 'user');
      const aiReplies = state.activeCallRecord.transcripts.filter(t => t.sender === 'ai');

      if (userQuestions.length > 0) {
        state.activeCallRecord.topic = userQuestions[userQuestions.length - 1].text.slice(0, 80);
      }
      if (aiReplies.length > 0) {
        state.activeCallRecord.keySummary = aiReplies[aiReplies.length - 1].text;
      } else {
        state.activeCallRecord.keySummary = "Voice consultation conducted with Kisan Setu AI Farm Advisor.";
      }

      state.callHistory.unshift(state.activeCallRecord);
      saveCallHistoryToStorage();
      renderCallHistory();
      updateCallHistoryStats();
      state.activeCallRecord = null;
    }

    window.showToast("Call ended. Recording & transcript saved to Call History!", "success");
  }

  /* --------------------------------------------------------------------------
     CALL HISTORY & AUDIO RECORDINGS PERSISTENCE & MANAGEMENT ENGINE
     -------------------------------------------------------------------------- */
  const defaultCallHistory = [
    {
      id: "CALL-2026-9812",
      type: "ai",
      caller: "Kisan AI Doctor (किसान सहायक)",
      topic: "लाल नासिक प्याज मंडी भाव और देवास परिवहन मुनाफा",
      language: "hi",
      durationSeconds: 88,
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      tags: ["#RedOnion", "#DewasMandi", "#FuelArbitrage"],
      transcripts: [
        { sender: "user", text: "प्याज का भाव क्या चल रहा है और देवास जाना ठीक रहेगा क्या?", time: "03:28 AM" },
        { sender: "ai", text: "नमस्ते किसान भाई! आज आपकी नजदीकी मंडियों में लाल नासिक प्याज 2,350 रुपये प्रति क्विंटल पर मजबूत चल रहा है। देवास मंडी में भाव 2,390 रुपये है। 40 क्विंटल की ट्रॉली ले जाने पर 1,188 रुपये डीजल खर्च निकालकर आपको 412 रुपये का शुद्ध अतिरिक्त मुनाफा होगा।", time: "03:28 AM" },
        { sender: "user", text: "व्यापारी खेत से सीधे माल खरीद रहे हैं क्या?", time: "03:29 AM" },
        { sender: "ai", text: "हाँ किसान भाई, श्री गणेश एग्रो के राजेश अग्रवाल जी आज खेत से सीधे ट्रक भेजकर 2,360 रुपये में माल खरीद रहे हैं और धर्मकांटा पर्ची पर तत्काल आरटीजीएस भुगतान दे रहे हैं।", time: "03:29 AM" }
      ],
      keySummary: "आज आपकी नजदीकी मंडियों में लाल नासिक प्याज 2,350 रुपये प्रति क्विंटल पर मजबूत चल रहा है। देवास मंडी में 40 क्विंटल माल पर 1,188 रुपये डीजल खर्च काटकर 412 रुपये शुद्ध अतिरिक्त मुनाफा मिल रहा है। श्री गणेश एग्रो के राजेश अग्रवाल जी खेत से सीधे माल उठाने के लिए उपलब्ध हैं।"
    },
    {
      id: "CALL-2026-9745",
      type: "ai",
      caller: "Kisan AI Doctor (किसान सहायक)",
      topic: "शरबती गेहूं एमएसपी और पत्तियों पर पीले धब्बे स्प्रे सलाह",
      language: "hi",
      durationSeconds: 124,
      timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      tags: ["#Wheat", "#MSP", "#LeafBlight", "#Mancozeb"],
      transcripts: [
        { sender: "user", text: "गेहूं का सरकारी एमएसपी क्या है और पत्तियों पर पीले धब्बे आ रहे हैं?", time: "01:15 PM" },
        { sender: "ai", text: "किसान भाई, शरबती गेहूं का न्यूनतम समर्थन मूल्य (MSP) 2,275 रुपये प्रति क्विंटल निर्धारित है, जबकि खुले बाजार में भाव 2,840 रुपये तक मिल रहा है। पत्तियों पर पीले धब्बों के नियंत्रण के लिए मैनकोजेब 75% WP 2.5 ग्राम प्रति लीटर पानी में मिलाकर सुबह हवा शांत रहने पर छिड़काव करें।", time: "01:15 PM" },
        { sender: "user", text: "आज मौसम छिड़काव के अनुकूल है क्या?", time: "01:16 PM" },
        { sender: "ai", text: "आज इंदौर क्षेत्र में 27 डिग्री तापमान, 64 प्रतिशत आर्द्रता और 8 किमी प्रति घंटा उत्तर-पश्चिमी हवा है। सुबह के समय हवा शांत रहने के कारण कीटनाशक और फफूंदनाशक स्प्रे के लिए आज का दिन सर्वोत्तम है।", time: "01:16 PM" }
      ],
      keySummary: "शरबती गेहूं न्यूनतम समर्थन मूल्य 2,275 रुपये प्रति क्विंटल है और बाजार दर 2,840 रुपये है। पत्तियों पर पीले धब्बों के नियंत्रण हेतु मैनकोजेब 75% WP 2.5 ग्राम प्रति लीटर छिड़काव की सलाह दी गई।"
    },
    {
      id: "CALL-2026-9630",
      type: "merchant",
      caller: "Rajesh Agrawal (Shree Ganesh Agro)",
      topic: "फार्म गेट से सीधी फसल पिकअप और नकद आरटीजीएस भुगतान",
      language: "hi",
      durationSeconds: 52,
      timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      tags: ["#MerchantCall", "#RajeshAgrawal", "#FarmPickup", "#InstantPayment"],
      transcripts: [
        { sender: "user", text: "पटेल जी बोल रहा हूँ ग्राम हातोद से। क्या कल सुबह 40 क्विंटल गेहूं और प्याज उठाने के लिए गाड़ी आ सकती है?", time: "11:40 AM" },
        { sender: "merchant", text: "हाँ पटेल जी, कल सुबह 9 बजे हमारा 4-टन का ट्रक आपके ग्राम हातोद फार्म गेट पर पहुँच जाएगा। धर्मकांटा पर्ची बनते ही तुरंत आरटीजीएस से खाते में भुगतान हो जाएगा।", time: "11:41 AM" }
      ],
      keySummary: "श्री गणेश एग्रो से राजेश अग्रवाल जी के साथ फार्म गेट पिकअप तय हुआ। 4-टन ट्रक सुबह 9 बजे हातोद गेट पर पहुँचेगा और धर्मकांटा पर्ची पर तुरंत भुगतान मिलेगा।"
    }
  ];

  function initCallHistory() {
    try {
      const stored = localStorage.getItem("kisan_call_history");
      if (stored) {
        state.callHistory = JSON.parse(stored);
      } else {
        state.callHistory = [...defaultCallHistory];
        saveCallHistoryToStorage();
      }
    } catch (e) {
      state.callHistory = [...defaultCallHistory];
    }
    renderCallHistory();
    updateCallHistoryStats();
  }

  function saveCallHistoryToStorage() {
    try {
      localStorage.setItem("kisan_call_history", JSON.stringify(state.callHistory));
    } catch (e) {}
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} min`;
  }

  function formatCallDate(isoString) {
    if (!isoString) return "Just now";
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffHours < 24 && now.getDate() === date.getDate()) {
      return `Today, ${timeStr}`;
    } else if (diffHours < 48) {
      return `Yesterday, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${timeStr}`;
    }
  }

  function updateCallHistoryStats() {
    const totalCalls = state.callHistory.length;
    const totalSeconds = state.callHistory.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formattedDuration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const aiCount = state.callHistory.filter(c => c.type === 'ai').length;
    const merchantCount = state.callHistory.filter(c => c.type === 'merchant').length;

    if (dom.historyTotalCalls) dom.historyTotalCalls.textContent = totalCalls;
    if (dom.historyTotalDuration) dom.historyTotalDuration.textContent = formattedDuration;
    if (dom.filterCountAll) dom.filterCountAll.textContent = totalCalls;
    if (dom.filterCountAi) dom.filterCountAi.textContent = aiCount;
    if (dom.filterCountMerchant) dom.filterCountMerchant.textContent = merchantCount;
    if (dom.navCallHistoryBadge) dom.navCallHistoryBadge.textContent = totalCalls;
    if (dom.navCallHistoryBadgeMobile) dom.navCallHistoryBadgeMobile.textContent = totalCalls;
    if (dom.heroCallCountBadge) dom.heroCallCountBadge.textContent = totalCalls;
  }

  function renderCallHistory(filter = state.callHistoryFilter, searchQuery = state.callHistorySearch) {
    if (!dom.callHistoryContainer) return;

    let filtered = state.callHistory;
    if (filter !== "all") {
      filtered = filtered.filter(c => c.type === filter);
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => 
        (c.caller && c.caller.toLowerCase().includes(q)) ||
        (c.topic && c.topic.toLowerCase().includes(q)) ||
        (c.keySummary && c.keySummary.toLowerCase().includes(q)) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q))) ||
        (c.transcripts && c.transcripts.some(t => t.text.toLowerCase().includes(q)))
      );
    }

    if (filtered.length === 0) {
      dom.callHistoryContainer.innerHTML = `
        <div class="glass-panel p-8 text-center space-y-3 bg-white/70 border border-white/80">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 text-2xl flex items-center justify-center mx-auto shadow-sm">
            🎙️
          </div>
          <h4 class="text-base font-bold text-emerald-950">No Call Recordings Found</h4>
          <p class="text-xs text-gray-600 max-w-md mx-auto">
            ${searchQuery ? "No calls match your search query. Try clearing the filter." : "Start a hands-free conversation with Kisan AI Doctor to get real-time market rates, crop diagnostics, and transport calculations."}
          </p>
          <div class="pt-2">
            <button class="trigger-call-bot btn-agri btn-primary py-2 px-5 text-xs font-bold shadow-md inline-flex items-center gap-2">
              <span>📞</span> <span>Start Your First AI Call</span>
            </button>
          </div>
        </div>
      `;
      // Rebind trigger buttons
      dom.callHistoryContainer.querySelectorAll(".trigger-call-bot").forEach(btn => {
        btn.addEventListener("click", () => openVoiceCall());
      });
      return;
    }

    dom.callHistoryContainer.innerHTML = filtered.map(call => {
      const isAi = call.type === "ai";
      const avatarBg = isAi 
        ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white" 
        : "bg-gradient-to-tr from-amber-500 to-orange-400 text-white";
      const avatarIcon = isAi ? "🌾" : "🚜";
      const callerTypeTag = isAi ? "Kisan AI Doctor" : "Verified Merchant";
      const langUpper = (call.language || "hi").toUpperCase();
      const formattedDate = formatCallDate(call.timestamp);
      const durationFormatted = formatDuration(call.durationSeconds || 45);

      const transcriptBubbles = (call.transcripts || []).map(t => {
        const isUser = t.sender === "user";
        return `
          <div class="flex gap-2 ${isUser ? "justify-end" : "justify-start"}">
            <div class="max-w-[85%] ${isUser ? "bg-emerald-700 text-white" : "bg-white text-emerald-950 border border-emerald-900/10"} p-2.5 rounded-xl text-xs shadow-xs">
              <div class="flex items-center justify-between gap-3 text-[10px] ${isUser ? "text-emerald-200" : "text-emerald-700"} font-bold mb-0.5">
                <span>${isUser ? "🧑‍🌾 You (Farmer)" : (isAi ? "🌾 Kisan AI Doctor" : "🚜 Merchant")}</span>
                <span class="opacity-75 font-normal">${t.time || ""}</span>
              </div>
              <p class="leading-relaxed">${t.text}</p>
            </div>
          </div>
        `;
      }).join("");

      const tagsHtml = (call.tags || []).map(tag => `
        <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60">
          ${tag}
        </span>
      `).join("");

      return `
        <div class="call-record-card p-5 rounded-2xl shadow-sm space-y-4" id="call-card-${call.id}">
          <!-- Card Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-950/10">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl ${avatarBg} flex items-center justify-center text-xl shrink-0 shadow-md border border-white/40">
                ${avatarIcon}
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-extrabold text-sm sm:text-base text-emerald-950">${call.caller}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isAi ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}">
                    ${callerTypeTag}
                  </span>
                </div>
                <p class="text-xs font-semibold text-gray-700 mt-0.5 line-clamp-1">${call.topic}</p>
              </div>
            </div>

            <!-- Metadata Badges -->
            <div class="flex items-center gap-2 flex-wrap shrink-0">
              <span class="px-2.5 py-1 rounded-lg bg-white/90 border border-white/90 text-emerald-900 font-mono text-[11px] font-bold shadow-xs">
                ⏱️ ${durationFormatted}
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-white/90 border border-white/90 text-gray-600 text-[11px] font-medium shadow-xs">
                📅 ${formattedDate}
              </span>
              <span class="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                ${langUpper}
              </span>
            </div>
          </div>

          <!-- Highlighted Summary Quote Box -->
          <div class="p-3.5 rounded-xl bg-white/90 border border-emerald-600/20 text-xs text-emerald-950 leading-relaxed shadow-xs">
            <div class="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider mb-1">
              <span>💡</span> <span>Advisory Summary & Key Recommendations:</span>
            </div>
            <p class="font-medium text-gray-800">${call.keySummary || "Consultation completed and saved."}</p>
          </div>

          <!-- Audio Waveform Player Bar -->
          <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <button 
                id="play-btn-${call.id}" 
                onclick="window.playCallAudio('${call.id}')"
                class="btn-agri btn-primary py-1.5 px-3.5 text-xs font-bold shadow-xs flex items-center gap-2 shrink-0">
                <span>▶️</span> <span>Listen to Recording</span>
              </button>

              <!-- Animated Sound Waveform Indicator -->
              <div class="audio-wave-container" id="wave-${call.id}" title="Audio Voice Waveform">
                <span class="audio-wave-bar"></span>
                <span class="audio-wave-bar"></span>
                <span class="audio-wave-bar"></span>
                <span class="audio-wave-bar"></span>
                <span class="audio-wave-bar"></span>
                <span class="audio-wave-bar"></span>
                <span class="audio-wave-bar"></span>
                <span class="audio-wave-bar"></span>
              </div>

              <span class="text-[11px] font-mono text-emerald-900 font-bold hidden sm:inline">
                00:00 / ${durationFormatted}
              </span>
            </div>

            <!-- Full Transcript Toggle Button -->
            <button 
              onclick="window.toggleCallTranscript('${call.id}')" 
              class="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 shrink-0 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-white/90 shadow-xs transition-colors">
              <span>💬 View Full Transcript (${(call.transcripts || []).length} turns)</span>
              <span id="trans-icon-${call.id}" class="text-[10px] transition-transform">▼</span>
            </button>
          </div>

          <!-- Collapsible Transcript Drawer -->
          <div id="drawer-${call.id}" class="transcript-drawer space-y-2.5 px-1">
            <div class="p-3 bg-emerald-950/5 rounded-xl space-y-2 max-h-[360px] overflow-y-auto">
              ${transcriptBubbles}
            </div>
          </div>

          <!-- Footer Actions & Tags -->
          <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-emerald-950/10">
            <div class="flex items-center gap-1.5 flex-wrap">
              ${tagsHtml}
            </div>

            <div class="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onclick="openVoiceCall('${call.topic.replace(/'/g, "\\'")}')" 
                class="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors"
                title="Ask a follow-up question on this topic">
                <span>🔁</span> <span>Follow Up</span>
              </button>
              <button 
                onclick="window.shareCallAdvisory('${call.id}')" 
                class="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-emerald-800 font-bold text-xs flex items-center gap-1 border border-white/80 transition-colors"
                title="Share advice on WhatsApp">
                <span>📲</span> <span>Share</span>
              </button>
              <button 
                onclick="window.deleteCallRecord('${call.id}')" 
                class="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete recording">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  window.playCallAudio = function(callId) {
    const call = state.callHistory.find(c => c.id === callId);
    if (!call) return;

    const waveContainer = document.getElementById(`wave-${callId}`);
    const playBtn = document.getElementById(`play-btn-${callId}`);

    // Toggle stop if already playing this call
    if (state.currentlyPlayingAudioId === callId) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      state.currentlyPlayingAudioId = null;
      if (waveContainer) waveContainer.classList.remove("playing");
      if (playBtn) playBtn.innerHTML = `<span>▶️</span> <span>Listen to Recording</span>`;
      return;
    }

    // Stop previous audio if playing
    if (state.currentlyPlayingAudioId) {
      const prevWave = document.getElementById(`wave-${state.currentlyPlayingAudioId}`);
      const prevBtn = document.getElementById(`play-btn-${state.currentlyPlayingAudioId}`);
      if (prevWave) prevWave.classList.remove("playing");
      if (prevBtn) prevBtn.innerHTML = `<span>▶️</span> <span>Listen to Recording</span>`;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    state.currentlyPlayingAudioId = callId;
    if (waveContainer) waveContainer.classList.add("playing");
    if (playBtn) playBtn.innerHTML = `<span>⏸️</span> <span>Pause Recording</span>`;

    const textToSpeak = call.keySummary || (call.transcripts.find(t => t.sender === 'ai')?.text) || "Call recording completed.";

    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const lang = call.language || "hi";
      utterance.lang = LANG_TAGS[lang] || "hi-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        state.currentlyPlayingAudioId = null;
        if (waveContainer) waveContainer.classList.remove("playing");
        if (playBtn) playBtn.innerHTML = `<span>▶️</span> <span>Listen to Recording</span>`;
      };
      utterance.onerror = () => {
        state.currentlyPlayingAudioId = null;
        if (waveContainer) waveContainer.classList.remove("playing");
        if (playBtn) playBtn.innerHTML = `<span>▶️</span> <span>Listen to Recording</span>`;
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        state.currentlyPlayingAudioId = null;
        if (waveContainer) waveContainer.classList.remove("playing");
        if (playBtn) playBtn.innerHTML = `<span>▶️</span> <span>Listen to Recording</span>`;
      }, 5000);
    }
  };

  window.toggleCallTranscript = function(callId) {
    const drawer = document.getElementById(`drawer-${callId}`);
    const icon = document.getElementById(`trans-icon-${callId}`);
    if (drawer) {
      drawer.classList.toggle("open");
      if (icon) {
        icon.style.transform = drawer.classList.contains("open") ? "rotate(180deg)" : "rotate(0deg)";
      }
    }
  };

  window.deleteCallRecord = function(callId) {
    if (state.currentlyPlayingAudioId === callId && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      state.currentlyPlayingAudioId = null;
    }
    state.callHistory = state.callHistory.filter(c => c.id !== callId);
    saveCallHistoryToStorage();
    renderCallHistory();
    updateCallHistoryStats();
    window.showToast("Call recording removed from history.", "info");
  };

  window.clearCallHistory = function() {
    if (!state.callHistory.length) return;
    if (confirm("Are you sure you want to clear all recorded voice calls and transcripts?")) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      state.currentlyPlayingAudioId = null;
      state.callHistory = [];
      saveCallHistoryToStorage();
      renderCallHistory();
      updateCallHistoryStats();
      window.showToast("Call history cleared.", "info");
    }
  };

  window.exportCallHistory = function() {
    if (!state.callHistory.length) {
      window.showToast("No call history to export.", "info");
      return;
    }

    const farmer = state.farmerProfile || {};
    let content = "=====================================================\n";
    content += "🌾 KISAN SETU (किसान सेतु) - FARM CALL HISTORY & AUDIO LOGS\n";
    content += `Registered Farmer: ${farmer.name || "Ramesh Patel"} | Kisan ID: ${farmer.kisanId || "KISAN-MP-8841"}\n`;
    content += `Farm Gate Location: ${farmer.village || "Gram Hatod"}, ${farmer.district || "Indore"}, ${farmer.state || "Madhya Pradesh"}\n`;
    content += `Total Calls Logged: ${state.callHistory.length}\n`;
    content += `Export Generated: ${new Date().toLocaleString()}\n`;
    content += "=====================================================\n\n";

    state.callHistory.forEach((c, idx) => {
      content += `[${idx + 1}] RECORD ID: ${c.id}\n`;
      content += `Caller: ${c.caller}\n`;
      content += `Topic: ${c.topic}\n`;
      content += `Timestamp: ${formatCallDate(c.timestamp)} | Duration: ${formatDuration(c.durationSeconds)}\n`;
      content += `Language: ${(c.language || "hi").toUpperCase()}\n`;
      content += `Key Advice Summary:\n${c.keySummary || "N/A"}\n\n`;
      content += "TRANSCRIPT EXCHANGES:\n";
      (c.transcripts || []).forEach(t => {
        content += `  [${t.time || ""}] ${t.sender === "user" ? "Farmer" : "Assistant"}: ${t.text}\n`;
      });
      content += "\n-----------------------------------------------------\n\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KisanSetu_Call_History_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.showToast("Call history exported successfully as text file.", "success");
  };

  window.shareCallAdvisory = function(callId) {
    const call = state.callHistory.find(c => c.id === callId);
    if (!call) return;
    const text = encodeURIComponent(`🌾 *Kisan Setu Call Advisory*\n\n*Topic:* ${call.topic}\n*Summary:* ${call.keySummary}\n\n_Logged on Kisan Setu Farmer Portal_`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };


  function startCallTimer() {
    clearInterval(state.callTimerInterval);
    state.callTimerInterval = setInterval(() => {
      state.callDurationSeconds++;
      const mins = String(Math.floor(state.callDurationSeconds / 60)).padStart(2, "0");
      const secs = String(state.callDurationSeconds % 60).padStart(2, "0");
      if (dom.callTimerDisplay) {
        dom.callTimerDisplay.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  function appendTranscript(sender, text) {
    if (!dom.transcriptContainer) return;
    if (state.activeCallRecord) {
      state.activeCallRecord.transcripts.push({
        sender: sender,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex gap-2.5 ${sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`;
    
    if (sender === "ai") {
      msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm shadow-md font-bold">🌾</div>
        <div class="max-w-[85%] bg-white/90 backdrop-blur-md text-emerald-950 p-3.5 rounded-2xl rounded-tl-xs text-xs md:text-sm font-medium border border-white/80 shadow-md">
          <div class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Kisan AI Doctor (${(state.currentLang || "hi").toUpperCase()})</div>
          ${text}
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="max-w-[85%] bg-emerald-700 text-white p-3.5 rounded-2xl rounded-tr-xs text-xs md:text-sm font-medium shadow-md">
          <div class="text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">You (Farmer)</div>
          ${text}
        </div>
        <div class="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm shadow-md font-bold">👨‍🌾</div>
      `;
    }

    dom.transcriptContainer.appendChild(msgDiv);
    dom.transcriptContainer.scrollTop = dom.transcriptContainer.scrollHeight;
  }

  /* --------------------------------------------------------------------------
     INTELLIGENT AGRI-NLP ANSWER ENGINE (Multi-Crop, Multi-Dialect, Dynamic Data)
     -------------------------------------------------------------------------- */
  const CROP_DICTIONARY = [
    {
      id: "potato-jyoti",
      names: { en: "Potato (Jyoti)", hi: "ज्योति आलू", pa: "ਆਲੂ", mr: "बटाटा", gu: "બટાટા", te: "బంగాళాదుంప" },
      aliases: ["potato", "potatoes", "aalu", "aaloo", "alu", "batata", "jyoti", "chipsona", "आलू", "ਬਟਾਟਾ", "ਆਲੂ", "બટાટા", "బంగాళాదుంప"]
    },
    {
      id: "onion-red",
      names: { en: "Red Onion", hi: "लाल प्याज", pa: "ਲਾਲ ਪਿਆਜ਼", mr: "लाल कांदा", gu: "લાલ ડુંગળી", te: "ఎర్ర ఉల్లిపాయ" },
      aliases: ["onion", "onions", "pyaz", "pyaaz", "kanda", "nashik", "प्याज", "कांदा", "ਕਾਂਦਾ", "ਪਿਆਜ਼", "ડુંગળી", "ఉల్లిపాయ"]
    },
    {
      id: "tomato-hybrid",
      names: { en: "Hybrid Tomato", hi: "हाइब्रिड टमाटर", pa: "ਟਮਾਟਰ", mr: "टोमॅटो", gu: "ટામેટા", te: "టమోటా" },
      aliases: ["tomato", "tomatoes", "tamatar", "tamater", "hybrid tomato", "टमाटर", "ਟਮਾਟਰ", "टोमॅटो", "ટામેટા", "టమోటా"]
    },
    {
      id: "garlic-bold",
      names: { en: "Garlic (Bold Desi)", hi: "देसी लहसुन", pa: "ਲਸਣ", mr: "जाड लसूण", gu: "દેશી લસણ", te: "వెల్లుల్లి" },
      aliases: ["garlic", "lahsun", "lehsun", "lasun", "लहसुन", "लसूण", "ਲਸਣ", "લસણ", "వెల్లుల్లి"]
    },
    {
      id: "ginger-fresh",
      names: { en: "Fresh Ginger", hi: "ताजा अदरक", pa: "ਤਾਜ਼ਾ ਅਦਰਕ", mr: "आले", gu: "તાજું આદુ", te: "అల్లం" },
      aliases: ["ginger", "adrak", "aale", "aadu", "अदरक", "ਆਦਰਕ", "ਅਦਰਕ", "आले", "આદુ", "అల్లం"]
    },
    {
      id: "peas-green",
      names: { en: "Green Peas", hi: "हरी मटर", pa: "ਹਰੀ ਮਟਰ", mr: "हिरवा मटार", gu: "લીલા વટાણા", te: "పచ్చి బఠానీ" },
      aliases: ["pea", "peas", "matar", "mutter", "vatana", "मटर", "ਮਟਰ", "ਵટાણા", "బఠానీ"]
    },
    {
      id: "chilli-green",
      names: { en: "Green Chilli", hi: "हरी तीखी मिर्च", pa: "ਹਰੀ ਮਿਰਚ", mr: "हिरवी तिखट मिरची", gu: "લીલા તીખા મરચાં", te: "పచ్చిమిర్చి" },
      aliases: ["chilli", "chili", "mirch", "mirchi", "jwala", "मिर्च", "ਮਿਰਚ", "ਮਰચા", "మిరప"]
    },
    {
      id: "cauliflower-snowball",
      names: { en: "Cauliflower", hi: "फूलगोभी", pa: "ਫੁੱਲ ਗੋਭੀ", mr: "फ्लॉवर", gu: "ફૂલકોબી", te: "క్యాలీఫ్లవర్" },
      aliases: ["cauliflower", "phoolgobhi", "gobhi", "फूलगोभी", "गोभी", "ਫੁੱਲ ਗੋਭੀ", "ફૂલકોબી", "క్యాలీఫ్లవర్"]
    },
    {
      id: "cabbage-green",
      names: { en: "Cabbage", hi: "पत्तागोभी", pa: "ਬੰਦ ਗੋਭੀ", mr: "कोबी", gu: "પત્તાકોબી", te: "క్యాబేజీ" },
      aliases: ["cabbage", "pattagobhi", "bandgobhi", "kobi", "पत्तागोभी", "ਬੰਦ ਗੋਭੀ", "પત્તાકોબી", "క్యాబేజీ"]
    },
    {
      id: "okra-ladyfinger",
      names: { en: "Ladyfinger (Bhindi)", hi: "हरी भिंडी", pa: "ਭਿੰਡੀ", mr: "भेंडी", gu: "ભીંડા", te: "బెండకాయ" },
      aliases: ["okra", "ladyfinger", "lady finger", "bhindi", "bhendi", "भिंडी", "ਭਿੰਡੀ", "ભીંડા", "బెండకాయ"]
    },
    {
      id: "brinjal-purple",
      names: { en: "Round Brinjal", hi: "गोल बैंगन", pa: "ਬੈਂਗਣ", mr: "वांगी", gu: "રીંગણ", te: "వంకాయ" },
      aliases: ["brinjal", "eggplant", "baingan", "baigan", "vangi", "बैंगन", "ਬੈਂਗਣ", "રીંગણ", "వంకాయ"]
    },
    {
      id: "carrot-red",
      names: { en: "Red Carrot", hi: "लाल गाजर", pa: "ਗਾਜਰ", mr: "गाजर", gu: "ગાજર", te: "క్యారెట్" },
      aliases: ["carrot", "gajar", "गाजर", "ਗਾਜਰ", "ગાજર", "క్యారెట్"]
    },
    {
      id: "capsicum-green",
      names: { en: "Green Capsicum", hi: "शिमला मिर्च", pa: "ਸ਼ਿਮਲਾ ਮਿਰਚ", mr: "ढोबळी मिरची", gu: "કેપ્સિકમ", te: "క్యాప్సికం" },
      aliases: ["capsicum", "shimla mirch", "bell pepper", "शिमला मिर्च", "કેપ્સિકમ", "క్యాప్సికం"]
    },
    {
      id: "coriander-fresh",
      names: { en: "Fresh Coriander", hi: "हरा धनिया", pa: "ਧਨੀਆ", mr: "कोथिंबीर", gu: "કોથમીર", te: "కొత్తిమీర" },
      aliases: ["coriander", "dhaniya", "dhania", "kothmir", "cilantro", "धनिया", "ਧਨੀਆ", "કોથમીਰ", "కొత్తిమీర"]
    },
    {
      id: "bottle-gourd",
      names: { en: "Bottle Gourd", hi: "ताजा लौकी", pa: "ਦੂਧੀ", mr: "दुधी भोपळा", gu: "દૂધી", te: "సొరకాయ" },
      aliases: ["bottle gourd", "lauki", "doodhi", "dudhi", "ghiya", "लौकी", "ਦੂਧੀ", "દૂધી", "సొరకాయ"]
    },
    {
      id: "wheat-sharbati",
      names: { en: "Sharbati Gold Wheat", hi: "शरबती गेहूं", pa: "ਸ਼ਰਬਤੀ ਕਣਕ", mr: "शरबती गहू", gu: "શરબતી ઘઉં", te: "గోధుమలు" },
      aliases: ["wheat", "gehun", "gehu", "kanak", "sharbati", "गेहूं", "गेहू", "ਕਣਕ", "ઘઉં", "గోధుమ"]
    },
    {
      id: "soybean-yellow",
      names: { en: "Yellow Soybean", hi: "पीली सोयाबीन", pa: "ਸੋਇਆਬੀਨ", mr: "सोयाबीन", gu: "સોયાબીન", te: "సోయాబీన్" },
      aliases: ["soybean", "soya", "soyabean", "सोयाबीन", "ਸੋਇਆਬੀਨ", "સોયાબીન", "సోయాబీన్"]
    },
    {
      id: "mustard-black",
      names: { en: "Black Mustard (Sarson)", hi: "काली सरसों", pa: "ਸਰ੍ਹੋਂ", mr: "मोहरी", gu: "રાઈ", te: "ఆవాలు" },
      aliases: ["mustard", "sarson", "rai", "sarso", "सरसों", "ਸਰ੍ਹੋਂ", "રાઈ", "ఆవాలు"]
    },
    {
      id: "chana-desi",
      names: { en: "Desi Chana (Chickpea)", hi: "देसी चना", pa: "ਦੇਸੀ ਛੋਲੇ", mr: "हरभरा", gu: "ચણા", te: "శనగలు" },
      aliases: ["chana", "chickpea", "gram", "chole", "harbhara", "चना", "ਛੋਲੇ", "ચણા", "శనగలు"]
    },
    {
      id: "cotton-medium",
      names: { en: "Cotton (Kapas)", hi: "सफेद कपास", pa: "ਕਪਾਹ", mr: "कापूस", gu: "કપાસ", te: "పత్తి" },
      aliases: ["cotton", "kapas", "rui", "kapus", "कपास", "ਕਪਾਹ", "કપાસ", "పత్తి"]
    },
    {
      id: "paddy-basmati",
      names: { en: "Basmati Paddy (1121)", hi: "बासमती धान", pa: "ਬਾਸਮਤੀ ਝੋਨਾ", mr: "बासमती तांदूळ", gu: "બાસમતી ચોખા", te: "బాస్మతి వరి" },
      aliases: ["paddy", "rice", "basmati", "chawal", "dhan", "चावल", "धान", "ਝੋਨਾ", "ਚੋખા", "వరి"]
    },
    {
      id: "cumin-jeera",
      names: { en: "Cumin Seeds (Jeera)", hi: "जीरा", pa: "ਜੀਰਾ", mr: "जिरे", gu: "જીરું", te: "జీలకర్ర" },
      aliases: ["cumin", "jeera", "zira", "जीरा", "ਜੀਰਾ", "જીરું", "జీలకర్ర"]
    },
    {
      id: "turmeric-salem",
      names: { en: "Salem Turmeric (Haldi)", hi: "हल्दी", pa: "ਹਲਦੀ", mr: "हळद", gu: "હળદર", te: "పసుపు" },
      aliases: ["turmeric", "haldi", "हल्दी", "ਹਲਦੀ", "હળદર", "పసుపు"]
    },
    {
      id: "banana-g9",
      names: { en: "Banana (G-9)", hi: "केला", pa: "ਕੇਲਾ", mr: "केळी", gu: "કેળું", te: "అరటిపండు" },
      aliases: ["banana", "kela", "केला", "ਕੇਲਾ", "કેળું", "అరటిపండు"]
    },
    {
      id: "orange-nagpur",
      names: { en: "Nagpur Orange", hi: "नागपुर संतरा", pa: "ਸੰਤਰਾ", mr: "संत्री", gu: "સંતરા", te: "నారింజ" },
      aliases: ["orange", "santra", "santre", "संतरा", "ਸੰਤਰਾ", "સંતરા", "నారింజ"]
    },
    {
      id: "pomegranate-bhagwa",
      names: { en: "Bhagwa Pomegranate", hi: "अनार", pa: "ਅਨਾਰ", mr: "डाळिंब", gu: "દાડમ", te: "దానిమ్మ" },
      aliases: ["pomegranate", "anaar", "anar", "अनार", "ਅਨਾਰ", "દાડમ", "దానిమ్మ"]
    }
  ];

  function matchCropAlias(text, alias) {
    if (!text || !alias) return false;
    const cleanAlias = alias.trim();
    // If alias consists of Latin/English characters and digits
    if (/^[a-zA-Z0-9\s-]+$/.test(cleanAlias)) {
      const aliasLower = cleanAlias.toLowerCase();
      // Phrase match for multi-word aliases (e.g. "bottle gourd", "hybrid tomato")
      if (aliasLower.includes(" ")) {
        return text.toLowerCase().includes(aliasLower);
      }
      // Exact word-boundary token matching to prevent false positives (e.g. 'rice' in 'price', 'pea' in 'speaks')
      const words = text.toLowerCase().split(/[\s,?.!;:()/'"-]+/);
      return words.includes(aliasLower);
    }
    // For Non-Latin unicode scripts (Devanagari, Gurmukhi, Telugu, Gujarati)
    return text.includes(cleanAlias);
  }

  function generateContextualAgriAIAnswer(rawQuery, lang = "hi") {
    const q = (rawQuery || "").toLowerCase().trim();
    const profile = state.farmerProfile || {
      name: "Ramesh Patel",
      phone: "98260 12345",
      landSize: "12",
      landUnit: "Acres",
      primaryCrop: "Sharbati Wheat",
      district: "Indore",
      state: "Madhya Pradesh",
      village: "Gram Hatod Farm Gate",
      pincode: "453111",
      kisanId: "KISAN-MP-8841",
      lat: 22.7312,
      lng: 75.8648
    };

    // ------------------------------------------------------------------------
    // 1. WEBSITE INFORMATION: FARMER IDENTITY, PROFILE & PASSBOOK
    // ------------------------------------------------------------------------
    const profileKeywords = [
      "profile", "who am i", "my name", "my details", "my farm", "kisan id", "farmer", "hatod", 
      "ramesh", "patel", "passbook", "phone number", "mobile number", "my crop", "acres", 
      "land size", "pincode", "village", "who is the farmer", "my account", "login details",
      "किसान", "प्रोफाइल", "मेरा नाम", "मेरा खेत", "किसान आईडी", "मोबाइल", "गाँव", "एकड़", "जमीन",
      "खाता", "ਪ੍ਰੋਫਾਈਲ", "ਮੇਰਾ ਨਾਮ", "शेतकरी", "माझे नाव", "પ્રોફાઇલ", "મારું નામ", "రైతు", "నా పేరు"
    ];

    if (profileKeywords.some(kw => q.includes(kw))) {
      const pAnswers = {
        en: `According to the farmer profile on the website, the registered farmer is ${profile.name}, holding Kisan Passbook ID ${profile.kisanId}. Your farm is located at ${profile.village} in ${profile.district} district, ${profile.state}, with postal pincode ${profile.pincode}. Your registered land holding is ${profile.landSize} ${profile.landUnit}, and your ready harvest crop is Sharbati Wheat. Your farm gate GPS coordinates are locked at ${profile.lat} degrees North and ${profile.lng} degrees East, with contact phone number +91 ${profile.phone}.`,
        hi: `वेबसाइट पर दर्ज किसान प्रोफाइल के अनुसार आपका पंजीकृत नाम ${profile.name} है और आपकी किसान पासबुक आईडी ${profile.kisanId} है। आपका खेत ${profile.district} जिले के ${profile.village} में स्थित है, जिसका पिनकोड ${profile.pincode} है। आपके पास कुल ${profile.landSize} ${profile.landUnit} जमीन है और आपकी तैयार फसल शरबती गेहूं है। आपके खेत के जीपीएस निर्देशांक ${profile.lat} उत्तर और ${profile.lng} पूर्व पर दर्ज हैं और आपका मोबाइल नंबर +91 ${profile.phone} है।`,
        pa: `ਵੈੱਬਸਾਈਟ ਦੇ ਰਿਕਾਰਡ ਮੁਤਾਬਕ ਰਜਿਸਟਰਡ ਕਿਸਾਨ ਦਾ ਨਾਮ ${profile.name} ਹੈ ਅਤੇ ਕਿਸਾਨ ਆਈਡੀ ${profile.kisanId} ਹੈ। ਤੁਹਾਡਾ ਖੇਤ ${profile.village}, ਜ਼ਿਲ੍ਹਾ ${profile.district} ਵਿੱਚ ਹੈ। ਤੁਹਾਡੇ ਕੋਲ ${profile.landSize} ${profile.landUnit} ਜ਼ਮੀਨ ਹੈ ਅਤੇ ਮੁੱਖ ਫ਼ਸਲ ਕਣਕ ਹੈ। ਤੁਹਾਡਾ ਫ਼ੋਨ ਨੰਬਰ +91 ${profile.phone} ਹੈ।`,
        mr: `वेबसाईटवरील नोंदीनुसार आपले नाव ${profile.name} असून किसान पासबुक आयडी ${profile.kisanId} आहे. आपली शेतजमीन ${profile.village}, जिल्हा ${profile.district} येथे आहे. आपल्याकडे ${profile.landSize} ${profile.landUnit} जमीन असून तयार पीक शरबती गहू आहे. आपला नोंदणीकृत संपर्क क्रमांक +91 ${profile.phone} आहे.`,
        gu: `વેબસાઇટ પર નોંધાયેલ વિગતો મુજબ ખેડૂતનું નામ ${profile.name} છે અને કિસાન આઈડી ${profile.kisanId} છે. આપનું ખેતર ${profile.village}, જિલ્લો ${profile.district} માં આવેલું છે. આપણી પાસે ${profile.landSize} ${profile.landUnit} જમીન છે અને સંપર્ક નંબર +91 ${profile.phone} છે.`,
        te: `వెబ్‌సైట్ ప్రొఫైల్ ప్రకారం నమోదైన రైతు పేరు ${profile.name}, మరియు కిసాన్ ఐడీ ${profile.kisanId}. మీ పొలం ${profile.village}, ${profile.district} జిల్లాలో ఉంది. మీ భూమి విస్తీర్ణం ${profile.landSize} ${profile.landUnit}, మరియు సంప్రదింపు నంబర్ +91 ${profile.phone}.`
      };
      return pAnswers[lang] || pAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 2. WEBSITE INFORMATION: SPECIFIC MANDIS (Rau, Indore, Dewas, Sanwer, Ujjain, Mhow)
    // ------------------------------------------------------------------------
    // Check Rau Mandi
    if (q.includes("rau") || q.includes("राऊ") || q.includes("ਰਾਊ") || q.includes("રાઉ") || q.includes("రావు")) {
      const rauAnswers = {
        en: "According to the website's Mandi table, the Rau Perishable and Horticulture Hub is located 12.2 kilometers from your farm gate, which is approximately 27 minutes by tractor. It specializes in vegetables, potatoes, onions, and garlic, handling daily arrivals of 12,900 crates. Facilities include 5,000 metric tons of cold storage, ripening chambers, and reefer truck bays. It is open daily from 04:00 AM to 02:00 PM, and the mandi office contact phone number is 0731-2856402.",
        hi: "वेबसाइट के मंडी डाटा के अनुसार राऊ फल एवं सब्जी मंडी आपके खेत से 12.2 किलोमीटर दूर है, जो ट्रैक्टर से लगभग 27 मिनट का रास्ता है। यह मंडी आलू, प्याज, टमाटर और लहसुन जैसी सब्जियों के लिए विशेष केंद्र है जहाँ प्रतिदिन 12,900 क्रेट्स की आवक होती है। यहाँ 5,000 मीट्रिक टन का कोल्ड स्टोरेज, राइपनिंग चैंबर और इलेक्ट्रॉनिक नीलामी की सुविधा उपलब्ध है। मंडी का समय सुबह 4:00 बजे से दोपहर 2:00 बजे तक है और इनका संपर्क नंबर 0731-2856402 है।",
        pa: "ਵੈੱਬਸਾਈਟ ਮੁਤਾਬਕ ਰਾਊ ਸਬਜ਼ੀ ਮੰਡੀ ਤੁਹਾਡੇ ਖੇਤ ਤੋਂ 12.2 ਕਿਲੋਮੀਟਰ ਦੂਰ ਹੈ (ਟਰੈਕਟਰ ਨਾਲ 27 ਮਿੰਟ)। ਇੱਥੇ 5,000 ਮੀਟ੍ਰਿਕ ਟਨ ਕੋਲਡ ਸਟੋਰੇਜ ਉਪਲਬਧ ਹੈ। ਮੰਡੀ ਸਵੇਰੇ 4:00 ਤੋਂ ਦੁਪਹਿਰ 2:00 ਵਜੇ ਤੱਕ ਖੁੱਲ੍ਹਦੀ ਹੈ ਅਤੇ ਫ਼ੋਨ ਨੰਬਰ 0731-2856402 ਹੈ।",
        mr: "वेबसाईटवरील माहितीनुसार राऊ भाजीपाला मार्केट आपल्या शेतापासून 12.2 किमी अंतरावर आहे (ट्रॅक्टरने 27 मिनिटे). येथे 5,000 मेट्रिक टन क्षमतेचे कोल्ड स्टोरेज उपलब्ध आहे. वेळ सकाळी 4:00 ते दुपारी 2:00 असून संपर्क क्रमांक 0731-2856402 आहे.",
        gu: "વેબસાઇટ મુજબ રાઉ શાકભાજી મંડી તમારા ખેતરેથી 12.2 કિમી દૂર છે (ટ્રેક્ટર દ્વારા 27 મિનિટ). અહીં 5,000 મેટ્રિક ટન કોલ્ડ સ્ટોરેજ છે. સમય સવારે 4:00 થી બપોરે 2:00 છે અને ફોન નંબર 0731-2856402 છે.",
        te: "వెబ్‌సైట్ వివరాల ప్రకారం రావు మార్కెట్ మీ పొలం నుండి 12.2 కిలోమీటర్ల దూరంలో ఉంది (ట్రాక్టర్‌పై 27 నిమిషాలు). ఇక్కడ 5,000 మెట్రిక్ టన్నుల కోల్డ్ స్టోరేజ్ ఉంది. పనివేళలు ఉదయం 4:00 నుండి మధ్యాహ్నం 2:00 వరకు, ఫోన్ నంబర్ 0731-2856402."
      };
      return rauAnswers[lang] || rauAnswers.hi;
    }

    // Check Dewas Mandi
    if (q.includes("dewas") || q.includes("देवास") || q.includes("ਦੇਵਾਸ") || q.includes("દેવાસ") || q.includes("దేవాస్")) {
      const dewasAnswers = {
        en: "According to the website data, Dewas Model Agro Mandi is situated 32.6 kilometers away, which takes approximately 72 minutes by tractor. It is currently bidding the highest price for Sharbati Wheat and Soybean at 2,880 rupees per quintal, which is 40 rupees higher than Indore. Mandi facilities include a subsidized Kisan Canteen serving 5-rupee meals, an instant e-NAM digital bank payment booth, and a soil testing laboratory. It operates daily from 06:30 AM to 05:00 PM and their contact number is 07272-255910.",
        hi: "वेबसाइट के आंकड़ों के अनुसार देवास मॉडल एग्रो मंडी आपके खेत से 32.6 किलोमीटर दूर है, जहाँ ट्रैक्टर से लगभग 72 मिनट लगते हैं। आज देवास मंडी में गेहूं और सोयाबीन का सबसे ऊंचा भाव 2,880 रुपये प्रति क्विंटल मिल रहा है, जो इंदौर से 40 रुपये अधिक है। इस मंडी में किसानों के लिए 5 रुपये वाली थाली की किसान कैंटीन, ई-नाम तत्काल बैंक भुगतान और मृदा परीक्षण की विशेष सुविधा है। मंडी सुबह 6:30 से शाम 5:00 बजे तक खुली रहती है और इनका फोन नंबर 07272-255910 है।",
        pa: "ਦੇਵਾਸ ਮਾਡਲ ਮੰਡੀ 32.6 ਕਿਲੋਮੀਟਰ ਦੂਰ ਹੈ (ਟਰੈਕਟਰ ਨਾਲ 72 ਮਿੰਟ)। ਇੱਥੇ ਕਣਕ ਦਾ ਸਭ ਤੋਂ ਵੱਧ ਭਾਵ 2,880 ਰੁਪਏ ਮਿਲ ਰਿਹਾ ਹੈ। ਮੰਡੀ ਵਿੱਚ 5 ਰੁਪਏ ਵਾਲੀ ਕਿਸਾਨ ਕੰਟੀਨ ਅਤੇ ਈ-ਨਾਮ ਭੁਗਤਾਨ ਦੀ ਸਹੂਲਤ ਹੈ। ਫ਼ੋਨ ਨੰਬਰ 07272-255910 ਹੈ।",
        mr: "देवास मॉडेल मंडी आपल्या शेतापासून 32.6 किमी अंतरावर आहे (ट्रॅक्टरने 72 मिनिटे). येथे गव्हाला 2,880 रुपये सर्वाधिक दर मिळत आहे. 5 रुपयांत भोजन देणारी किसान कॅन्टीन आणि ई-नाम सुविधा येथे उपलब्ध आहे. संपर्क क्रमांक 07272-255910 आहे.",
        gu: "દેવાસ મોડેલ મંડી 32.6 કિમી દૂર છે (ટ્રેક્ટર દ્વારા 72 મિનિટ). અહીં ઘઉંનો સૌથી ઊંચો ભાવ 2,880 રૂપિયા મળે છે. અહીં 5 રૂપિયા વાળી કિસાન કેન્ટીન અને ઈ-નામ ચુકવણી ઉપલબ્ધ છે. સંપર્ક નંબર 07272-255910 છે.",
        te: "దేవాస్ మార్కెట్ 32.6 కిలోమీటర్ల దూరంలో ఉంది (ట్రాక్టర్‌పై 72 నిమిషాలు). ఇక్కడ గోధుమలకు గరిష్టంగా 2,880 రూపాయల ధర లభిస్తోంది. 5 రూపాయల భోజన క్యాంటీన్ మరియు ఈ-నామ్ చెల్లింపులు అందుబాటులో ఉన్నాయి. ఫోన్ నంబర్ 07272-255910."
      };
      return dewasAnswers[lang] || dewasAnswers.hi;
    }

    // Check Indore Main APMC Mandi
    if (q.includes("indore") || q.includes("इंदौर") || q.includes("ਇੰਦੌਰ") || q.includes("ઇન્દોર") || q.includes("ఇండోర్")) {
      const indoreAnswers = {
        en: "According to the website, APMC Indore Main Krishi Upaj Mandi is your home block yard located at zero kilometers distance from your registered tehsil. It handles daily arrivals of 22,500 quintals. Today Sharbati Wheat is trading at 2,840 rupees and Red Onion at 2,350 rupees. Facilities include automated electronic weighbridges, a soil and moisture testing lab, free overnight stay at Kisan Vishram Bhavan, and on-site bank counters. It is open from 06:00 AM to 04:30 PM, and their office phone number is 0731-2541289.",
        hi: "वेबसाइट के अनुसार एपीएमसी इंदौर मुख्य कृषि उपज मंडी आपकी गृह तहसील में स्थित सबसे नजदीकी मंडी है। यहाँ प्रतिदिन 22,500 क्विंटल कृषि उत्पादों की आवक होती है। आज यहाँ शरबती गेहूं 2,840 रुपये और प्याज 2,350 रुपये प्रति क्विंटल पर बिक रहा है। मंडी में डिजिटल इलेक्ट्रॉनिक तौलकांटा, मिट्टी व नमी जांच लैब, किसान विश्राम भवन में मुफ्त ठहरने की व्यवस्था और बैंक शाखा मौजूद है। मंडी सुबह 6:00 से शाम 4:30 तक खुली रहती है और इनका संपर्क नंबर 0731-2541289 है।",
        pa: "ਇੰਦੌਰ ਮੁੱਖ ਮੰਡੀ ਤੁਹਾਡੇ ਸਭ ਤੋਂ ਨੇੜੇ ਹੈ ਜਿੱਥੇ ਰੋਜ਼ਾਨਾ 22,500 ਕੁਇੰਟਲ ਮਾਲ ਆਉਂਦਾ ਹੈ। ਕਣਕ 2,840 ਰੁਪਏ ਅਤੇ ਪਿਆਜ਼ 2,350 ਰੁਪਏ ਵਿਕ ਰਿਹਾ ਹੈ। ਇੱਥੇ ਕਿਸਾਨ ਵਿਸ਼ਰਾਮ ਭਵਨ ਅਤੇ ਇਲੈਕਟ੍ਰਾਨਿਕ ਕੰਡੇ ਹਨ। ਫ਼ੋਨ ਨੰਬਰ 0731-2541289 ਹੈ।",
        mr: "इंदूर मुख्य एपीएमसी बाजारपेठ आपल्या सर्वात जवळ आहे. येथे दररोज 22,500 क्विंटल मालाची आवक होते. गहू 2,840 रुपये आणि कांदा 2,350 रुपये दराने विकला जात आहे. शेतकरी विश्रामगृह आणि वजनकाटा सुविधा उपलब्ध आहे. संपर्क क्रमांक 0731-2541289 आहे.",
        gu: "ઇન્દોર મુખ્ય એપીએમસી મંડી આપણી સૌથી નજીક છે જ્યાં રોજ 22,500 ક્વિન્ટલની આવક થાય છે. ઘઉં 2,840 રૂપિયા અને ડુંગળી 2,350 રૂપિયા ચાલે છે. અહીં કિસાન વિશ્રામ ભવન અને કોમ્પ્યુટરાઈઝ્ડ કાંટા છે. ફોન નંબર 0731-2541289 છે.",
        te: "ఇండోర్ ప్రధాన మార్కెట్ మీకు అతి సమీపంలో ఉంది. ప్రతిరోజూ 22,500 క్వింటాళ్ల రాక ఉంటుంది. గోధుమలు 2,840 మరియు ఉల్లిపాయలు 2,350 రూపాయలు పలుకుతున్నాయి. రైతు విశ్రాంతి భవనం మరియు డిజిటల్ కాంటాలు ఉన్నాయి. ఫోన్ నంబర్ 0731-2541289."
      };
      return indoreAnswers[lang] || indoreAnswers.hi;
    }

    // Check Sanwer Mandi
    if (q.includes("sanwer") || q.includes("सांवेर") || q.includes("ਸਾਂਵੇਰ") || q.includes("સાંવેર") || q.includes("సాంవేర్")) {
      const sanwerAnswers = {
        en: "According to the website data, Sanwer Sub-Mandi Yard is located 27.2 kilometers away, taking about 60 minutes by tractor. It specializes in grain and vegetable handling with 6,200 quintals daily arrival. Facilities include digital auction display screens, grain moisture meters, and covered direct loading sheds. It operates from 07:00 AM to 03:00 PM and their contact number is 0732-228741.",
        hi: "वेबसाइट के अनुसार सांवेर उप-मंडी यार्ड आपके खेत से 27.2 किलोमीटर दूर है, जहाँ ट्रैक्टर से 60 मिनट का समय लगता है। यह अनाज और सब्जियों की मंडी है जहाँ 6,200 क्विंटल दैनिक आवक होती है। यहाँ डिजिटल नीलामी डिस्प्ले, अनाज नमी मापक और ढके हुए शेड उपलब्ध हैं। मंडी सुबह 7:00 से दोपहर 3:00 बजे तक खुली रहती है और फोन नंबर 0732-228741 है।",
        pa: "ਸਾਂਵੇਰ ਸਬ-ਮੰਡੀ 27.2 ਕਿਲੋਮੀਟਰ ਦੂਰ ਹੈ। ਇੱਥੇ ਰੋਜ਼ਾਨਾ 6,200 ਕੁਇੰਟਲ ਆਵਕ ਹੁੰਦੀ ਹੈ। ਫ਼ੋਨ ਨੰਬਰ 0732-228741 ਹੈ।",
        mr: "सांवेर उपबाजार आपल्यापासून 27.2 किमी अंतरावर आहे. वेळ सकाळी 7:00 ते दुपारी 3:00 असून संपर्क क्रमांक 0732-228741 आहे.",
        gu: "સાંવેર મંડી 27.2 કિમી દૂર છે. અહીં 6,200 ક્વિન્ટલની આવક થાય છે અને ફોન નંબર 0732-228741 છે.",
        te: "సాంవేర్ మార్కెట్ 27.2 కిలోమీటర్ల దూరంలో ఉంది. పనివేళలు ఉదయం 7:00 నుండి మధ్యాహ్నం 3:00 వరకు, ఫోన్ నంబర్ 0732-228741."
      };
      return sanwerAnswers[lang] || sanwerAnswers.hi;
    }

    // Check Ujjain Mandi
    if (q.includes("ujjain") || q.includes("उज्जैन") || q.includes("ਉਜੈਨ") || q.includes("ઉજ્જૈન") || q.includes("ఉజ్జయిని")) {
      const ujjainAnswers = {
        en: "According to the website, Ujjain Chimanganj APMC Mandi is located 50.1 kilometers away, which takes approximately 110 minutes by tractor. It is a super-regional grain and pulses market with 18,900 quintals daily volume. Facilities include automated grain sorters, a farmer guest house, and 10 electronic weighbridges. It is open from 06:00 AM to 06:00 PM and their office number is 0734-2521102.",
        hi: "वेबसाइट के अनुसार उज्जैन चिमनगंज मंडी आपके खेत से 50.1 किलोमीटर की दूरी पर है, जहाँ ट्रैक्टर द्वारा लगभग 110 मिनट लगते हैं। यह मालवा का बहुत बड़ा अनाज और दलहन केंद्र है जहाँ 18,900 क्विंटल की दैनिक आवक होती है। यहाँ स्वचालित अनाज छंटाई मशीन, किसान गेस्ट हाउस और 10 इलेक्ट्रॉनिक धर्मकांटे हैं। मंडी सुबह 6:00 से शाम 6:00 बजे तक खुलती है और इनका फोन नंबर 0734-2521102 है।",
        pa: "ਉਜੈਨ ਚਿਮਨਗੰਜ ਮੰਡੀ 50.1 ਕਿਲੋਮੀਟਰ ਦੂਰ ਹੈ। ਇੱਥੇ 18,900 ਕੁਇੰਟਲ ਰੋਜ਼ਾਨਾ ਮਾਲ ਆਉਂਦਾ ਹੈ ਅਤੇ ਫ਼ੋਨ ਨੰਬਰ 0734-2521102 ਹੈ।",
        mr: "उज्जैन चिमनगंज बाजार 50.1 किमी अंतरावर आहे. येथे 10 इलेक्ट्रॉनिक वजनकाटे आणि शेतकरी निवास व्यवस्था आहे. संपर्क 0734-2521102 आहे.",
        gu: "ઉજ્જૈન ચિમનગંજ મંડી 50.1 કિમી દૂર છે. અહીં રોજ 18,900 ક્વિન્ટલ આવક થાય છે અને ફોન નંબર 0734-2521102 છે.",
        te: "ఉజ్జయిని చిమన్ గంజ్ మార్కెట్ 50.1 కిలోమీటర్ల దూరంలో ఉంది. ఇక్కడ 10 డిజిటల్ వేయింగ్ బ్రిడ్జిలు ఉన్నాయి. ఫోన్ నంబర్ 0734-2521102."
      };
      return ujjainAnswers[lang] || ujjainAnswers.hi;
    }

    // Check Mhow Mandi
    if (q.includes("mhow") || q.includes("महू") || q.includes("ਮਹੂ") || q.includes("મહૂ") || q.includes("మహౌ")) {
      const mhowAnswers = {
        en: "According to the website, Mhow Cantonment Agricultural Sub-Yard is located 22.8 kilometers away, which is about 50 minutes by tractor. It provides fast express weighbridges and direct merchant purchasing bays with 4,100 quintals daily arrival. It operates from 07:00 AM to 02:00 PM and their phone number is 07324-273180.",
        hi: "वेबसाइट के अनुसार महू छावनी कृषि उप-मंडी आपके खेत से 22.8 किलोमीटर दूर है, जहाँ ट्रैक्टर से 50 मिनट लगते हैं। यहाँ 4,100 क्विंटल की दैनिक आवक होती है और सीधे व्यापारी खरीद शेड उपलब्ध हैं। मंडी सुबह 7:00 से दोपहर 2:00 बजे तक खुली रहती है और फोन नंबर 07324-273180 है।",
        pa: "ਮਹੂ ਮੰਡੀ 22.8 ਕਿਲੋਮੀਟਰ ਦੂਰ ਹੈ ਅਤੇ ਫ਼ੋਨ ਨੰਬਰ 07324-273180 ਹੈ।",
        mr: "महू बाजार 22.8 किमी अंतरावर असून संपर्क क्रमांक 07324-273180 आहे.",
        gu: "મહૂ મંડી 22.8 કિમી દૂર છે અને ફોન નંબર 07324-273180 છે.",
        te: "మహౌ మార్కెట్ 22.8 కిలోమీటర్ల దూరంలో ఉంది, ఫోన్ నంబర్ 07324-273180."
      };
      return mhowAnswers[lang] || mhowAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 3. WEBSITE INFORMATION: SPECIFIC MERCHANTS & BUYERS
    // ------------------------------------------------------------------------
    // Check Rajesh Agrawal
    if (q.includes("rajesh") || q.includes("agrawal") || q.includes("shree ganesh") || q.includes("राजेश") || q.includes("अग्रवाल")) {
      const rajeshAnswers = {
        en: "On the website, verified merchant Rajesh Agrawal operates Shree Ganesh Agro Commodities Limited with an outstanding 4.9-star rating. He specializes in Sharbati Wheat, Durum Wheat, and Pulses, offering 2,860 rupees per quintal with free truck pickup at farm gates for lots over thirty quintals. His direct mobile contact number is +91 98260 44120.",
        hi: "वेबसाइट पर दर्ज जानकारी के अनुसार सत्यापित व्यापारी राजेश अग्रवाल 'श्री गणेश एग्रो कमोडिटीज लिमिटेड' के संचालक हैं और उनकी रेटिंग 4.9 स्टार है। वे शरबती गेहूं और दालों की बड़ी खरीद कर रहे हैं और 2,860 रुपये प्रति क्विंटल के भाव पर 30 क्विंटल से अधिक माल पर खेत से सीधे मुफ्त ट्रक भेज रहे हैं। उनका सीधा मोबाइल नंबर +91 98260 44120 है।",
        pa: "ਵੈੱਬਸਾਈਟ ਮੁਤਾਬਕ ਰਾਜੇਸ਼ ਅਗਰਵਾਲ (ਸ਼੍ਰੀ ਗਣੇਸ਼ ਐਗਰੋ) ਕਣਕ 2,860 ਰੁਪਏ ਵਿੱਚ ਖਰੀਦ ਰਹੇ ਹਨ ਅਤੇ ਖੇਤ ਵਿੱਚੋਂ ਮੁਫ਼ਤ ਟਰੱਕ ਭੇਜਦੇ ਹਨ। ਉਹਨਾਂ ਦਾ ਫ਼ੋਨ ਨੰਬਰ +91 98260 44120 ਹੈ।",
        mr: "राजेश अग्रवाल (श्री गणेश ॲग्रो) गव्हाची 2,860 रुपये दराने खरेदी करत असून शेतातून मोफत गाडी पाठवत आहेत. संपर्क +91 98260 44120 आहे.",
        gu: "રાજેશ અગ્રવાલ (શ્રી ગણેશ એગ્રો) ઘઉં માટે 2,860 રૂપિયા આપીને મફત ટ્રક મોકલે છે. તેમનો નંબર +91 98260 44120 છે.",
        te: "రాజేష్ అగర్వాల్ (శ్రీ గణేష్ ఆగ్రో) గోధుమలను క్వింటాకి 2,860 రూపాయలకు కొనుగోలు చేస్తూ ఉచిత వాహనం పంపుతున్నారు. ఫోన్ నంబర్ +91 98260 44120."
      };
      return rajeshAnswers[lang] || rajeshAnswers.hi;
    }

    // Check Kavita Reddy
    if (q.includes("kavita") || q.includes("reddy") || q.includes("deccan") || q.includes("कविता") || q.includes("रेड्डी")) {
      const kavitaAnswers = {
        en: "On the website, verified buyer Kavita Reddy manages Deccan Fresh Produce Supply Chain with a 4.9-star rating. She specializes in perishable vegetables, especially Garlic at 14,400 rupees, Red Onions, Tomatoes, and Potatoes, with immediate doorstep UPI cash settlement. Her direct contact number is +91 94250 88210.",
        hi: "वेबसाइट के अनुसार सत्यापित खरीदार कविता रेड्डी 'डेक्कन फ्रेश प्रोड्यूस सप्लाई चेन' की प्रमुख हैं और उनकी 4.9 स्टार रेटिंग है। वे लहसुन (₹14,400 प्रति क्विंटल), प्याज, टमाटर और आलू जैसी सब्जियों की सीधी खरीद करती हैं और किसान के खेत पर ही तुरंत यूपीआई या नकद भुगतान करती हैं। उनका संपर्क नंबर +91 94250 88210 है।",
        pa: "ਕਵਿਤਾ ਰੈੱਡੀ ਸਬਜ਼ੀਆਂ ਅਤੇ ਲਸਣ ਦੀ ਖਰੀਦ ਕਰਦੇ ਹਨ ਅਤੇ ਮੌਕੇ 'ਤੇ ਨਕਦ ਭੁਗਤਾਨ ਦਿੰਦੇ ਹਨ। ਉਹਨਾਂ ਦਾ ਨੰਬਰ +91 94250 88210 ਹੈ।",
        mr: "कविता रेड्डी भाजीपाला व लसूण खरेदीदार असून जागेवर रोख पैसे देतात. संपर्क क्रमांक +91 94250 88210 आहे.",
        gu: "કવિતા રેડ્ડી શાકભાજી અને લસણના મોટા ખરીદદાર છે અને રોકડા ચૂકવે છે. ફોન નંબર +91 94250 88210 છે.",
        te: "కవిత రెడ్డి కూరగాయలు మరియు వెల్లుల్లి కొనుగోలు చేస్తూ తక్షణ నగదు చెల్లిస్తారు. ఫోన్ నంబర్ +91 94250 88210."
      };
      return kavitaAnswers[lang] || kavitaAnswers.hi;
    }

    // Check Suresh Patel
    if (q.includes("suresh") || q.includes("narmada") || q.includes("सुरेश") || q.includes("पटेल")) {
      const sureshAnswers = {
        en: "According to the website, verified merchant Suresh Patel runs Narmada Valley Bio-Oil Mills with a 4.7-star rating. He purchases Yellow Soybean at 4,890 rupees and Black Mustard at 5,650 rupees per quintal, offering direct electronic weighing at the farm. His contact number is +91 97550 33140.",
        hi: "वेबसाइट के अनुसार सत्यापित व्यापारी सुरेश पटेल 'नर्मदा वैली बायो-ऑयल मिल्स' के संचालक हैं (4.7 स्टार रेटिंग)। वे पीली सोयाबीन 4,890 रुपये और सरसों 5,650 रुपये प्रति क्विंटल पर सीधे इलेक्ट्रॉनिक धर्मकांटा लगाकर खरीद रहे हैं। उनका फोन नंबर +91 97550 33140 है।",
        pa: "ਸੁਰੇਸ਼ ਪਟੇਲ ਸੋਇਆਬੀਨ ਅਤੇ ਸਰ੍ਹੋਂ ਦੀ ਖਰੀਦ ਕਰਦੇ ਹਨ। ਫ਼ੋਨ ਨੰਬਰ +91 97550 33140 ਹੈ।",
        mr: "सुरेश पटेल सोयाबीन आणि मोहरी खरेदी करतात. संपर्क +91 97550 33140 आहे.",
        gu: "સુરેશ પટેલ સોયાબીન અને રાઈના ખરીદદાર છે. ફોન નંબર +91 97550 33140 છે.",
        te: "సురేష్ పటేల్ సోయాబీన్ మరియు ఆవాలు కొనుగోలు చేస్తారు. ఫోన్ నంబర్ +91 97550 33140."
      };
      return sureshAnswers[lang] || sureshAnswers.hi;
    }

    // Check Gurpreet Singh Sandhu
    if (q.includes("gurpreet") || q.includes("sandhu") || q.includes("punjab heritage") || q.includes("गुरप्रीत") || q.includes("ਸੰਧੂ")) {
      const sandhuAnswers = {
        en: "On the website, verified buyer Gurpreet Singh Sandhu leads Punjab Heritage Grain Exporters with a 4.8-star rating. He specializes in Basmati 1121 Paddy at 4,320 rupees and Export Grade Wheat at 2,870 rupees per quintal, offering full digital RTGS bank transfers. His contact number is +91 98140 77330.",
        hi: "वेबसाइट के अनुसार गुरप्रीत सिंह संधू 'पंजाब हेरिटेज ग्रेन एक्सपोर्टर्स' के प्रमुख हैं (4.8 स्टार रेटिंग)। वे बासमती 1121 धान 4,320 रुपये और प्रीमियम शरबती गेहूं 2,870 रुपये प्रति क्विंटल के भाव पर खरीद रहे हैं और सीधा आरटीजीएस बैंक ट्रांसफर करते हैं। उनका मोबाइल नंबर +91 98140 77330 है।",
        pa: "ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ ਸੰਧੂ ਬਾਸਮਤੀ ਝੋਨਾ 4,320 ਰੁਪਏ ਅਤੇ ਕਣਕ 2,870 ਰੁਪਏ ਵਿੱਚ ਖਰੀਦ ਰਹੇ ਹਨ। ਫ਼ੋਨ ਨੰਬਰ +91 98140 77330 ਹੈ।",
        mr: "गुरप्रीत सिंग संधू बासमती तांदूळ आणि गव्हाचे मोठे निर्यातदार आहेत. संपर्क +91 98140 77330 आहे.",
        gu: "ગુરપ્રીત સિંહ સંધૂ બાસમતી ડાંગર 4,320 રૂપિયામાં ખરીદે છે. ફોન નંબર +91 98140 77330 છે.",
        te: "గురుప్రీత్ సింగ్ సంధు బాస్మతి వరిని క్వింటాకి 4,320 రూపాయలకు కొనుగోలు చేస్తున్నారు. ఫోన్ నంబర్ +91 98140 77330."
      };
      return sandhuAnswers[lang] || sandhuAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 4. WEBSITE INFORMATION: DIESEL ARBITRAGE & TROLLEY TRANSPORT PROFIT
    // ------------------------------------------------------------------------
    const arbitrageKeywords = [
      "diesel", "arbitrage", "transport cost", "tractor time", "fuel", "trolley", "net profit", 
      "travel profit", "how much profit", "transport calculation", "diesel expense",
      "डीजल", "मुनाफा", "भाड़ा", "ट्रॉली", "खर्च", "बचत", "फायदा", "ਟਰੈਕਟਰ", "ਡੀਜ਼ਲ", "ભાડું", "લાભ", "ఖర్చు", "లాభం"
    ];
    if (arbitrageKeywords.some(kw => q.includes(kw))) {
      const arbAnswers = {
        en: "According to the live economic arbitrage calculator on the website, driving your tractor to Dewas Model Mandi involves a 33-kilometer round-trip distance difference compared to your closest Indore yard. At 18 rupees per kilometer for tractor fuel, your total diesel expense comes to 1,188 rupees. On a standard forty-quintal trolley load, selling at Dewas's higher rate earns you 1,600 rupees gross, leaving you with 412 rupees in pure net profit in your pocket. If you have fifty quintals or more, taking your harvest to Dewas is clearly more profitable today.",
        hi: "वेबसाइट पर दिए गए लाइव आर्थिक विश्लेषण कैलकुलेटर के अनुसार यदि आप नजदीकी इंदौर मंडी के बजाय देवास मॉडल मंडी जाते हैं, तो आने-जाने में कुल 33 किलोमीटर का अतिरिक्त चक्कर लगता है। ट्रैक्टर के लिए 18 रुपये प्रति किलोमीटर की दर से कुल 1,188 रुपये का डीजल खर्च आएगा। लेकिन चालीस क्विंटल की मानक ट्रॉली पर 40 रुपये प्रति क्विंटल अधिक मिलने से आपको 1,600 रुपये का सकल लाभ होगा। अतः 1,188 रुपये का डीजल काटकर भी आपको सीधे 412 रुपये का शुद्ध मुनाफा बचेगा। यदि आपके पास 50 क्विंटल या अधिक फसल है, तो देवास जाना बहुत अधिक मुनाफे का सौदा है।",
        pa: "ਵੈੱਬਸਾਈਟ ਦੇ ਕੈਲਕੁਲੇਟਰ ਮੁਤਾਬਕ ਦੇਵਾਸ ਮੰਡੀ ਜਾਣ 'ਤੇ 1,188 ਰੁਪਏ ਦਾ ਡੀਜ਼ਲ ਖਰਚ ਆਵੇਗਾ। ਪਰ 40 ਕੁਇੰਟਲ ਦੀ ਟਰਾਲੀ 'ਤੇ 1,600 ਰੁਪਏ ਵੱਧ ਮਿਲਣਗੇ, ਜਿਸ ਨਾਲ ਖਰਚ ਕੱਢ ਕੇ ਵੀ 412 ਰੁਪਏ ਦਾ ਸ਼ੁੱਧ ਮੁਨਾਫ਼ਾ ਬਚਦਾ ਹੈ।",
        mr: "वेबसाईटवरील गणितानुसार देवासला जाण्यासाठी 1,188 रुपये डिझेल खर्च येईल. पण 40 क्विंटल ट्रॉलीवर 1,600 रुपये जास्त मिळतील, म्हणजेच डिझेल वजा जाता 412 रुपयांचा निव्वळ नफा हातात उरेल.",
        gu: "વેબસાઇટના કેલ્ક્યુલેટર મુજબ દેવાસ જવા પર 1,188 રૂપિયાનો ડીઝલ ખર્ચ થશે. પરંતુ 40 ક્વિન્ટલ પર 1,600 રૂપિયા વધુ મળવાથી 412 રૂપિયાનો ચોખ્ખો વધારાનો નફો મળશે.",
        te: "వెబ్‌సైట్ లెక్కల ప్రకారం దేవాస్ మార్కెట్‌కు వెళ్తే 1,188 రూపాయల డీజిల్ ఖర్చు అవుతుంది. కానీ 40 క్వింటాళ్లకు 1,600 రూపాయలు అదనంగా వచ్చి, ఖర్చు పోను 412 రూపాయల నికర లాభం మిగులుతుంది."
      };
      return arbAnswers[lang] || arbAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 5. WEBSITE INFORMATION: WEATHER, TEMPERATURE & SPRAY CLIMATE CARD
    // ------------------------------------------------------------------------
    const weatherKeywords = [
      "weather", "climate", "temperature", "rain", "humidity", "wind", "barish", "mausam", 
      "hawa", "spray weather", "field conditions", "forecast", "cloud",
      "मौसम", "तापमान", "बारिश", "हवा", "नमी", "छिड़काव मौसम", "ਧੁੱਪ", "ਮੌਸਮ", "ਹਵਾਮਾਨ", "વરસાદ", "వాతావరణం"
    ];
    if (weatherKeywords.some(kw => q.includes(kw))) {
      const weatherAnswers = {
        en: "According to the live weather monitor displayed on the website for Indore Malwa, the daytime temperature is currently 27 degrees Celsius under clear, sunny skies. The relative air humidity is 64 percent with a gentle breeze blowing northwest at eight kilometers per hour. The rain risk is extremely low at just 10 percent. Today is considered completely safe for irrigation, tractor tillage, and foliar crop spraying before ten in the morning.",
        hi: "वेबसाइट पर प्रदर्शित लाइव मौसम कार्ड के अनुसार इंदौर मालवा क्षेत्र में दिन का तापमान 27 डिग्री सेल्सियस है और आसमान पूरी तरह साफ और धूपदार है। हवा में नमी 64 प्रतिशत है और उत्तर-पश्चिम से 8 किलोमीटर प्रति घंटा की शांत हवा चल रही है। बारिश की संभावना मात्र 10 प्रतिशत है। आज का मौसम खेत में सिंचाई, जुताई और सुबह 10 बजे से पहले कीटनाशक छिड़काव के लिए पूरी तरह अनुकूल और सुरक्षित है।",
        pa: "ਵੈੱਬਸਾਈਟ ਦੇ ਮੌਸਮ ਕਾਰਡ ਮੁਤਾਬਕ ਤਾਪਮਾਨ 27 ਡਿਗਰੀ ਹੈ, ਅਸਮਾਨ ਸਾਫ਼ ਹੈ ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਸਿਰਫ਼ 10 ਪ੍ਰਤੀਸ਼ਤ ਹੈ। ਅੱਜ ਖੇਤ ਵਿੱਚ ਦਵਾਈ ਛਿੜਕਣ ਅਤੇ ਪਾਣੀ ਲਗਾਉਣ ਲਈ ਦਿਨ ਬਹੁਤ ਵਧੀਆ ਹੈ।",
        mr: "वेबसाईटवरील हवामान कार्डनुसार तापमान 27 अंश सेल्सिअस असून आकाश निरभ्र आहे. पावसाची शक्यता केवळ 10 टक्के असल्याने फवारणी आणि शेतीकामांसाठी दिवस उत्तम आहे.",
        gu: "વેબસાઇટના હવામાન કાર્ડ મુજબ તાપમાન 27 ડિગ્રી છે, સારો તડકો છે અને વરસાદની શક્યતા માત્ર 10 ટકા છે. દવા છાંટવા માટે આજનો દિવસ ઉત્તમ છે.",
        te: "వెబ్‌సైట్ వాతావరణ కార్డు ప్రకారం ఉష్ణోగ్రత 27 డిగ్రీలు, ఆకాశం నిర్మలంగా ఉంది మరియు వర్షం పడే అవకాశం కేవలం 10 శాతం మాత్రమే. స్ప్రే చేయడానికి ఇది అనుకూలమైన సమయం."
      };
      return weatherAnswers[lang] || weatherAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 6. WEBSITE INFORMATION: ALL VEGETABLES & CROPS LISTED ON THE SITE
    // ------------------------------------------------------------------------
    const listCropsKeywords = [
      "what vegetables", "list of crops", "all crops", "what produce", "vegetables on site", 
      "show vegetables", "crops on website", "vegetable list", "what is available",
      "कौन सी सब्जियां", "फसलों की सूची", "वेबसाइट पर क्या है", "सभी फसलें", "ਸਬਜ਼ੀਆਂ ਦੀ ਸੂਚੀ", "શાકભાજી", "కూరగాయల జాబితా"
    ];
    if (listCropsKeywords.some(kw => q.includes(kw))) {
      const listAnswers = {
        en: "On this website, we display live Mandi rates and buyer connections for twenty-six agricultural commodities across five categories. In fresh vegetables, we track Potato, Red Onion, Hybrid Tomato, Bold Garlic, Fresh Ginger, Green Peas, Green Chilli, Cauliflower, Cabbage, Ladyfinger, Brinjal, Red Carrot, Green Capsicum, Coriander, and Bottle Gourd. In cereals, we track Sharbati Wheat and Basmati 1121 Paddy. In oilseeds and pulses, we track Yellow Soybean, Black Mustard, Desi Chana, and Cotton. You can speak any of these names to hear today's exact wholesale price!",
        hi: "इस वेबसाइट पर हम 5 श्रेणियों में कुल 26 फसलों के लाइव मंडी भाव और व्यापारी उपलब्ध कराते हैं। हरी सब्जियों में ज्योति आलू, लाल नासिक प्याज, हाइब्रिड टमाटर, देसी लहसुन, ताजा अदरक, हरी मटर, हरी मिर्च, फूलगोभी, पत्तागोभी, भिंडी, गोल बैंगन, लाल गाजर, शिमला मिर्च, हरा धनिया और लौकी शामिल हैं। अनाजों में शरबती गेहूं और 1121 बासमती धान हैं। इसके अलावा पीली सोयाबीन, काली सरसों, देसी चना और सफेद कपास के ताजा भाव भी उपलब्ध हैं। आप इनमें से किसी भी फसल का नाम लेकर उसका ताजा भाव जान सकते हैं!",
        pa: "ਇਸ ਵੈੱਬਸਾਈਟ 'ਤੇ 26 ਫ਼ਸਲਾਂ ਦੇ ਲਾਈਵ ਭਾਵ ਹਨ: ਆਲੂ, ਪਿਆਜ਼, ਟਮਾਟਰ, ਲਸਣ, ਅਦਰਕ, ਮਟਰ, ਮਿਰਚ, ਗੋਭੀ, ਭਿੰਡੀ, ਬੈਂਗਣ, ਗਾਜਰ, ਕਣਕ, ਝੋਨਾ, ਸੋਇਆਬੀਨ ਅਤੇ ਸਰ੍ਹੋਂ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਫ਼ਸਲ ਦਾ ਨਾਮ ਬੋਲ ਕੇ ਭਾਵ ਪੁੱਛ ਸਕਦੇ ਹੋ!",
        mr: "या वेबसाईटवर बटाटा, कांदा, टोमॅटो, लसूण, आले, मटार, मिरची, फ्लॉवर, कोबी, भेंडी, वांगी, गाजर, गहू, तांदूळ, सोयाबीन आणि हरभरा अशा 26 पिकांचे थेट बाजारभाव उपलब्ध आहेत. आपण कोणत्याही पिकाचे नाव सांगू शकता!",
        gu: "આ વેબસાઇટ પર બટાટા, ડુંગળી, ટામેટા, લસણ, આદુ, વટાણા, મરચાં, કોબી, ભીંડા, રીંગણ, ગાજર, ઘઉં, ડાંગર, સોયાબીન અને ચણા સહિત 26 પાકોના લાઈવ ભાવ ઉપલબ્ધ છે. આપ કોઈપણ પાકનું નામ બોલી શકો છો!",
        te: "ఈ వెబ్‌సైట్లో బంగాళాదుంప, ఉల్లిపాయ, టమోటా, వెల్లుల్లి, అల్లం, బఠానీ, పచ్చిమిర్చి, క్యాలీఫ్లవర్, క్యాబేజీ, బెండకాయ, వంకాయ, క్యారెట్, గోధుమలు, వరి, సోయాబీన్ వంటి 26 పంటల లైవ్ ధరలు ఉన్నాయి."
      };
      return listAnswers[lang] || listAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 7. SPECIFIC COMMODITY LIVE PRICE LOOKUP (ALL 26 CROPS)
    // ------------------------------------------------------------------------
    for (const crop of CROP_DICTIONARY) {
      const isMatch = crop.aliases.some(alias => matchCropAlias(q, alias));

      if (isMatch) {
        const comm = (state.commodities || []).find(c => c.id === crop.id) || 
                     (typeof window !== "undefined" && window.AgriData && window.AgriData.commodities.find(c => c.id === crop.id));
        const price = comm ? comm.currentPrice.toLocaleString("en-IN") : "2,400";
        const mspNum = comm && comm.msp ? comm.msp.toLocaleString("en-IN") : null;
        const mandi = comm && comm.mandi ? comm.mandi : "इंदौर मुख्य मंडी";
        const cropName = crop.names[lang] || crop.names.hi || crop.names.en;

        const trendExplanationEn = comm && comm.changePercent > 0 
          ? `Wholesale auctions show a positive increase of ${comm.changePercent} percent compared to yesterday's closing rates.`
          : comm && comm.changePercent < 0 
          ? `Because of higher morning market arrivals today, prices show a slight seasonal dip of ${Math.abs(comm.changePercent)} percent.`
          : `Market rates are holding completely steady and strong compared to yesterday.`;

        const mspExplanationEn = mspNum
          ? `The official government minimum support price benchmark for this crop is set at ${mspNum} rupees per quintal.`
          : `This commodity is currently traded on open competitive auction rates.`;

        const trendExplanationHi = comm && comm.changePercent > 0
          ? `कल के मुकाबले आज इसमें लगभग ${comm.changePercent} प्रतिशत की अच्छी तेजी देखी गई है।`
          : comm && comm.changePercent < 0
          ? `सुबह की अधिक आवक होने के कारण आज भाव में लगभग ${Math.abs(comm.changePercent)} प्रतिशत की हल्की नरमी है।`
          : `आज बाजार में भाव पूरी तरह स्थिर और मजबूत बने हुए हैं।`;

        const mspExplanationHi = mspNum
          ? `सरकार द्वारा निर्धारित न्यूनतम समर्थन मूल्य ${mspNum} रुपये प्रति क्विंटल है।`
          : `यह फसल खुले बाजार की मजबूत मांग के आधार पर अच्छे मुनाफे पर बिक रही है।`;

        const cropAnswers = {
          en: `Namaste Kisan Bhai! I have pulled up today's live wholesale market prices for your harvest. In ${mandi}, ${cropName} is actively trading at ${price} rupees per quintal. ${trendExplanationEn} ${mspExplanationEn} In addition, our verified merchants have dispatched transport vehicles with free farm-gate pickup for ready produce. If your harvest is ready, I can immediately connect you with a verified licensed buyer or book a transport truck. How many quintals or crates are you planning to trade today?`,
          hi: `नमस्ते किसान भाई! मैंने आपके लिए आज के ताजा मंडी भाव और बाजार की पूरी जानकारी निकाल ली है। आज ${mandi} में ${cropName} का भाव ${price} रुपये प्रति क्विंटल चल रहा है। ${trendExplanationHi} ${mspExplanationHi} इसके साथ ही हमारे सत्यापित व्यापारियों ने आज किसानों के लिए खेत से सीधे मुफ्त गाड़ी भेजकर नकद भुगतान की व्यवस्था शुरू कर रखी है। यदि आपकी फसल तैयार है, तो क्या मैं आपके लिए सीधे व्यापारी से बात करवाऊँ या खेत से पिकअप गाड़ी बुक करूँ? आप कितनी मात्रा में फसल बेचना चाहते हैं?`,
          pa: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ ਜੀ! ਮੈਂ ਤੁਹਾਡੇ ਲਈ ਅੱਜ ਦੇ ਲਾਈਵ ਮੰਡੀ ਭਾਵ ਅਤੇ ਬਾਜ਼ਾਰ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ ਕੱਢ ਲਈ ਹੈ। ਅੱਜ ${mandi} ਵਿੱਚ ${cropName} ਦਾ ਲਾਈਵ ਰੇਟ ${price} ਰੁਪਏ ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਚੱਲ ਰਿਹਾ ਹੈ। ਇਸਦੇ ਨਾਲ ਹੀ ਪ੍ਰਮਾਣਿਤ ਵਪਾਰੀ ਖੇਤ ਵਿੱਚੋਂ ਸਿੱਧੀ ਮੁਫ਼ਤ ਗੱਡੀ ਭੇਜ ਕੇ ਮਾਲ ਖਰੀਦ ਰਹੇ ਹਨ। ਜੇ ਤੁਹਾਡੀ ਫ਼ਸਲ ਤਿਆਰ ਹੈ, ਤਾਂ ਕੀ ਤੁਹਾਡੇ ਲਈ ਵਪਾਰੀ ਨਾਲ ਗੱਲ ਕਰਵਾਈਏ ਜਾਂ ਟਰੱਕ ਬੁੱਕ ਕਰੀਏ? ਤੁਸੀਂ ਕਿੰਨੇ ਕੁਇੰਟਲ ਵੇਚਣਾ ਚਾਹੁੰਦੇ ਹੋ?`,
          mr: `नमस्कार शेतकरी बंधू! मी आपल्यासाठी आजचे थेट बाजारभाव आणि आवकेची संपूर्ण माहिती काढली आहे. आज ${mandi} मध्ये ${cropName} चे भाव ${price} रुपये प्रति क्विंटल सुरू आहेत. याशिवाय अधिकृत व्यापारी आज थेट शेतातून मोफत गाडी पाठवून जागेवर रोख पैसे देत आहेत. आपले पीक विक्रीसाठी तयार असल्यास, मी थेट व्यापाऱ्याशी संपर्क जोडू का? आपण किती क्विंटल विक्री करू इच्छिता?`,
          gu: `નમસ્તે ખેડૂત મિત્ર! મેં આપના માટે આજના તાજા મંડી ભાવ અને બજારની સંપૂર્ણ વિગતો મેળવી લીધી છે. આજે ${mandi}માં ${cropName}નો ભાવ ${price} રૂપિયા પ્રતિ ક્વિન્ટલ ચાલે છે. આ ઉપરાંત અધિકૃત વેપારીઓ આજે સીધા ખેતરેથી મફત વાહન મોકલીને રોકડ ચૂકવણી આપી રહ્યા છે. જો તમારો પાક તૈયાર હોય, તો શું હું વેપારી સાથે વાત કરાવું? તમારે કેટલા ક્વિન્ટલ વેચવું છે?`,
          te: `నమస్కారం రైతు సోదరా! నేను మీ కోసం నేటి లైవ్ మార్కెట్ ధరలు మరియు రాకల పూర్తి వివరాలు సేకరించాను. నేడు ${mandi}లో ${cropName} ధర ${price} రూపాయలు ప్రతి క్వింటాకి పలుకుతోంది. అంతేకాకుండా ధృవీకరించబడిన వ్యాపారులు తోట వద్దకే ఉచిత వాహనాన్ని పంపి తక్షణ నగదు చెల్లింపులు చేస్తున్నారు. మీ పంట కోతకు సిద్ధంగా ఉంటే, నేను వ్యాపారితో మాట్లాడించమంటారా? మీరు ఎన్ని క్వింటాళ్ళు విక్రయించాలనుకుంటున్నారు?`
        };

        return cropAnswers[lang] || cropAnswers.hi;
      }
    }

    // ------------------------------------------------------------------------
    // 8. CROP DISEASE, PEST & SPRAY REMEDIES
    // ------------------------------------------------------------------------
    const diseaseKeywords = ["disease", "pest", "leaf", "leaves", "yellow", "spray", "keeda", "fungus", "davai", "medicine", "spots", "पत्तियां", "पीली", "कीट", "दवाई", "कीटनाशक", "रोग", "इल्ली", "छिड़काव", "ਬਿਮਾਰੀ", "ਦਵਾਈ", "ਛਿੜਕਾਅ", "રોગ", "દવા", "తెగులు", "మందు"];
    if (diseaseKeywords.some(kw => q.includes(kw))) {
      const diseaseAnswers = {
        en: "Namaste Kisan Bhai, I understand your concern regarding plant health and leaf damage. If you are noticing yellowing patches or brown spots on your crop leaves, this is typically an early symptom of fungal leaf blight caused by excessive morning dew. To control this immediately, dissolve 2.5 grams of Mancozeb 75 percent wettable powder in one liter of clean water and spray evenly across the canopy. If you observe tiny sucking aphids, thrips, or leaf curl, spray Imidacloprid 17.8 percent SL at a dosage of half a milliliter per liter of water. It is essential to perform all foliar sprays before ten in the morning when the wind is calm, allowing the solution to dry properly. Would you like me to locate a nearby agro-chemical center?",
        hi: "नमस्ते किसान भाई, फसल के स्वास्थ्य और पत्तियों के नुकसान को लेकर आपकी चिंता को मैं समझता हूँ। यदि पत्तियों पर पीले धब्बे या भूरे चकत्ते दिखाई दे रहे हैं, तो यह सुबह की ओस और नमी के कारण होने वाला फफूंद जनित झुलसा रोग है। इसके तुरंत नियंत्रण के लिए 2.5 ग्राम मैन्कोजेब 75 प्रतिशत डब्ल्यूपी को एक लीटर साफ पानी में घोलकर समान रूप से छिड़काव करें। यदि पत्तियों में रस चूसक कीट, थ्रिप्स या माहू की समस्या है, तो आधा मिलीलीटर इमिडाक्लोप्रिड 17.8 प्रतिशत एसएल प्रति लीटर पानी में मिलाकर छिड़कें। ध्यान रखें कि सभी छिड़काव सुबह 10 बजे से पहले शांत हवा में करें ताकि दवा अच्छे से असर करे। क्या आप नजदीकी प्रमाणित कृषि सेवा केंद्र की जानकारी चाहते हैं?",
        pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ ਜੀ। ਪੱਤਿਆਂ 'ਤੇ ਪੀਲੇ ਜਾਂ ਭੂਰੇ ਧੱਬਿਆਂ ਲਈ 2.5 ਗ੍ਰਾਮ ਮੈਨਕੋਜ਼ੇਬ 75 ਪ੍ਰਤੀਸ਼ਤ ਪ੍ਰਤੀ ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕਾਅ ਕਰੋ। ਰਸ ਚੂਸਣ ਵਾਲੇ ਕੀੜਿਆਂ ਲਈ ਅੱਧਾ ਮਿਲੀਲੀਟਰ ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ ਦੀ ਵਰਤੋਂ ਕਰੋ। ਸਵੇਰੇ 10 ਵਜੇ ਤੋਂ ਪਹਿਲਾਂ ਸ਼ਾਂਤ ਹਵਾ ਵਿੱਚ ਛਿੜਕਾਅ ਕਰਨਾ ਸਭ ਤੋਂ ਉੱਤਮ ਹੈ। ਕੀ ਤੁਹਾਨੂੰ ਦਵਾਈ ਦੀ ਦੁਕਾਨ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ?",
        mr: "नमस्कार शेतकरी बंधू। पानावरील पिवळ्या डागांसाठी किंवा करपा रोगासाठी 2.5 ग्रॅम मॅनकोझेब प्रति लिटर पाण्यात मिसळून संपूर्ण पिकावर फवारावे. कीड नियंत्रणासाठी अर्धा मिली इमिडाक्लोप्रिड वापरावे. सकाळी 10 पूर्वी शांत हवेत फवारणी करावी जेणेकरून औषध योग्य प्रकारे काम करेल. मी जवळच्या कृषी केंद्राची माहिती देऊ का?",
        gu: "નમસ્તે ખેડૂત મિત્ર। પાન પર પીળા કે કથ્થઈ ડાઘ માટે 2.5 ગ્રામ મેન્કોઝેબ 75 ટકા પ્રતિ લીટર પાણીમાં મેળવી છંટકાવ કરો. ચુસિયા જીવાતો માટે અડધો મિલી ઇમિડાક્લોપ્રિડ વાપરો. સવારે 10 વાગ્યા પહેલાં શાંત પવનમાં છંટકાવ કરવો ખૂબ જરૂરી છે. શું આપ નજીકના એગ્રો સેન્ટરની માહિતી મેળવવા માંગો છો?",
        te: "నమస్కారం రైతు సోదరా। ఆకులపై పసుపు మచ్చల నివారణకు లీటరు నీటికి 2.5 గ్రాముల మాంకోజెబ్ కలిపి పిచికారీ చేయండి. రసం పీల్చే పురుగుల కోసం అర మిల్లీలీటరు ఇమిడాక్లోప్రిడ్ వాడండి. ఉదయం 10 గంటల లోపే గాలి నెమ్మదిగా ఉన్నప్పుడు స్ప్రే చేయడం చాలా ముఖ్యం. నేను సమీపంలోని రైతు సేవా కేంద్రాన్ని సూచించమంటారా?"
      };
      return diseaseAnswers[lang] || diseaseAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 9. MSP & GOVERNMENT SUPPORT RATES
    // ------------------------------------------------------------------------
    const mspKeywords = ["msp", "government rate", "sarkari", "support price", "एमएसपी", "समर्थन मूल्य", "ਸਰਕਾਰੀ ਰੇਟ", "ਟੇਕਾ", "ટેકાના ભાવ", "మద్దతు ధర"];
    if (mspKeywords.some(kw => q.includes(kw))) {
      const mspAnswers = {
        en: "Namaste Kisan Bhai, let me explain the current government minimum support price benchmarks and how they compare with your local markets today. For Sharbati Wheat, the official government MSP is fixed at 2,275 rupees per quintal, while your local wholesale market is paying 2,840 rupees, yielding you a strong gain of 565 rupees per quintal. For Yellow Soybean, the MSP is 4,892 rupees, Desi Chana is supported at 5,440 rupees, and Black Mustard stands at 5,650 rupees per quintal. All local APMC yards have opened free e-NAM digital registration counters for direct online auctions. Would you like guidance on linking your bank account for direct payments?",
        hi: "नमस्ते किसान भाई, आइए मैं आपको सरकारी न्यूनतम समर्थन मूल्य (एमएसपी) और आज के खुले बाजार के भावों की पूरी तुलना समझाता हूँ। शरबती गेहूं के लिए सरकारी एमएसपी 2,275 रुपये प्रति क्विंटल तय है, जबकि आपकी स्थानीय मंडी में यह 2,840 रुपये में बिक रहा है, जिससे आपको 565 रुपये प्रति क्विंटल का सीधा अतिरिक्त मुनाफा हो रहा है। पीली सोयाबीन का एमएसपी 4,892 रुपये, देसी चने का 5,440 रुपये और काली सरसों का 5,650 रुपये प्रति क्विंटल है। मंडी में ई-नाम पोर्टल पर मुफ्त पंजीयन चालू है। क्या आप ऑनलाइन नीलामी के लिए बैंक खाता जोड़ने की जानकारी चाहते हैं?",
        pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰ ਜੀ। ਸਰਕਾਰੀ ਐਮ.ਐਸ.ਪੀ: ਕਣਕ 2,275 ਰੁਪਏ ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ, ਜਦਕਿ ਮੰਡੀ 2,840 ਰੁਪਏ ਦੇ ਰਹੀ ਹੈ ਜਿਸ ਨਾਲ 565 ਰੁਪਏ ਵੱਧ ਮੁਨਾਫ਼ਾ ਹੁੰਦਾ ਹੈ। ਸੋਇਆਬੀਨ 4,892 ਰੁਪਏ ਅਤੇ ਸਰ੍ਹੋਂ 5,650 ਰੁਪਏ ਹੈ। ਕੀ ਤੁਹਾਨੂੰ ਈ-ਨਾਮ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ?",
        mr: "नमस्कार शेतकरी बंधू। शासकीय हमीभावाचे तपशील: गहू 2,275 रुपये प्रति क्विंटल असून बाजारात 2,840 रुपये दर मिळत आहे, ज्यामुळे 565 रुपयांचा जास्त नफा होतो. सोयाबीन 4,892 रुपये आणि मोहरी 5,650 रुपये आहे. थेट बँक खात्यात पैसे मिळवण्यासाठी ई-नाम नोंदणी सुरू आहे. मी अधिक माहिती देऊ का?",
        gu: "નમસ્તે ખેડૂત મિત્ર। સરકારી ટેકાના ભાવ: ઘઉં 2,275 રૂપિયા પ્રતિ ક્વિન્ટલ છે, જ્યારે મંડીમાં 2,840 રૂપિયા મળે છે એટલે કે 565 રૂપિયાનો વધુ નફો થાય છે. સોયાબીન 4,892 રૂપિયા અને ચણા 5,440 રૂપિયા છે. શું આપ ઈ-નામ પોર્ટલ પર નોંધણી કરાવવા માંગો છો?",
        te: "నమస్కారం రైతు సోదరా। ప్రభుత్వ మద్దతు ధరల వివరాలు: గోధుమలు 2,275 రూపాయలు కాగా, మార్కెట్లో 2,840 రూపాయలు పలుకుతోంది, అంటే 565 రూపాయల అదనపు లాభం. సోయాబీన్ 4,892 రూపాయలు మరియు శనగలు 5,440 రూపాయలు. మీరు ఈ-నామ్ రిజిస్ట్రేషన్ వివరాలు తెలుసుకోవాలనుకుంటున్నారా?"
      };
      return mspAnswers[lang] || mspAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 10. GREETINGS & INTRODUCTIONS
    // ------------------------------------------------------------------------
    const greetingKeywords = ["hello", "hi", "namaste", "ram ram", "sat sri akal", "kisan sahayak", "who are you", "kya kar sakte ho", "help", "नमस्ते", "राम राम", "नमस्कार", "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", "నమస్కారం", "કેમ છો", "હેલો"];
    if (greetingKeywords.some(kw => q.includes(kw))) {
      const greetAnswers = {
        en: `Namaste and a very warm welcome, ${profile.name}! I am your Kisan Setu Artificial Intelligence Farm Doctor and Market Advisor. I have direct access to your registered 12-acre farm at ${profile.village}, live prices for 26 crops, surrounding mandi distances, and verified merchants. How can I assist your harvest today?`,
        hi: `नमस्ते और किसान सेतु में आपका बहुत-बहुत स्वागत है, ${profile.name} जी! मैं आपका किसान सेतु एआई कृषि डॉक्टर और मंडी सलाहकार हूँ। मेरे पास ${profile.village} स्थित आपके 12 एकड़ खेत का रिकॉर्ड, 26 फसलों के लाइव भाव, आसपास की मंडियों की दूरी और सत्यापित व्यापारियों का पूरा डाटा उपलब्ध है। आज मैं आपकी क्या सहायता करूँ?`,
        pa: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ ${profile.name}! ਮੈਂ ਤੁਹਾਡਾ ਕਿਸਾਨ ਸੇਤੂ ਏਆਈ ਸਲਾਹਕਾਰ ਹਾਂ। ਮੇਰੇ ਕੋਲ ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਪੂਰਾ ਰਿਕਾਰਡ ਅਤੇ 26 ਫ਼ਸਲਾਂ ਦੇ ਲਾਈਵ ਭਾਵ ਮੌਜੂਦ ਹਨ। ਦੱਸੋ ਅੱਜ ਕੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?`,
        mr: `नमस्कार आणि स्वागत आहे, ${profile.name}! मी आपला किसान सेतू एआय कृषी सल्लागार आहे. माझ्याकडे आपल्या शेताची माहिती, 26 पिकांचे थेट बाजारभाव आणि जवळचे व्यापारी उपलब्ध आहेत. मी काय मदत करू?`,
        gu: `નમસ્તે ${profile.name}! હું આપનો કિસਾਨ સેતુ એઆઈ કૃષિ સલાહકાર છું. મારી પાસે આપના ખેતરની વિગતો અને 26 પાકોના લાઈવ ભાવ ઉપલબ્ધ છે. આજે આપ શું જાણવા માંગો છો?`,
        te: `నమస్కారం ${profile.name} గారూ! నేను మీ కిసాన్ సేతు ఏఐ వ్యవసాయ సలహాదారుని. నా వద్ద మీ పొలం వివరాలు మరియు 26 పంటల లైవ్ మార్కెట్ ధరలు అందుబాటులో ఉన్నాయి. నేడు నేను మీకు ఎలా సహాయపడగలను?`
      };
      return greetAnswers[lang] || greetAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 11. GENERAL RATE OVERVIEW (bhav / rate / prices)
    // ------------------------------------------------------------------------
    const generalRateKeywords = ["rate", "bhav", "price", "prices", "rates", "mandi bhav", "list", "today", "भाव", "रेट", "भाव सूची", "ਕੀ ਭਾਵ ਹੈ", "ભાવ"];
    if (generalRateKeywords.some(kw => q.includes(kw))) {
      const generalAnswers = {
        en: "Namaste Kisan Bhai! Today wholesale agricultural trading is very active across our region. In cereals, Sharbati Gold Wheat is leading the market at 2,840 rupees per quintal, and Yellow Soybean is trading at 4,890 rupees. In vegetables, Nashik Red Onion is quoting firmly at 2,350 rupees, Jyoti Potato is selling at 1,540 rupees, Bold Garlic is at a seasonal peak of 14,200 rupees, and Sweet Green Peas are fetching 3,800 rupees per quintal. All of these crops have verified merchant trucks available for farm pickup. Which specific vegetable or grain would you like a detailed price breakdown for?",
        hi: "नमस्ते किसान भाई! आज हमारे क्षेत्र की मंडियों में फसलों का व्यापार बहुत तेज और सक्रिय चल रहा है। अनाजों में शरबती गेहूं 2,840 रुपये प्रति क्विंटल और पीली सोयाबीन 4,890 रुपये पर बिक रही है। सब्जियों में लाल नासिक प्याज 2,350 रुपये, ज्योति आलू 1,540 रुपये, देसी लहसुन 14,200 रुपये और मीठी हरी मटर 3,800 रुपये प्रति क्विंटल पर बिक रही है। इन सभी फसलों के लिए व्यापारी खेत से सीधे गाड़ी भेजकर माल उठा रहे हैं। आप किस विशिष्ट फसल के बारे में पूरी जानकारी सुनना चाहते हैं?",
        pa: "ਅੱਜ ਮੰਡੀ ਵਿੱਚ ਸ਼ਰਬਤੀ ਕਣਕ 2,840 ਰੁਪਏ, ਸੋਇਆਬੀਨ 4,890 ਰੁਪਏ, ਲਾਲ ਪਿਆਜ਼ 2,350 ਰੁਪਏ, ਆਲੂ 1,540 ਰੁਪਏ ਅਤੇ ਲਸਣ 14,200 ਰੁਪਏ ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਚੱਲ ਰਿਹਾ ਹੈ। ਤੁਸੀਂ ਕਿਸ ਖ਼ਾਸ ਫ਼ਸਲ ਬਾਰੇ ਪੁੱਛਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
        mr: "आज बाजारात शरबती गहू 2,840 रुपये, सोयाबीन 4,890 रुपये, लाल कांदा 2,350 रुपये, बटाटा 1,540 रुपये आणि लसूण 14,200 रुपये प्रति क्विंटल दराने विकला जात आहे. आपण कोणत्या विशिष्ट पिकाबद्दल विचारणार आहात?",
        gu: "આજે મંડીમાં શરબતી ઘઉં 2,840 રૂપિયા, સોયાબીન 4,890 રૂપિયા, લાલ ડુંગળી 2,350 રૂપિયા, બટાટા 1,540 રૂપિયા અને લસણ 14,200 રૂપિયા પ્રતિ ક્વિન્ટલ ચાલે છે. આપ કયા પાક વિશે જાણવા માંગો છો?",
        te: "నేడు మార్కెట్లో శరబతి గోధుమలు 2,840 రూపాయలు, సోయాబీన్ 4,890 రూపాయలు, ఎర్ర ఉల్లిపాయలు 2,350 రూపాయలు, బంగాళాదుంప 1,540 రూపాయలు మరియు వెల్లుల్లి 14,200 రూపాయలు ప్రతి క్వింటాకి పలుకుతున్నాయి."
      };
      return generalAnswers[lang] || generalAnswers.hi;
    }

    // ------------------------------------------------------------------------
    // 12. DYNAMIC CONTEXTUAL FALLBACK BASED DIRECTLY ON ACTIVE WEBSITE STATE
    // ------------------------------------------------------------------------
    const cleanQueryShort = rawQuery.length > 50 ? rawQuery.substring(0, 50) + "..." : rawQuery;
    const fallbackAnswers = {
      en: `Namaste Kisan Bhai. I noted your question regarding "${cleanQueryShort}". Looking directly at the website data for ${profile.village}, our nearest market APMC Indore is trading Wheat at 2,840 rupees, Rau Hub is trading Onion at 2,350 rupees and Potato at 1,540 rupees, and Dewas Mandi is paying 2,880 rupees. Verified merchant Rajesh Agrawal has free truck dispatch open, and today's weather is 27 degrees Celsius with clear skies. You can ask me about any of our 26 crops, mandi distances, buyer numbers, or your farmer profile!`,
      hi: `नमस्ते किसान भाई। मैंने आपके सवाल "${cleanQueryShort}" को ध्यान से सुना। ${profile.village} के लिए वेबसाइट के लाइव डाटा के अनुसार, सबसे नजदीकी इंदौर मंडी में गेहूं 2,840 रुपये, राऊ मंडी में प्याज 2,350 रुपये व आलू 1,540 रुपये, और देवास मंडी में 2,880 रुपये का भाव चल रहा है। व्यापारी राजेश अग्रवाल के पास मुफ्त ट्रक पिकअप उपलब्ध है और आज का मौसम 27 डिग्री के साथ साफ है। आप मुझसे 26 फसलों के भाव, मंडी की दूरी, व्यापारी के नंबर या अपनी किसान प्रोफाइल के बारे में कुछ भी पूछ सकते हैं!`,
      pa: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ। ਵੈੱਬਸਾਈਟ ਦੇ ਡਾਟਾ ਮੁਤਾਬਕ ਇੰਦੌਰ ਮੰਡੀ ਵਿੱਚ ਕਣਕ 2,840 ਰੁਪਏ, ਰਾਊ ਵਿੱਚ ਪਿਆਜ਼ 2,350 ਰੁਪਏ ਅਤੇ ਦੇਵਾਸ ਵਿੱਚ 2,880 ਰੁਪਏ ਰੇਟ ਹੈ। ਵਪਾਰੀਆਂ ਕੋਲ ਮੁਫ਼ਤ ਟਰੱਕ ਹਨ ਅਤੇ ਮੌਸਮ 27 ਡਿਗਰੀ ਸਾਫ਼ ਹੈ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਫ਼ਸਲ, ਮੰਡੀ ਜਾਂ ਵਪਾਰੀ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ!`,
      mr: `नमस्कार। वेबसाईटवरील थेट माहितीनुसार इंदूर बाजारात गहू 2,840 रुपये, राऊ बाजारात कांदा 2,350 रुपये आणि देवासमध्ये 2,880 रुपये दर आहे. व्यापारी राजेश अग्रवाल यांच्याकडे मोफत वाहतूक उपलब्ध आहे. आपण 26 पिकांचे भाव, अंतर किंवा व्यापाऱ्यांविषयी विचारू शकता!`,
      gu: `નમસ્તે ખેડૂત મિત્ર। વેબસાઇટના લાઈવ ડેટા મુજબ ઇન્દોર મંડીમાં ઘઉં 2,840 રૂપિયા, રાઉમાં ડુંગળી 2,350 રૂપિયા અને દેવાસમાં 2,880 રૂપિયા ભાવ છે. વેપારીઓ પાસે મફત ટ્રક છે અને હવામાન 27 ડિગ્રી ચોખ્ખું છે. આપ કોઈપણ વિગત પૂછી શકો છો!`,
      te: `నమస్కారం రైతు సోదరా। వెబ్‌సైట్ లైవ్ డేటా ప్రకారం ఇండోర్ మార్కెట్లో గోధుమలు 2,840 రూపాయలు, రావులో ఉల్లిపాయలు 2,350 రూపాయలు మరియు దేవాస్‌లో 2,880 రూపాయలు పలుకుతున్నాయి. వ్యాపారుల వద్ద ఉచిత రవాణా అందుబాటులో ఉంది.`
    };
    return fallbackAnswers[lang] || fallbackAnswers.hi;
  }

  async function handleFarmerMessage(userText) {
    if (!userText || !userText.trim()) return;
    stopListening();
    appendTranscript("user", userText);

    const lang = state.currentLang || "hi";

    if (dom.callStatusSub) {
      dom.callStatusSub.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></span> ⚡ DeepSeek AI thinking...`;
    }

    // Prepare recent conversation history for DeepSeek multi-turn context
    const history = (state.activeCallRecord?.transcripts || []).slice(-6).map(t => ({
      role: t.sender === "user" ? "user" : "assistant",
      content: t.text
    }));

    try {
      // Connect to DeepSeek API endpoint via backend middleware
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          language: lang,
          farmerContext: state.farmerProfile,
          history: history
        })
      });

      const data = await response.json();
      let answer = "";

      if (data && data.success && data.answer) {
        answer = data.answer;
        if (dom.callStatusSub) {
          dom.callStatusSub.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span> Live Voice Call (${LANG_TAGS[lang] || "hi-IN"}) · DeepSeek AI`;
        }
      } else {
        // Fallback to local intelligent agricultural NLP engine if API quota/rate-limit hit
        console.info("DeepSeek note:", data?.error || "Using local Agri engine fallback");
        answer = generateContextualAgriAIAnswer(userText, lang);
        if (dom.callStatusSub) {
          dom.callStatusSub.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span> Live Voice Call (${LANG_TAGS[lang] || "hi-IN"})`;
        }
      }

      appendTranscript("ai", answer);
      speakText(answer, lang);
    } catch (err) {
      console.warn("DeepSeek connection fallback to local engine:", err);
      const answer = generateContextualAgriAIAnswer(userText, lang);
      if (dom.callStatusSub) {
        dom.callStatusSub.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span> Live Voice Call (${LANG_TAGS[lang] || "hi-IN"})`;
      }
      appendTranscript("ai", answer);
      speakText(answer, lang);
    }
  }

  // Web Speech Synthesis (TTS Voice Readout with Multi-Lingual Speech Engine)
  function speakText(text, specificLang = null, onFinishCallback = null) {
    if (!state.isSpeakerOn || !("speechSynthesis" in window)) {
      if (state.isCallActive && !state.isMuted) {
        startListening();
      }
      return;
    }
    window.speechSynthesis.cancel(); // Stop prior audio
    stopListening();
    state.isAiSpeaking = true;
    
    const lang = specificLang || state.currentLang || "hi";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_TAGS[lang] || "hi-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Intelligent voice matching for regional Indian languages
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = (LANG_TAGS[lang] || "hi").substring(0, 2).toLowerCase();
      const nativeVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
        || voices.find(v => v.lang.toLowerCase().includes("in"));
      if (nativeVoice) {
        utterance.voice = nativeVoice;
      }
    }

    utterance.onend = () => {
      state.isAiSpeaking = false;
      if (state.isCallActive && !state.isMuted) {
        startListening();
      }
      if (onFinishCallback) onFinishCallback();
    };

    utterance.onerror = () => {
      state.isAiSpeaking = false;
      if (state.isCallActive && !state.isMuted) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  window.speakCropPrice = function(cropName, price, mandi) {
    const lang = state.currentLang || "hi";
    const readouts = {
      en: `${cropName} is trading at ₹${price} per quintal in ${mandi}.`,
      hi: `${mandi} में ${cropName} का भाव ₹${price} प्रति क्विंटल चल रहा है।`,
      pa: `${mandi} ਵਿੱਚ ${cropName} ਦਾ ਭਾਵ ₹${price} ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਚੱਲ ਰਿਹਾ ਹੈ।`,
      mr: `${mandi} मध्ये ${cropName} चा दर ₹${price} प्रति क्विंटल सुरू आहे.`,
      gu: `${mandi}માં ${cropName}નો ભાવ ₹${price} પ્રતિ ક્વિન્ટલ ચાલે છે.`,
      te: `${mandi}లో ${cropName} ధర ₹${price} ప్రతి క్వింటాకి ఉంది.`
    };
    const readout = readouts[lang] || readouts.hi;
    speakText(readout, lang);
    window.showToast(`🔊 ${readout}`, "info");
  };

  /* --------------------------------------------------------------------------
     8. CANVAS VOICE WAVEFORM VISUALIZER
     -------------------------------------------------------------------------- */
  function initCanvasVisualizer() {
    const canvas = dom.voiceCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let step = 0;

    function draw() {
      // Auto-resize for crisp retina display
      canvas.width = canvas.offsetWidth * window.devicePixelRatio || 500;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio || 120;
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Multiple harmonic soundwaves
      const waveConfigs = [
        { amplitude: state.isCallActive ? 28 : 6, wavelength: 0.02, color: "rgba(34, 197, 94, 0.85)", speed: 0.06 },
        { amplitude: state.isCallActive ? 20 : 4, wavelength: 0.03, color: "rgba(245, 158, 11, 0.75)", speed: -0.05 },
        { amplitude: state.isCallActive ? 14 : 2, wavelength: 0.015, color: "rgba(56, 189, 248, 0.65)", speed: 0.03 }
      ];

      waveConfigs.forEach((config) => {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = config.color;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * config.wavelength + step * config.speed) * config.amplitude * Math.sin((x / width) * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      step++;
      state.audioAnimationId = requestAnimationFrame(draw);
    }

    draw();
  }

  /* --------------------------------------------------------------------------
     9. REAL-TIME MANDI TICKER FLUCTUATION SIMULATION
     -------------------------------------------------------------------------- */
  function startRealtimePriceSimulation() {
    // Every 5-8 seconds, randomly alter a commodity price by ± ₹10 to ₹30
    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * state.commodities.length);
      const target = state.commodities[randomIndex];
      const delta = (Math.random() > 0.45 ? 1 : -1) * (Math.floor(Math.random() * 25) + 5);
      
      target.currentPrice = Math.max(100, target.currentPrice + delta);
      target.isPositive = delta > 0;
      target.changePercent = Number(((target.currentPrice - target.basePrice) / target.basePrice * 100).toFixed(1));
      target.trend.shift();
      target.trend.push(target.currentPrice);

      renderTicker();
      
      // Update specific DOM card without re-rendering whole list to preserve scroll
      const cardEl = document.getElementById(`crop-${target.id}`);
      if (cardEl) {
        const priceValEl = cardEl.querySelector(".price-value");
        if (priceValEl) {
          priceValEl.textContent = `₹${target.currentPrice.toLocaleString("en-IN")}`;
          // Flash feedback
          cardEl.style.transition = "background-color 0.4s ease";
          cardEl.style.backgroundColor = delta > 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)";
          setTimeout(() => {
            cardEl.style.backgroundColor = "";
          }, 600);
        }
      }
    }, 6500);
  }

  /* --------------------------------------------------------------------------
     10. SELL HARVEST MODAL & INSTANT REVENUE ESTIMATION
     -------------------------------------------------------------------------- */
  window.quickSellCrop = function(cropId, cropName, price) {
    if (dom.sellCropSelect) {
      dom.sellCropSelect.value = cropId;
    }
    updateRevenueEstimate();
    if (dom.sellModalOverlay) {
      dom.sellModalOverlay.classList.add("active");
    }
  };

  function updateRevenueEstimate() {
    if (!dom.sellCropSelect || !dom.sellQuantityInput || !dom.estimatedRevenueBadge) return;
    const cropId = dom.sellCropSelect.value;
    const qty = parseFloat(dom.sellQuantityInput.value) || 0;
    const crop = state.commodities.find(c => c.id === cropId);
    
    if (crop) {
      const total = Math.round(qty * crop.currentPrice);
      dom.estimatedRevenueBadge.textContent = `₹${total.toLocaleString("en-IN")}`;

      // Update Visual Crop Photo Preview in Modal
      const photoImg = document.getElementById("sellCropPhotoPreview");
      const photoName = document.getElementById("sellCropPhotoName");
      if (photoImg && crop.image) {
        photoImg.src = crop.image;
      }
      if (photoName) {
        photoName.textContent = `${crop.name} (${crop.hindiName})`;
      }
    }
  }

  window.negotiateDeal = function(merchantId, merchantName) {
    window.showToast(`Connecting direct deal gateway with ${merchantName}... Best price locked!`, "success");
    openVoiceCall(`Selling produce to ${merchantName}`);
  };

  window.askBotAboutCrop = function(cropName) {
    openVoiceCall(cropName);
  };

  window.trackMerchantCall = function(name) {
    window.showToast(`Dialing verified merchant ${name}...`, "info");

    const merchantRecord = {
      id: "CALL-M-" + Date.now().toString(36).toUpperCase(),
      type: "merchant",
      caller: `${name} (Verified Buyer)`,
      topic: `Farm Gate Direct Harvest Sale & Truck Pickup Confirmation`,
      language: state.currentLang || "hi",
      startTime: new Date().toISOString(),
      durationSeconds: 52,
      timestamp: new Date().toISOString(),
      tags: ["#DirectSale", "#VerifiedMerchant", "#SpotPayment"],
      transcripts: [
        { sender: "user", text: `नमस्ते, क्या आप ग्राम हातोद फार्म गेट से आज तैयार फसल उठाने के लिए गाड़ी भेज सकते हैं?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { sender: "merchant", text: `हाँ किसान भाई, हमारी गाड़ी 2 घंटे में आपके फार्म गेट पर पहुँच जाएगी। धर्मकांटा वजन होते ही तुरंत आरटीजीएस से भुगतान हो जाएगा।`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ],
      keySummary: `Direct buyer call connected with ${name}. Agreed on farm-gate pickup logistics and instant digital bank settlement upon weighbridge slip.`
    };
    state.callHistory.unshift(merchantRecord);
    saveCallHistoryToStorage();
    renderCallHistory();
    updateCallHistoryStats();
  };

  /* --------------------------------------------------------------------------
     11. EVENT LISTENERS & ACCESSIBILITY CONTROLS
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Open Voice AI Call Modal
    dom.openCallBtns.forEach(btn => {
      btn.addEventListener("click", () => openVoiceCall());
    });

    // Call History Filters (All, AI Doctor, Merchant)
    if (dom.callFilterBtns) {
      dom.callFilterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          dom.callFilterBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.callHistoryFilter = btn.dataset.filter || "all";
          renderCallHistory(state.callHistoryFilter, state.callHistorySearch);
        });
      });
    }

    // Call History Search Input
    if (dom.callHistorySearchInput) {
      dom.callHistorySearchInput.addEventListener("input", (e) => {
        state.callHistorySearch = e.target.value;
        renderCallHistory(state.callHistoryFilter, state.callHistorySearch);
      });
    }

    // Clear Call History Button
    if (dom.clearCallHistoryBtn) {
      dom.clearCallHistoryBtn.addEventListener("click", window.clearCallHistory);
    }

    // Export Call History Button
    if (dom.exportCallsBtn) {
      dom.exportCallsBtn.addEventListener("click", window.exportCallHistory);
    }

    // End Voice Call
    if (dom.endCallBtn) {
      dom.endCallBtn.addEventListener("click", endVoiceCall);
    }

    // Mute / Unmute Call Microphone
    if (dom.muteCallBtn) {
      dom.muteCallBtn.addEventListener("click", () => {
        state.isMuted = !state.isMuted;
        dom.muteCallBtn.classList.toggle("bg-rose-600", state.isMuted);
        dom.muteCallBtn.classList.toggle("text-white", state.isMuted);
        if (state.isMuted) {
          stopListening();
          window.showToast("🔇 Microphone muted", "info");
        } else {
          startListening();
          window.showToast("🎙️ Microphone unmuted (Listening)", "success");
        }
      });
    }

    // Speaker Toggle
    if (dom.speakerToggleBtn) {
      dom.speakerToggleBtn.addEventListener("click", () => {
        state.isSpeakerOn = !state.isSpeakerOn;
        dom.speakerToggleBtn.classList.toggle("opacity-50", !state.isSpeakerOn);
        if (!state.isSpeakerOn && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        window.showToast(state.isSpeakerOn ? "Speaker enabled" : "Speaker disabled", "info");
      });
    }

    // Quick Prompts in Call
    dom.quickPromptChips.forEach(chip => {
      chip.addEventListener("click", () => {
        const promptText = chip.getAttribute("data-prompt") || chip.textContent;
        handleFarmerMessage(promptText);
      });
    });

    // Chat text input inside call
    if (dom.callSendBtn && dom.callInputText) {
      const sendAction = () => {
        const text = dom.callInputText.value;
        if (text.trim()) {
          handleFarmerMessage(text);
          dom.callInputText.value = "";
        }
      };
      dom.callSendBtn.addEventListener("click", sendAction);
      dom.callInputText.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendAction();
      });
    }

    // Sell Modal open/close
    dom.openSellBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (dom.sellModalOverlay) dom.sellModalOverlay.classList.add("active");
        updateRevenueEstimate();
      });
    });

    if (dom.closeSellModalBtn && dom.sellModalOverlay) {
      dom.closeSellModalBtn.addEventListener("click", () => {
        dom.sellModalOverlay.classList.remove("active");
      });
    }

    if (dom.sellCropSelect) {
      dom.sellCropSelect.addEventListener("change", updateRevenueEstimate);
    }
    if (dom.sellQuantityInput) {
      dom.sellQuantityInput.addEventListener("input", updateRevenueEstimate);
    }

    if (dom.sellForm) {
      dom.sellForm.addEventListener("submit", (e) => {
        e.preventDefault();
        dom.sellModalOverlay.classList.remove("active");
        window.showToast("Your lot has been broadcasted to 4 verified buyers! Highest bidder will call you in 5 mins.", "success");
      });
    }

    // Farmer produce photo upload interaction
    const uploadInput = document.getElementById("producePhotoUpload");
    const uploadFeedback = document.getElementById("uploadedPhotoFeedback");
    const uploadThumb = document.getElementById("farmerUploadPreviewThumb");
    const uploadName = document.getElementById("farmerUploadName");

    if (uploadInput && uploadFeedback) {
      uploadInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (uploadThumb) uploadThumb.src = event.target.result;
            if (uploadName) uploadName.textContent = `Attached: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
            uploadFeedback.classList.remove("hidden");
            uploadFeedback.classList.add("flex");
            window.showToast("📸 Produce photo attached! Verified for merchant auction.", "success");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Category Filter Pills
    dom.categoryPills.forEach(pill => {
      pill.addEventListener("click", () => {
        dom.categoryPills.forEach(p => p.classList.remove("active", "bg-emerald-800", "text-white"));
        dom.categoryPills.forEach(p => p.classList.add("bg-white/60", "text-gray-800"));
        
        pill.classList.add("active", "bg-emerald-800", "text-white");
        pill.classList.remove("bg-white/60", "text-gray-800");

        state.selectedCategory = pill.getAttribute("data-category") || "All";
        renderCommodities();
      });
    });

    // Crop Search Input
    if (dom.cropSearchInput) {
      dom.cropSearchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value.trim();
        renderCommodities();
      });
    }

    // Outdoor Anti-Glare Sunlight Mode Toggle
    if (dom.sunlightToggle) {
      dom.sunlightToggle.addEventListener("click", () => {
        state.isSunlightMode = !state.isSunlightMode;
        document.body.classList.toggle("sunlight-mode", state.isSunlightMode);
        dom.sunlightToggle.classList.toggle("bg-amber-400", state.isSunlightMode);
        window.showToast(state.isSunlightMode ? "☀️ Outdoor Sunlight Mode Enabled (High Contrast)" : "Standard Frosted Mode", "info");
      });
    }

    // Font Magnifier for Farmer Vision Accessibility
    if (dom.fontSizeBtn) {
      dom.fontSizeBtn.addEventListener("click", () => {
        state.fontSizeLevel = (state.fontSizeLevel + 1) % 3; // 0 -> 1 -> 2 -> 0
        if (state.fontSizeLevel === 0) {
          document.documentElement.style.fontSize = "16px";
          window.showToast("Text Size: Normal", "info");
        } else if (state.fontSizeLevel === 1) {
          document.documentElement.style.fontSize = "18px";
          window.showToast("Text Size: Large (+12%)", "info");
        } else {
          document.documentElement.style.fontSize = "20px";
          window.showToast("Text Size: Extra Large (+25%)", "info");
        }
      });
    }

    // Vernacular Language Switcher (Top Navbar & Call Modal)
    if (dom.langSelector) {
      dom.langSelector.addEventListener("change", (e) => {
        setLanguage(e.target.value);
      });
    }

    if (dom.callLangSelector) {
      dom.callLangSelector.addEventListener("change", (e) => {
        setLanguage(e.target.value);
      });
    }

    // Auth Tabs Switcher
    if (dom.tabBtnOtp && dom.tabBtnRegister) {
      dom.tabBtnOtp.addEventListener("click", () => {
        dom.tabBtnOtp.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all bg-emerald-800 text-white shadow-xs";
        dom.tabBtnRegister.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:text-emerald-950 transition-all";
        if (dom.paneOtpLogin) dom.paneOtpLogin.classList.remove("hidden");
        if (dom.paneRegister) dom.paneRegister.classList.add("hidden");
      });

      dom.tabBtnRegister.addEventListener("click", () => {
        dom.tabBtnRegister.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all bg-emerald-800 text-white shadow-xs";
        dom.tabBtnOtp.className = "px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 hover:text-emerald-950 transition-all";
        if (dom.paneRegister) dom.paneRegister.classList.remove("hidden");
        if (dom.paneOtpLogin) dom.paneOtpLogin.classList.add("hidden");
      });
    }

    if (dom.switchToRegisterLink && dom.tabBtnRegister) {
      dom.switchToRegisterLink.addEventListener("click", () => {
        dom.tabBtnRegister.click();
      });
    }

    if (dom.switchToLoginLink && dom.tabBtnOtp) {
      dom.switchToLoginLink.addEventListener("click", () => {
        dom.tabBtnOtp.click();
      });
    }

    // 1-Click Demo Fill & Send OTP
    if (dom.quickDemoFillBtn) {
      dom.quickDemoFillBtn.addEventListener("click", handleQuickDemoFill);
    }

    if (dom.sendOtpBtn) {
      dom.sendOtpBtn.addEventListener("click", () => {
        handleQuickDemoFill();
        window.showToast("📩 OTP sent to your phone! Demo OTP: 1234", "success");
      });
    }

    if (dom.resendOtpBtn) {
      dom.resendOtpBtn.addEventListener("click", () => {
        handleQuickDemoFill();
        window.showToast("🔄 New OTP generated: 1234", "info");
      });
    }

    // Farmer Login Form Submission
    if (dom.farmerLoginForm) {
      dom.farmerLoginForm.addEventListener("submit", handleOtpLogin);
    }

    // Farmer Register Form Submission
    if (dom.farmerRegisterForm) {
      dom.farmerRegisterForm.addEventListener("submit", handleFarmerRegister);
    }

    // Logout
    if (dom.farmerLogoutBtn) {
      dom.farmerLogoutBtn.addEventListener("click", handleFarmerLogout);
    }

    // Navbar Auth Pill click (Desktop & Mobile)
    const handleAuthPillClick = () => {
      if (!state.isLoggedIn) {
        if (dom.farmerAuthSection) dom.farmerAuthSection.scrollIntoView({ behavior: "smooth" });
      } else {
        openEditProfileModal();
      }
    };
    if (dom.navAuthBtn) {
      dom.navAuthBtn.addEventListener("click", handleAuthPillClick);
    }
    const navAuthBtnMobile = document.getElementById("navAuthBtnMobile");
    if (navAuthBtnMobile) {
      navAuthBtnMobile.addEventListener("click", handleAuthPillClick);
    }

    // Edit Profile Modal Open & Close
    if (dom.openEditProfileBtn) {
      dom.openEditProfileBtn.addEventListener("click", openEditProfileModal);
    }
    if (dom.closeEditProfileBtn) {
      dom.closeEditProfileBtn.addEventListener("click", closeEditProfileModal);
    }
    if (dom.cancelEditProfileBtn) {
      dom.cancelEditProfileBtn.addEventListener("click", closeEditProfileModal);
    }
    if (dom.editProfileForm) {
      dom.editProfileForm.addEventListener("submit", handleSaveEditProfile);
    }
    if (dom.editFarmGpsBtn) {
      dom.editFarmGpsBtn.addEventListener("click", () => {
        detectUserLocation();
        setTimeout(() => {
          if (dom.editGpsCoordsBadge) {
            dom.editGpsCoordsBadge.textContent = `${state.userLocation.lat.toFixed(4)}° N, ${state.userLocation.lng.toFixed(4)}° E`;
          }
        }, 800);
      });
    }

    // Legacy form fallback
    if (dom.farmerProfileForm) {
      dom.farmerProfileForm.addEventListener("submit", saveFarmerProfile);
    }

    // District Search Submission
    if (dom.districtSearchBtn) {
      dom.districtSearchBtn.addEventListener("click", searchDistrictLocation);
    }
    if (dom.districtSearchInput) {
      dom.districtSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchDistrictLocation();
      });
    }

    // AI Voice Summary Playback Button
    if (dom.playAiVoiceSummaryBtn) {
      dom.playAiVoiceSummaryBtn.addEventListener("click", toggleAiVoicePlayback);
    }

    // Location Detection & Presets
    if (dom.detectLocationBtn) {
      dom.detectLocationBtn.addEventListener("click", detectUserLocation);
    }

    if (dom.locationPresetSelect) {
      dom.locationPresetSelect.addEventListener("change", (e) => {
        setLocationPreset(e.target.value);
      });
    }

    if (dom.matrixCropSelect) {
      dom.matrixCropSelect.addEventListener("change", (e) => {
        renderSurroundingMandiAnalysis(e.target.value);
      });
    }

    // Radius Filter for Map
    if (dom.radiusSelect) {
      dom.radiusSelect.addEventListener("change", (e) => {
        state.radiusKm = parseInt(e.target.value, 10);
        updateMapForUserLocation();
        window.showToast(`Showing Mandis & Merchants within ${state.radiusKm} km`, "info");
      });
    }
  }

  const LANG_NAMES = {
    en: "English",
    hi: "हिन्दी (Hindi)",
    pa: "ਪੰਜਾਬੀ (Punjabi)",
    mr: "मराठी (Marathi)",
    gu: "ગુજરાતી (Gujarati)",
    te: "తెలుగు (Telugu)"
  };

  function setLanguage(lang) {
    state.currentLang = lang;
    if (dom.langSelector) dom.langSelector.value = lang;
    if (dom.callLangSelector) dom.callLangSelector.value = lang;
    applyLanguage(lang);
    renderCallPromptChips(lang);

    if (state.recognition) {
      state.recognition.lang = LANG_TAGS[lang] || "hi-IN";
    }

    // If call is currently active, notify the farmer in the new language!
    if (state.isCallActive) {
      const switchMessages = {
        en: "Language switched to English. How can I assist your farm today?",
        hi: "भाषा बदलकर हिन्दी कर दी गई है। आज आपकी क्या सहायता करूँ?",
        pa: "ਬੋਲੀ ਬਦਲ ਕੇ ਪੰਜਾਬੀ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ। ਦੱਸੋ ਕੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?",
        mr: "भाषा बदलून मराठी करण्यात आली आहे. आज मी काय मदत करू?",
        gu: "ભાષા બદલીને ગુજરાતી કરવામાં આવી છે. હું શું મદદ કરી શકું?",
        te: "భాష తెలుగులోకి మార్చబడింది. నేడు నేను మీకు ఎలా సహాయపడగలను?"
      };
      const switchMsg = switchMessages[lang] || switchMessages.hi;
      appendTranscript("ai", switchMsg);
      speakText(switchMsg, lang);
    }
  }

  function applyLanguage(lang) {
    const texts = i18n[lang] || i18n.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (texts[key]) el.textContent = texts[key];
    });
    window.showToast(`🗣️ AI Voice & Language set to ${LANG_NAMES[lang] || lang}`, "success");
  }

  // Toast Notification System
  window.showToast = function (message, type = "info") {
    let toast = document.getElementById("agriToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "agriToast";
      toast.className = "fixed top-5 right-5 z-[150] max-w-md px-4 py-3 rounded-2xl backdrop-blur-xl border shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-[-20px] opacity-0 pointer-events-none font-semibold text-xs md:text-sm";
      document.body.appendChild(toast);
    }

    if (type === "success") {
      toast.className = "fixed top-5 right-5 z-[150] max-w-md px-4 py-3 rounded-2xl backdrop-blur-xl border border-emerald-400 bg-emerald-900/90 text-white shadow-xl flex items-center gap-3 transition-all duration-300 font-semibold text-xs md:text-sm";
      toast.innerHTML = `<span>✅</span> <div>${message}</div>`;
    } else if (type === "info") {
      toast.className = "fixed top-5 right-5 z-[150] max-w-md px-4 py-3 rounded-2xl backdrop-blur-xl border border-amber-400 bg-amber-950/90 text-white shadow-xl flex items-center gap-3 transition-all duration-300 font-semibold text-xs md:text-sm";
      toast.innerHTML = `<span>📢</span> <div>${message}</div>`;
    }

    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";

    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      toast.style.transform = "translateY(-20px)";
      toast.style.opacity = "0";
    }, 3800);
  };

  // Run App
  init();
});
}


