const colleges = require("../data/colleges.json");

const categoryToExpertise = {
    "Water & Sanitation": [
        "water management",
        "environment",
        "engineering"
    ],

    "Roads & Transport": [
        "transportation",
        "infrastructure",
        "engineering"
    ],

    "Healthcare": [
        "healthcare",
        "engineering"
    ],

    "Education": [
        "education",
        "social sciences"
    ],

    "Environment": [
        "environment",
        "geology"
    ],

    "Agriculture": [
        "environment",
        "rural development"
    ],

    "Electricity": [
        "energy",
        "engineering"
    ],

    "Public Safety": [
        "engineering",
        "computer science"
    ],

    "Waste Management": [
        "environment",
        "engineering"
    ],

    "Other": [
        "engineering"
    ]
};


const routeProblem = (category) => {

    const requiredExpertise =
        categoryToExpertise[category] || [];

    let bestCollege = null;
    let bestScore = 0;

    colleges.forEach((college) => {

        let score = 0;

        requiredExpertise.forEach((skill) => {

            if (college.expertise.includes(skill)) {
                score++;
            }

        });

        if (score > bestScore) {
            bestScore = score;
            bestCollege = college;
        }
    });


    if (!bestCollege) {

        return {
            college: "Manual Review",
            reason:
                "No suitable institution was found automatically."
        };
    }


    return {
        college: bestCollege.name,

        reason:
            `${bestCollege.name} was selected because its expertise ` +
            `matches the ${category} domain.`
    };
};


module.exports = {
    routeProblem
};