import { colleges, categories } from "../data/colleges.js";

// ---------------------------------------------------------------------------
// This file is the ONE place you swap mock logic for a real AI API call.
// Right now `categorize()` uses simple keyword matching so the frontend
// works standalone before the backend exists. Replace the inside of
// categorize() with a fetch() to your Node/Express backend (which itself
// calls the Claude/OpenAI API) once it's ready — the function signature
// and return shape can stay the same, so nothing else in the app changes.
// ---------------------------------------------------------------------------

const keywordMap = {
  water: ["water", "tap", "borewell", "pipeline", "drainage", "flood"],
  healthcare: ["hospital", "doctor", "health", "clinic", "medicine", "disease"],
  education: ["school", "teacher", "college", "education", "student"],
  agriculture: ["crop", "farm", "irrigation", "seed", "fertilizer", "agriculture"],
  infrastructure: ["road", "bridge", "building", "construction", "streetlight"],
  environment: ["pollution", "forest", "tree", "waste", "garbage", "environment"],
  energy: ["electricity", "power", "solar", "outage", "transformer"],
  urban: ["urban", "traffic", "footpath", "parking", "municipal"],
  "rural livelihoods": ["livelihood", "employment", "wages", "job", "mgnrega"],
  "public administration": ["office", "certificate", "corruption", "delay", "pension"],
};

function pickCategory(text) {
  const lower = text.toLowerCase();
  let best = { category: "public administration", score: 0 };

  for (const category of categories) {
    const words = keywordMap[category] || [];
    const score = words.reduce((sum, w) => (lower.includes(w) ? sum + 1 : sum), 0);
    if (score > best.score) best = { category, score };
  }

  // Confidence is illustrative — a real model would return calibrated probabilities.
  const confidence = best.score === 0 ? 0.42 : Math.min(0.95, 0.55 + best.score * 0.15);
  return { category: best.category, confidence };
}

function findMatches(category) {
  return colleges
    .filter((c) => c.expertise.includes(category))
    .slice(0, 3);
}

function findSimilar(text, existing) {
  // Very rough word-overlap similarity for demo purposes only.
  const words = new Set(text.toLowerCase().split(/\W+/).filter(Boolean));
  return existing
    .map((item) => {
      const itemWords = new Set(item.text.toLowerCase().split(/\W+/).filter(Boolean));
      const overlap = [...words].filter((w) => itemWords.has(w)).length;
      const similarity = overlap / Math.max(words.size, 1);
      return { ...item, similarity };
    })
    .filter((item) => item.similarity > 0.35)
    .sort((a, b) => b.similarity - a.similarity);
}

// Simulated "recent complaints" for the duplicate-detection demo.
const recentComplaints = [
  { id: "c1", text: "No water supply in our ward for the last 5 days", district: "Ranchi, Ward 4" },
  { id: "c2", text: "Water pipeline broken near the market, water wasted daily", district: "Ranchi, Ward 4" },
  { id: "c3", text: "Streetlights not working on the main road at night", district: "Ranchi, Ward 7" },
];

export async function categorizeComplaint(text) {
  // Simulate network latency so the "AI thinking" state feels real in the demo.
  await new Promise((resolve) => setTimeout(resolve, 900));

  const { category, confidence } = pickCategory(text);
  const matches = findMatches(category);
  const duplicates = findSimilar(text, recentComplaints);

  return {
    category,
    confidence,
    matches,
    duplicates,
    needsReview: confidence < 0.6,
  };
}
