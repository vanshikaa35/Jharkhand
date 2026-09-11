const express = require("express");

const {
  createProblem,
  getProblems,
  getProblemById,
  getProblemStats,
  updateProblemStatus
} = require("../controllers/problemController");

const router = express.Router();

router.post("/", createProblem);

router.get("/", getProblems);

router.get("/stats", getProblemStats);

router.patch("/:id/status", updateProblemStatus);

router.get("/:id", getProblemById);


module.exports = router;