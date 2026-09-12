const fs = require("fs");
const path = require("path");

const {
    analyseProblem
} = require("../services/aiService");

const {
    checkDuplicate
} = require("../services/duplicateService");

const {
    routeProblem
} = require("../services/routingService");


const problemsFile =
    path.join(
        __dirname,
        "../data/problems.json"
    );


// ------------------------------------
// READ PROBLEMS FROM JSON
// ------------------------------------

const readProblems = () => {

    try {

        const data =
            fs.readFileSync(
                problemsFile,
                "utf-8"
            );

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Could not read problems.json:",
            error.message
        );

        return [];
    }
};


// ------------------------------------
// SAVE PROBLEMS TO JSON
// ------------------------------------

const saveProblems = (problems) => {

    fs.writeFileSync(
        problemsFile,
        JSON.stringify(
            problems,
            null,
            2
        )
    );
};


// ------------------------------------
// CREATE PROBLEM
// ------------------------------------

const createProblem = async (req, res) => {

    try {

        const {
            description,
            location
        } = req.body;


        // Validate
        if (!description || !location) {

            return res.status(400).json({

                success: false,

                message:
                    "Description and location are required."
            });
        }


        // --------------------------------
        // READ EXISTING PROBLEMS
        // --------------------------------

        const existingProblems =
            readProblems();


        // --------------------------------
        // AI ANALYSIS
        // --------------------------------

        const aiResult =
            await analyseProblem(
                description,
                location
            );
            console.log("STEP 1: AI analysis completed");
            console.log("AI CATEGORY:", aiResult.category);


        // --------------------------------
        // DUPLICATE CHECK
        // --------------------------------

        console.log("DUPLICATE CHECK: starting");
        const duplicateResult =
            await checkDuplicate(
                {
                    description,
                    location
                },
                existingProblems
            );
        console.log("DUPLICATE CHECK: completed");


        // --------------------------------
        // COLLEGE ROUTING
        // --------------------------------

        console.log("STEP 2: Starting institution routing");
        const routingResult =
            routeProblem(
                aiResult.category
            );
        console.log("STEP 3: Institution routing completed");
        console.log("ROUTING RESULT:", routingResult);


        // --------------------------------
        // HUMAN REVIEW
        // --------------------------------

        const humanReview =
            aiResult.confidence < 0.65;


        // --------------------------------
        // CREATE NEW PROBLEM
        // --------------------------------

        // Update duplicate count of the original problem
        if (duplicateResult.duplicateFound) {
            const originalProblemIndex = existingProblems.findIndex(
                (problem) => problem.id === duplicateResult.duplicateOf
            );

            if (originalProblemIndex !== -1) {
                existingProblems[originalProblemIndex].duplicateCount =
                    (existingProblems[originalProblemIndex].duplicateCount || 0) + 1;
            }
        }

        const newProblem = {

            id:
                Date.now().toString(),

            description,

            location,

            imageUrl:
                req.file
                    ? req.file.path
                    : null,

            category:
                aiResult.category,

            summary:
                aiResult.summary,

            confidence:
                aiResult.confidence,

            duplicateFound:
                duplicateResult.duplicateFound,

            duplicateOf:
                duplicateResult.duplicateOf,

            duplicateCount: 0,

            assignedCollege:
                humanReview
                    ? null
                    : routingResult.college,

            routingReason:
                routingResult.reason,

            humanReview,

            status:
                humanReview
                    ? "under_review"
                    : "assigned",

            createdAt:
                new Date().toISOString()
        };


        // --------------------------------
        // SAVE TO JSON
        // --------------------------------

        existingProblems.push(
            newProblem
        );

        saveProblems(
            existingProblems
        );


        // --------------------------------
        // SEND RESPONSE
        // --------------------------------

        return res.status(201).json({

            success: true,

            problem: newProblem
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong while processing the complaint."
        });
    }
};


const getProblems = (req, res) => {
  try {
    const problems = readProblems();

    return res.status(200).json({
      success: true,
      count: problems.length,
      problems: problems
    });
  } catch (error) {
    console.error("Error fetching problems:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch problems."
    });
  }
};

const getProblemById = (req, res) => {
  try {
    const problems = readProblems();

    const problem = problems.find(
      (item) => item.id === req.params.id
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found."
      });
    }

    return res.status(200).json({
      success: true,
      problem: problem
    });

  } catch (error) {
    console.error("Error fetching problem:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch problem."
    });
  }
};

const getProblemStats = (req, res) => {
  try {
    const problems = readProblems();

    const totalProblems = problems.length;

    const assigned = problems.filter(
      (problem) => problem.status === "assigned"
    ).length;

    const underReview = problems.filter(
      (problem) => problem.status === "under_review"
    ).length;

    const inProgress = problems.filter(
      (problem) => problem.status === "in_progress"
    ).length;

    const solved = problems.filter(
      (problem) => problem.status === "solved"
    ).length;

    const categoryCounts = {};

    problems.forEach((problem) => {
      const category = problem.category || "Other";

      categoryCounts[category] =
        (categoryCounts[category] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalProblems,
        assigned,
        underReview,
        inProgress,
        solved,
        categoryCounts
      }
    });

  } catch (error) {
    console.error("Error fetching statistics:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not fetch problem statistics."
    });
  }
};

const updateProblemStatus = (req, res) => {
  try {
    const problems = readProblems();

    const problemIndex = problems.findIndex(
      (problem) => problem.id === req.params.id
    );

    if (problemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Problem not found."
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "under_review",
      "assigned",
      "in_progress",
      "testing",
      "solved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
        allowedStatuses
      });
    }

    problems[problemIndex].status = status;
    problems[problemIndex].updatedAt = new Date().toISOString();

    saveProblems(problems);

    return res.status(200).json({
      success: true,
      message: "Problem status updated successfully.",
      problem: problems[problemIndex]
    });

  } catch (error) {
    console.error("Error updating problem status:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not update problem status."
    });
  }
};

module.exports = {
  createProblem,
  getProblems,
  getProblemById,
  getProblemStats,
  updateProblemStatus
};
