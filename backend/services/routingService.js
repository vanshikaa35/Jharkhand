const fs = require("fs");
const path = require("path");

const institutionsFile = path.join(
  __dirname,
  "../data/institutions.json"
);

// Keywords that describe what each problem category generally needs
const routingKeywords = {
  "Water": [
    "water",
    "water quality",
    "water resources",
    "groundwater",
    "hydrology",
    "wastewater",
    "irrigation",
    "water treatment",
    "environmental"
  ],

  "Roads & Transport": [
    "transport",
    "transportation",
    "infrastructure",
    "civil engineering",
    "engineering",
    "gis"
  ],

  "Healthcare": [
    "healthcare",
    "health",
    "rural health",
    "tribal health",
    "public health",
    "health systems",
    "telemedicine"
  ],

  "Education": [
    "education",
    "social sciences",
    "cse",
    "computer science"
  ],

  "Environment": [
    "environment",
    "environmental",
    "water resources",
    "groundwater",
    "watershed",
    "climate",
    "geology",
    "solid waste"
  ],

  "Agriculture": [
    "agriculture",
    "irrigation",
    "drip",
    "rainwater harvesting",
    "doba",
    "soil-water",
    "soil",
    "water conservation",
    "crop productivity",
    "fpo",
    "livelihoods"
  ],

  "Electricity": [
    "energy",
    "renewable energy",
    "solar",
    "engineering"
  ],

  "Public Safety": [
    "engineering",
    "computer science",
    "ai",
    "gis"
  ],

  "Waste Management": [
    "solid waste",
    "wastewater",
    "environment",
    "environmental",
    "engineering"
  ],

  "Other": [
    "engineering",
    "computer science",
    "environment"
  ]
};


const normalise = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .trim();
};


const routeProblem = (category, location="") => {
  try {
    const institutions = JSON.parse(
      fs.readFileSync(institutionsFile, "utf-8")
    );

    const requiredKeywords =
      routingKeywords[category] || routingKeywords["Other"];

    let bestInstitution = null;
    let bestScore = 0;
    let bestMatches = [];

    institutions.forEach((institution) => {

      // Real data has "Expertise keywords" as a STRING
      const expertiseText = normalise(
        institution["Expertise keywords"]
      );

      const matches = requiredKeywords.filter((keyword) =>
        expertiseText.includes(normalise(keyword))
      );

      if (matches.length > bestScore) {
        bestScore = matches.length;
        bestInstitution = institution;
        bestMatches = matches;
      }
    });


    if (!bestInstitution) {
      return {
        institutionId: null,
        institution: null,
        college: null,
        solutions:[],
        reason:
          "No suitable institution was found. Manual review required."
      };
    }


    const reason =
      `Selected because ${bestInstitution["Institution"]} ` +
      `has relevant expertise in ${bestMatches.join(", ")} ` +
      `and is located in ${bestInstitution["District"]}.`;


    return {
      institutionId: bestInstitution["ID"],
      institution: bestInstitution["Institution"],

      // Keep "college" so the rest of your existing backend
      // does not immediately break.
      college: bestInstitution["Institution"],
      solutions: [],

      reason
    };

  } catch (error) {

    console.error(
      "Routing error:",
      error.message
    );

    return {
      institutionId: null,
      institution: null,
      college: null,
      solutions: [],
      reason:
        "Routing failed. Manual review required."
    };
  }
};


module.exports = {
  routeProblem
};