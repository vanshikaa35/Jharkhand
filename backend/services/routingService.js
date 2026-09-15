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

const linksFile = path.join(
    __dirname,
    "../data/links.json"
);


// ============================================
// NORMALISE TEXT
// ============================================

const normalise = (text) => {
    return String(text || "")
        .toLowerCase()
        .replace(/[–—]/g, "-")
        .replace(/[^\w\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};


// ============================================
// READ JSON SAFELY
// ============================================

const readJson = (file) => {
    try {
        return JSON.parse(
            fs.readFileSync(file, "utf-8")
        );
    } catch (error) {
        console.error(
            `Could not read ${file}:`,
            error.message
        );

        return [];
    }
};


// ============================================
// GET RESEARCH DATA
// ============================================

const getSolutions = () => {
    return readJson(solutionsFile);
};


const getLinks = () => {
    return readJson(linksFile);
};


const getInstitutions = () => {
    return readJson(institutionsFile);
};


// ============================================
// KEYWORDS FOR PROBLEM CATEGORIES
// ============================================

const routingKeywords = {

    Water: [
        "water",
        "drinking",
        "potable",
        "groundwater",
        "handpump",
        "water quality",
        "water supply",
        "water treatment",
        "contamination",
        "contaminated"
    ],

    Agriculture: [
        "agriculture",
        "farmer",
        "farmers",
        "farming",
        "crop",
        "crops",
        "cultivation",
        "vegetable",
        "irrigation",
        "drip",
        "rainwater",
        "doba",
        "soil",
        "harvest",
        "livestock",
        "fpo",
        "fertigation",
        "horticulture"
    ],

    Healthcare: [
        "health",
        "healthcare",
        "hospital",
        "doctor",
        "medicine",
        "medical",
        "phc",
        "telemedicine",
        "specialist",
        "maternal",
        "child health"
    ],

    Education: [
        "education",
        "school",
        "teacher",
        "student",
        "classroom",
        "learning",
        "digital education",
        "training"
    ],

    Environment: [
        "environment",
        "environmental",
        "pollution",
        "polluted",
        "climate",
        "forest",
        "ecological",
        "green cover",
        "air pollution",
        "waste pollution"
    ],

    "Roads & Transport": [
        "road",
        "roads",
        "pothole",
        "bridge",
        "traffic",
        "transport",
        "transportation",
        "congestion",
        "infrastructure",
        "road safety"
    ],

    Electricity: [
        "electricity",
        "electric",
        "power",
        "power cut",
        "transformer",
        "energy",
        "solar",
        "renewable",
        "smart meter"
    ],

    "Public Safety": [
        "crime",
        "safety",
        "police",
        "accident",
        "emergency",
        "women safety",
        "cybercrime",
        "disaster"
    ],

    "Waste Management": [
        "waste",
        "garbage",
        "dumping",
        "plastic",
        "landfill",
        "recycling",
        "solid waste",
        "waste collection"
    ],

    Other: []
};


// ============================================
// TOKEN MATCHING
// ============================================

const getMatchingKeywords = (
    text,
    keywords
) => {

    const normalisedText =
        normalise(text);

    return keywords.filter(
        (keyword) =>
            normalisedText.includes(
                normalise(keyword)
            )
    );
};


// ============================================
// FIND RELEVANT SOLUTIONS
// ============================================

const findSolutions = (
    category,
    description = ""
) => {

    const solutions =
        getSolutions();

    const links =
        getLinks();

    const categorySolutions =
        solutions.filter(
            (solution) =>
                normalise(solution.Domain) ===
                normalise(category)
        );

    if (
        categorySolutions.length === 0
    ) {
        return [];
    }


    const complaintText =
        normalise(description);


    // ----------------------------------------
    // SCORE SOLUTIONS
    // ----------------------------------------

    const scoredSolutions =
        categorySolutions.map(
            (solution) => {

                const problemTitle =
                    normalise(
                        solution["Problem title"]
                    );

                const solutionTitle =
                    normalise(
                        solution["Solution title"]
                    );

                const searchableText =
                    `${problemTitle} ${solutionTitle}`;


                const words =
                    searchableText
                        .split(/\s+/)
                        .filter(
                            (word) =>
                                word.length >= 4
                        );


                let score = 0;


                // Direct word matches
                words.forEach(
                    (word) => {

                        if (
                            complaintText.includes(
                                word
                            )
                        ) {
                            score++;
                        }

                    }
                );


                // Category keyword matches
                const categoryMatches =
                    getMatchingKeywords(
                        complaintText,
                        routingKeywords[
                            category
                        ] || []
                    );

                score +=
                    categoryMatches.length * 2;


                // --------------------------------
                // CONNECT THROUGH links.json
                // --------------------------------

                const linkedEntries =
                    links.filter(
                        (link) =>
                            normalise(
                                link.solution_name
                            ) ===
                            normalise(
                                solution["Solution title"]
                            )
                    );


                // Partial solution-name matching
                const partialLinkedEntries =
                    links.filter(
                        (link) => {

                            const linkName =
                                normalise(
                                    link.solution_name
                                );

                            const solutionName =
                                normalise(
                                    solution[
                                        "Solution title"
                                    ]
                                );

                            return (
                                linkName.includes(
                                    solutionName
                                ) ||
                                solutionName.includes(
                                    linkName
                                )
                            );
                        }
                    );


                const allLinkedEntries =
                    [
                        ...linkedEntries,
                        ...partialLinkedEntries
                    ];


                if (
                    allLinkedEntries.length > 0
                ) {
                    score += 3;
                }


                return {
                    solution,
                    score,
                    linkedEntries:
                        allLinkedEntries
                };

            }
        );


    // ----------------------------------------
    // SORT BEST SOLUTIONS FIRST
    // ----------------------------------------

    scoredSolutions.sort(
        (a, b) =>
            b.score - a.score
    );


    // ----------------------------------------
    // RETURN TOP 3
    // ----------------------------------------

    return scoredSolutions
        .slice(0, 3)
        .map(
            (item) => {

                const {
                    solution,
                    linkedEntries
                } = item;


                return {

                    id:
                        solution.ID,

                    problemTitle:
                        solution[
                            "Problem title"
                        ],

                    solutionTitle:
                        solution[
                            "Solution title"
                        ],

                    whereImplemented:
                        solution[
                            "Where implemented"
                        ],

                    implementer:
                        solution[
                            "Implementer"
                        ],

                    outcome:
                        solution[
                            "Outcome (short, verified)"
                        ],

                    transferability:
                        solution.Transferability,

                    sources:
                        solution.Source,

                    linkedInstitutions:
                        [
                            ...new Map(
                                linkedEntries.map(
                                    (link) => [
                                        link.institution_name,
                                        {
                                            name:
                                                link.institution_name,

                                            type:
                                                link.institution_type,

                                            problem:
                                                link.problem_description
                                        }
                                    ]
                                )
                            ).values()
                        ]

                };

            }
        );
};


// ============================================
// FIND INSTITUTIONS THROUGH links.json
// ============================================

const findInstitutionsFromLinks = (
    category,
    description
) => {

    const links =
        getLinks();

    const complaintText =
        normalise(description);


    const categoryKeywords =
        routingKeywords[
            category
        ] || [];


    const categoryMatches =
        getMatchingKeywords(
            complaintText,
            categoryKeywords
        );


    const relevantLinks =
        links.filter(
            (link) =>
                normalise(link.sector) ===
                normalise(category)
        );


    const scored =
        relevantLinks.map(
            (link) => {

                let score = 0;


                // Sector match
                score += 3;


                // Problem description match
                const problemMatches =
                    getMatchingKeywords(
                        complaintText,
                        normalise(
                            link.problem_description
                        ).split(/\s+/)
                    );

                score +=
                    problemMatches.length * 2;


                // Solution match
                const solutionMatches =
                    getMatchingKeywords(
                        complaintText,
                        normalise(
                            link.solution_name
                        ).split(/\s+/)
                    );

                score +=
                    solutionMatches.length;


                // General category keywords
                score +=
                    categoryMatches.length;


                return {
                    link,
                    score
                };

            }
        );


    scored.sort(
        (a, b) =>
            b.score - a.score
    );


    return scored;
};


// ============================================
// FIND BEST INSTITUTION
// ============================================

const findInstitution = (
    category,
    location,
    description
) => {

    const institutions =
        getInstitutions();


    const linkedInstitutions =
        findInstitutionsFromLinks(
            category,
            description
        );


    if (
        linkedInstitutions.length === 0
    ) {
        return null;
    }


    const candidates =
        linkedInstitutions.map(
            (item) => {

                const link =
                    item.link;


                const institution =
                    institutions.find(
                        (inst) =>
                            normalise(
                                inst.institution_name
                            ) ===
                            normalise(
                                link.institution_name
                            )
                    );


                return {
                    ...item,
                    institution
                };

            }
        );


    // ----------------------------------------
    // LOCATION BONUS
    // ----------------------------------------

    const locationText =
        normalise(location);


    candidates.forEach(
        (candidate) => {

            if (
                candidate.institution
            ) {

                const institutionText =
                    normalise(
                        JSON.stringify(
                            candidate.institution
                        )
                    );


                if (
                    locationText &&
                    institutionText.includes(
                        locationText
                    )
                ) {
                    candidate.score += 5;
                }

            }

        }
    );


    candidates.sort(
        (a, b) =>
            b.score - a.score
    );


    const best =
        candidates[0];


    if (!best) {
        return null;
    }


    const institution =
        best.institution;


    return {

        institutionId:
            institution?.ID ||
            best.link.institution_name,

        institution:
            institution?.institution_name ||
            best.link.institution_name,

        college:
            institution?.institution_name ||
            best.link.institution_name,

        district:
            institution?.district ||
            "Jharkhand / relevant jurisdiction",

        institutionType:
            institution?.institution_type ||
            best.link.institution_type,

        role:
            institution?.role ||
            "",

        matches: [
            best.link.problem_description,
            best.link.solution_name
        ],

        score:
            best.score

    };

};


// ============================================
// MAIN ROUTING FUNCTION
// ============================================

const routeProblem = (
    category,
    location = "",
    description = ""
) => {

    const solutions =
        findSolutions(
            category,
            description
        );


    const institutionResult =
        findInstitution(
            category,
            location,
            description
        );


    // ----------------------------------------
    // NO INSTITUTION
    // ----------------------------------------

    if (!institutionResult) {

        return {

            institutionId: null,

            institution: null,

            college: null,

            solutions,

            reason:
                solutions.length > 0
                    ? "Relevant research solutions were found, but no linked institution could be confidently selected. Manual review required."
                    : "No relevant research solution or institution was found. Manual review required."

        };

    }


    // ----------------------------------------
    // ROUTING REASON
    // ----------------------------------------

    const reason =
        `Selected ${institutionResult.institution} ` +
        `because it is linked to the relevant ` +
        `${category} solution/problem: ` +
        `${institutionResult.matches.join(", ")}.`;


    return {

        institutionId:
            institutionResult.institutionId,

        institution:
            institutionResult.institution,

        college:
            institutionResult.college,

        district:
            institutionResult.district,

        institutionType:
            institutionResult.institutionType,

        role:
            institutionResult.role,

        solutions,

        reason

    };

};


module.exports = {
    routeProblem,
    findSolutions,
    findInstitution
};