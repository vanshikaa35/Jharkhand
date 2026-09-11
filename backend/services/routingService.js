const fs = require("fs");
const path = require("path");

const linksFile = path.join(__dirname, "../data/links.json");
const solutionsFile = path.join(__dirname, "../data/solutions.json");
const institutionsFile = path.join(__dirname, "../data/institutions.json");

const routeProblem = (category) => {
  try {
    const links = JSON.parse(
      fs.readFileSync(linksFile, "utf-8")
    );

    const solutions = JSON.parse(
      fs.readFileSync(solutionsFile, "utf-8")
    );

    const institutions = JSON.parse(
      fs.readFileSync(institutionsFile, "utf-8")
    );

    // Find links matching the AI-generated category
    const matchingLinks = links.filter(
      (link) =>
        link.domain.toLowerCase() === category.toLowerCase()
    );

    // If no direct links exist, use expertise-based fallback
    if (matchingLinks.length === 0) {
      return {
        college: null,
        solutions: [],
        reason:
          "No directly linked solution was found for this category. Manual review required."
      };
    }

    // Get recommended solutions
    const recommendedSolutions = matchingLinks
      .map((link) => {
        const solution = solutions.find(
          (item) => item.solution_id === link.solution_id
        );

        if (!solution) return null;

        return {
          id: solution.solution_id,
          title: solution.title,
          description: solution.description,
          transferability: solution.transferability
        };
      })
      .filter(Boolean);

    // Pick the institution from the strongest matching link
    const bestLink = matchingLinks[0];

    const institution = institutions.find(
      (item) => item.institution_id === bestLink.institution_id
    );

    if (!institution) {
      return {
        college: null,
        solutions: recommendedSolutions,
        reason:
          "A relevant solution was found, but no matching institution was found."
      };
    }

    const reason =
      `Recommended because ${institution.name} has relevant expertise ` +
      `for ${category} and is associated with an existing solution ` +
      `that addresses this type of problem.`;

    return {
      college: institution.name,
      solutions: recommendedSolutions,
      reason
    };

  } catch (error) {
    console.error("Routing error:", error.message);

    return {
      college: null,
      solutions: [],
      reason: "Routing failed. Manual review required."
    };
  }
};

module.exports = {
  routeProblem
};