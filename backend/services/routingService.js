const fs = require("fs");
const path = require("path");

const institutionsFile = path.join(
    __dirname,
    "../data/institutions.json"
);

const solutionsFile = path.join(
    __dirname,
    "../data/solutions.json"
);

const routingKeywords = {
    Water: [
        "water",
        "drinking water",
        "water quality",
        "groundwater",
        "wastewater",
        "irrigation",
        "water treatment",
        "water conservation"
    ],

    "Roads & Transport": [
        "transport",
        "transportation",
        "road",
        "roads",
        "traffic",
        "congestion",
        "infrastructure",
        "engineering",
        "gis"
    ],

    Healthcare: [
        "healthcare",
        "health",
        "hospital",
        "doctor",
        "medicine",
        "telemedicine",
        "specialist",
        "primary care"
    ],

    Education: [
        "education",
        "school",
        "teacher",
        "student",
        "learning",
        "digital education",
        "computer science"
    ],

    Environment: [
        "environment",
        "environmental",
        "climate",
        "air pollution",
        "groundwater",
        "watershed",
        "solid waste",
        "green cover"
    ],

    Agriculture: [
        "agriculture",
        "farmer",
        "farmers",
        "farming",
        "irrigation",
        "drip",
        "rainwater harvesting",
        "doba",
        "soil",
        "crop",
        "vegetable",
        "cultivation",
        "water conservation",
        "livelihoods",
        "fpo"
    ],

    Electricity: [
        "electricity",
        "energy",
        "power",
        "solar",
        "renewable energy",
        "smart meter"
    ],

    "Public Safety": [
        "crime",
        "safety",
        "police",
        "cybercrime",
        "disaster",
        "emergency",
        "cctv"
    ],

    "Waste Management": [
        "waste",
        "garbage",
        "plastic",
        "landfill",
        "recycling",
        "solid waste",
        "wastewater"
    ],

    Other: [
        "digital",
        "data",
        "technology",
        "inequality",
        "climate",
        "environment"
    ]
};

const normalise = (text) => {
    return String(text || "")
        .toLowerCase()
        .replace(/[–—]/g, "-")
        .trim();
};


/**
 * Find solutions relevant to the AI category
 * and complaint description.
 */
const findSolutions = (category, description = "") => {
    try {
        const solutions = JSON.parse(
            fs.readFileSync(solutionsFile, "utf-8")
        );

        const normalizedDescription = normalise(description);

        const categorySolutions = solutions.filter(
            (solution) =>
                normalise(solution.Domain) === normalise(category)
        );

        if (categorySolutions.length === 0) {
            return [];
        }

        /*
         * Score solutions based on how many words from the
         * problem title / solution title appear in the complaint.
         */
        const scoredSolutions = categorySolutions.map((solution) => {
            const searchableText = normalise(
                `${solution["Problem title"]} ${solution["Solution title"]}`
            );

            const keywords = searchableText
                .split(/[^a-z0-9]+/)
                .filter((word) => word.length >= 4);

            let score = 0;

            keywords.forEach((keyword) => {
                if (normalizedDescription.includes(keyword)) {
                    score++;
                }
            });

            return {
                solution,
                score
            };
        });

        scoredSolutions.sort((a, b) => b.score - a.score);

        /*
         * Return the best 3 solutions.
         * If nothing matches specifically, return up to 3
         * solutions from the same category.
         */
        const matchedSolutions = scoredSolutions
            .filter((item) => item.score > 0)
            .slice(0, 3)
            .map((item) => item.solution);

        if (matchedSolutions.length > 0) {
            return matchedSolutions;
        }

        return categorySolutions.slice(0, 3);

    } catch (error) {
        console.error(
            "Solution routing error:",
            error.message
        );

        return [];
    }
};


/**
 * Find the best institution from institutions.json
 * using category expertise.
 */
const findInstitution = (category) => {
    try {
        const institutions = JSON.parse(
            fs.readFileSync(institutionsFile, "utf-8")
        );

        const requiredKeywords =
            routingKeywords[category] ||
            routingKeywords["Other"];

        let bestInstitution = null;
        let bestScore = 0;
        let bestMatches = [];

        institutions.forEach((institution) => {
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
            return null;
        }

        return {
            institutionId: bestInstitution["ID"],
            institution: bestInstitution["Institution"],
            college: bestInstitution["Institution"],
            district: bestInstitution["District"],
            matches: bestMatches
        };

    } catch (error) {
        console.error(
            "Institution routing error:",
            error.message
        );

        return null;
    }
};


/**
 * Main routing function
 */
const routeProblem = (
    category,
    location = "",
    description = ""
) => {

    const solutions = findSolutions(
        category,
        description
    );

    const institutionResult =
        findInstitution(category);

    /*
     * No institution found
     */
    if (!institutionResult) {
        return {
            institutionId: null,
            institution: null,
            college: null,
            solutions,
            reason:
                solutions.length > 0
                    ? "Relevant solutions were found, but no suitable institution was found. Manual review required."
                    : "No suitable institution or solution was found. Manual review required."
        };
    }

    const reason =
        `Selected because ${institutionResult.institution} ` +
        `has relevant expertise in ` +
        `${institutionResult.matches.join(", ")} ` +
        `and is located in ${institutionResult.district}.`;

    return {
        institutionId:
            institutionResult.institutionId,

        institution:
            institutionResult.institution,

        college:
            institutionResult.college,

        solutions,

        reason
    };
};


module.exports = {
    routeProblem
};