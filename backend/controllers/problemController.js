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


        // --------------------------------
        // DUPLICATE CHECK
        // --------------------------------

        const duplicateResult =
            await checkDuplicate(
                {
                    description,
                    location
                },
                existingProblems
            );


        // --------------------------------
        // COLLEGE ROUTING
        // --------------------------------

        const routingResult =
            routeProblem(
                aiResult.category
            );


        // --------------------------------
        // HUMAN REVIEW
        // --------------------------------

        const humanReview =
            aiResult.confidence < 0.65;


        // --------------------------------
        // CREATE NEW PROBLEM
        // --------------------------------

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

            duplicateCount:
                duplicateResult.duplicateFound
                    ? 1
                    : 0,

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

module.exports = {
  createProblem,
  getProblems,
  getProblemById
};
