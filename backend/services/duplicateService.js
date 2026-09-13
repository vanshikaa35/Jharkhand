const OpenAI = require("openai");


// =====================================
// NVIDIA CLIENT
// =====================================

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY
});


// =====================================
// DUPLICATE TIMEOUT
// =====================================

const DUPLICATE_TIMEOUT = 10000;


// =====================================
// NORMALIZE TEXT
// =====================================

const normalizeText = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};


// =====================================
// LOCAL DUPLICATE CHECK
// =====================================

const localDuplicateCheck = (
  newProblem,
  existingProblems
) => {

  const newDescription =
    normalizeText(newProblem.description);

  const newLocation =
    normalizeText(newProblem.location);


  for (const problem of existingProblems) {

    const oldDescription =
      normalizeText(problem.description);

    const oldLocation =
      normalizeText(problem.location);


    // Exact same complaint + location
    if (
      newDescription === oldDescription &&
      newLocation === oldLocation
    ) {

      return {
        duplicateFound: true,
        duplicateOf: problem.id,
        confidence: 1
      };

    }

  }


  return {
    duplicateFound: false,
    duplicateOf: null,
    confidence: 0
  };

};


// =====================================
// AI DUPLICATE CHECK
// =====================================

const aiDuplicateCheck = async (
  newProblem,
  existingProblems
) => {

  const complaints =
    existingProblems.map(
      (problem, index) => ({
        index,
        id: problem.id,
        description: problem.description,
        location: problem.location
      })
    );


  const prompt = `
You are checking whether a new citizen complaint
is a duplicate of an existing complaint.

NEW COMPLAINT:
${newProblem.description}

NEW LOCATION:
${newProblem.location}

EXISTING COMPLAINTS:
${JSON.stringify(complaints)}

A complaint is a duplicate only when it describes
essentially the same problem in the same or very
similar location.

Return ONLY valid JSON:

{
  "duplicateFound": true,
  "duplicateIndex": 0,
  "confidence": 0.0
}

OR:

{
  "duplicateFound": false,
  "duplicateIndex": null,
  "confidence": 0.0
}

confidence must be between 0 and 1.
`;


  try {

    const response =
      await Promise.race([

        client.chat.completions.create({

          model:
            "deepseek-ai/deepseek-v4-flash-0731",

          messages: [
            {
              role: "user",
              content: prompt
            }
          ],

          temperature: 0.1,

          max_tokens: 100,

          stream: false

        }),

        new Promise((_, reject) => {

          setTimeout(() => {

            reject(
              new Error(
                "Duplicate detection timed out."
              )
            );

          }, DUPLICATE_TIMEOUT);

        })

      ]);


    const content =
      response?.choices?.[0]?.message?.content;


    if (!content) {

      throw new Error(
        "Empty duplicate detection response."
      );

    }


    console.log(
      "DUPLICATE RAW RESPONSE:",
      content
    );


    let cleaned =
      content.trim();


    if (
      cleaned.startsWith("```")
    ) {

      cleaned =
        cleaned
          .replace(
            /^```json\s*/i,
            ""
          )
          .replace(
            /^```\s*/i,
            ""
          )
          .replace(
            /\s*```$/i,
            ""
          )
          .trim();

    }


    const result =
      JSON.parse(cleaned);


    // Validate response

    if (
      typeof result.duplicateFound !==
      "boolean"
    ) {

      throw new Error(
        "Invalid duplicateFound value."
      );

    }


    if (
      typeof result.confidence !==
      "number"
    ) {

      throw new Error(
        "Invalid duplicate confidence."
      );

    }


    // If AI found duplicate

    if (
      result.duplicateFound === true &&
      Number.isInteger(
        result.duplicateIndex
      ) &&
      result.confidence >= 0.75
    ) {

      const duplicate =
        existingProblems[
          result.duplicateIndex
        ];


      if (!duplicate) {

        throw new Error(
          "Duplicate index does not exist."
        );

      }


      return {
        duplicateFound: true,
        duplicateOf: duplicate.id,
        confidence: result.confidence
      };

    }


    // No reliable duplicate

    return {
      duplicateFound: false,
      duplicateOf: null,
      confidence:
        result.confidence
    };

  } catch (error) {

    console.error(
      "Duplicate detection error:",
      error.message
    );


    // VERY IMPORTANT:
    // Duplicate detection failure
    // must never block submission.

    return {
      duplicateFound: false,
      duplicateOf: null,
      confidence: 0
    };

  }

};


// =====================================
// MAIN DUPLICATE FUNCTION
// =====================================

const checkDuplicate = async (
  newProblem,
  existingProblems
) => {

  // No existing problems
  if (
    !existingProblems ||
    existingProblems.length === 0
  ) {

    return {
      duplicateFound: false,
      duplicateOf: null,
      confidence: 0
    };

  }


  // ===================================
  // STEP 1: LOCAL EXACT MATCH
  // ===================================

  const localResult =
    localDuplicateCheck(
      newProblem,
      existingProblems
    );


  if (
    localResult.duplicateFound
  ) {

    console.log(
      "LOCAL DUPLICATE FOUND:",
      localResult.duplicateOf
    );


    return localResult;

  }


  // ===================================
  // STEP 2: AI CHECK
  // ===================================

  return await aiDuplicateCheck(
    newProblem,
    existingProblems
  );

};


module.exports = {
  checkDuplicate
};