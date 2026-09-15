const OpenAI = require("openai");


// =====================================
// NVIDIA CLIENT
// =====================================

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY
});


// =====================================
// SETTINGS
// =====================================

const DUPLICATE_TIMEOUT = 10000;

// Main threshold
const DUPLICATE_THRESHOLD = 0.78;

// Strong local match threshold
const LOCAL_SIMILARITY_THRESHOLD = 0.60;


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
// TOKENIZE + BASIC SEMANTIC NORMALIZATION
// =====================================

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "in",
  "on",
  "at",
  "of",
  "to",
  "for",
  "and",
  "or",
  "our",
  "their",
  "there",
  "this",
  "that",
  "have",
  "has",
  "been",
  "because",
  "with",
  "from",
  "do",
  "does",
  "not"
]);


const SYNONYMS = {
  enough: "sufficient",
  sufficient: "sufficient",

  unable: "lack",
  lacking: "lack",

  farmers: "farmer",
  vegetables: "vegetable",

  cultivation: "grow",
  growing: "grow",
  grown: "grow",

  damaged: "bad",
  badly: "bad",
  poor: "bad",
  condition: "bad",

  many: "multiple",
  several: "multiple",
  full: "multiple"
};


const normalizeWord = (word) => {

  let normalized = word.toLowerCase();


  // Convert simple plurals to singular
  if (
    normalized.length > 4 &&
    normalized.endsWith("ies")
  ) {
    normalized =
      normalized.slice(0, -3) + "y";
  } else if (
    normalized.length > 4 &&
    normalized.endsWith("s") &&
    !normalized.endsWith("ss")
  ) {
    normalized =
      normalized.slice(0, -1);
  }


  // Apply basic synonym mapping
  normalized =
    SYNONYMS[normalized] || normalized;


  return normalized;
};


const tokenize = (text) => {

  return new Set(

    normalizeText(text)
      .split(" ")

      .map(normalizeWord)

      .filter(
        (word) =>
          word.length >= 3 &&
          !STOP_WORDS.has(word)
      )

  );

};


// =====================================
// JACCARD SIMILARITY
// =====================================

const jaccardSimilarity = (
  textA,
  textB
) => {

  const tokensA =
    tokenize(textA);

  const tokensB =
    tokenize(textB);


  if (
    tokensA.size === 0 ||
    tokensB.size === 0
  ) {
    return 0;
  }


  const intersection =
    [...tokensA].filter(
      (token) =>
        tokensB.has(token)
    );


  const union =
    new Set([
      ...tokensA,
      ...tokensB
    ]);


  const jaccard =
    intersection.length /
    union.size;


  // Dice similarity gives more credit
  // when two complaints share important words.
  const dice =
    (2 * intersection.length) /
    (tokensA.size + tokensB.size);


  // Combine both measures.
  return (
    jaccard * 0.4 +
    dice * 0.6
  );

};


// =====================================
// LOCATION SIMILARITY
// =====================================

const locationSimilarity = (
  locationA,
  locationB
) => {

  const a =
    normalizeText(locationA);

  const b =
    normalizeText(locationB);


  if (!a || !b) {
    return 0;
  }


  if (a === b) {
    return 1;
  }


  if (
    a.includes(b) ||
    b.includes(a)
  ) {
    return 0.9;
  }


  return jaccardSimilarity(
    a,
    b
  );

};


// =====================================
// LOCAL SIMILARITY
// =====================================

const calculateLocalSimilarity = (
  newProblem,
  existingProblem
) => {

  const descriptionScore =
    jaccardSimilarity(
      newProblem.description,
      existingProblem.description
    );


  const locationScore =
    locationSimilarity(
      newProblem.location,
      existingProblem.location
    );


  /*
   * Description is more important than location.
   */

  const finalScore =
    (
      descriptionScore * 0.75
    ) +
    (
      locationScore * 0.25
    );


  return {
    descriptionScore,
    locationScore,
    finalScore
  };

};


// =====================================
// LOCAL DUPLICATE CHECK
// =====================================

const localDuplicateCheck = (
  newProblem,
  existingProblems
) => {

  let bestMatch = null;


  for (
    const problem of existingProblems
  ) {

    const scores =
      calculateLocalSimilarity(
        newProblem,
        problem
      );


    if (
      !bestMatch ||
      scores.finalScore >
        bestMatch.score
    ) {

      bestMatch = {

        problem,

        score:
          scores.finalScore,

        descriptionScore:
          scores.descriptionScore,

        locationScore:
          scores.locationScore

      };

    }

  }


  if (!bestMatch) {

    return {
      duplicateFound: false,
      duplicateOf: null,
      confidence: 0
    };

  }


  console.log(
    "LOCAL BEST MATCH:",
    {
      id:
        bestMatch.problem.id,

      score:
        bestMatch.score,

      descriptionScore:
        bestMatch.descriptionScore,

      locationScore:
        bestMatch.locationScore
    }
  );


  if (
    bestMatch.score >=
      LOCAL_SIMILARITY_THRESHOLD &&
    bestMatch.locationScore >= 0.5
  ) {

    return {

      duplicateFound: true,

      duplicateOf:
        bestMatch.problem.id,

      confidence:
        Math.min(
          bestMatch.score,
          0.99
        )

    };

  }


  return {

    duplicateFound: false,

    duplicateOf: null,

    confidence:
      bestMatch.score

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
        description:
          problem.description,
        location:
          problem.location
      })
    );


  const prompt = `
You are the duplicate-detection engine for
a citizen complaint platform in Jharkhand.

Determine whether the NEW COMPLAINT describes
the SAME underlying real-world problem as one
of the EXISTING COMPLAINTS.

A duplicate means:
- same underlying issue
- same or substantially overlapping location
- different wording is allowed

Examples of DUPLICATES:

New:
"Farmers cannot irrigate their fields because
there is insufficient water."

Existing:
"Vegetable farmers are suffering because their
fields do not have enough irrigation water."

These are duplicates.

Another example:

New:
"There are potholes all over the main road
in our locality."

Existing:
"Our area's main road is badly damaged and
full of potholes."

These are duplicates.

Examples that are NOT duplicates:

New:
"There is no drinking water in Ward 4."

Existing:
"The road in Ward 4 is full of potholes."

These are NOT duplicates.

New:
"Farmers do not have irrigation water."

Existing:
"Farmers are unable to sell their crops."

These are NOT duplicates.

IMPORTANT:

Do NOT mark complaints as duplicates merely
because they share a category.

Do NOT mark complaints as duplicates merely
because they mention the same general topic.

The underlying problem must be substantially
the same.

NEW COMPLAINT:
${newProblem.description}

NEW LOCATION:
${newProblem.location}

EXISTING COMPLAINTS:
${JSON.stringify(complaints)}

Return ONLY valid JSON.

If duplicate:

{
  "duplicateFound": true,
  "duplicateIndex": 0,
  "confidence": 0.90
}

If not duplicate:

{
  "duplicateFound": false,
  "duplicateIndex": null,
  "confidence": 0.20
}

Confidence must be between 0 and 1.
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

          max_tokens: 150,

          stream: false

        }),

        new Promise(
          (_, reject) => {

            setTimeout(
              () => {

                reject(
                  new Error(
                    "Duplicate detection timed out."
                  )
                );

              },
              DUPLICATE_TIMEOUT
            );

          }
        )

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


    if (
      result.duplicateFound === true &&
      Number.isInteger(
        result.duplicateIndex
      ) &&
      result.confidence >=
        DUPLICATE_THRESHOLD
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

        duplicateOf:
          duplicate.id,

        confidence:
          result.confidence

      };

    }


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
  // STEP 1: LOCAL CHECK
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
  checkDuplicate,
  normalizeText,
  jaccardSimilarity,
  calculateLocalSimilarity
};