// Standalone In-Memory Store when MongoDB is not connected
const inMemoryStore = {
  users: new Map(),
  alerts: [],
  sellingHistory: [],
  prices: [
    { _id: "p1", state: "Madhya Pradesh", district: "Indore", mandi: "Indore Main APMC", crop: "Wheat", variety: "Sharbati Gold", minPrice: 2650, maxPrice: 2980, modalPrice: 2840, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" },
    { _id: "p2", state: "Madhya Pradesh", district: "Indore", mandi: "Rau Hub APMC", crop: "Onion", variety: "Nashik Red", minPrice: 2100, maxPrice: 2450, modalPrice: 2350, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" },
    { _id: "p3", state: "Madhya Pradesh", district: "Dewas", mandi: "Dewas Model Agro Mandi", crop: "Onion", variety: "Nashik Red", minPrice: 2200, maxPrice: 2500, modalPrice: 2390, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" },
    { _id: "p4", state: "Madhya Pradesh", district: "Dewas", mandi: "Dewas Model Agro Mandi", crop: "Soybean", variety: "Yellow Gold", minPrice: 4500, maxPrice: 4850, modalPrice: 4720, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" },
    { _id: "p5", state: "Madhya Pradesh", district: "Indore", mandi: "Sanwer Mandi", crop: "Wheat", variety: "Lokwan Premium", minPrice: 2580, maxPrice: 2820, modalPrice: 2710, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" },
    { _id: "p6", state: "Madhya Pradesh", district: "Ujjain", mandi: "Ujjain Chimanganj APMC", crop: "Garlic", variety: "Ooty Special", minPrice: 13500, maxPrice: 14800, modalPrice: 14200, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" },
    { _id: "p7", state: "Telangana", district: "Warangal", mandi: "Warangal APMC", crop: "Cotton", variety: "Medium Staple", minPrice: 6800, maxPrice: 7450, modalPrice: 7120, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" },
    { _id: "p8", state: "Maharashtra", district: "Nashik", mandi: "Lasalgaon APMC", crop: "Onion", variety: "Red Onion", minPrice: 2200, maxPrice: 2600, modalPrice: 2450, unit: "quintal", priceDate: new Date(), dataSource: "Agmarknet Verified" }
  ]
};

module.exports = inMemoryStore;

