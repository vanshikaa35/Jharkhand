const { execFile } = require("child_process");


// ===============================
// NVIDIA API CALL
// ===============================

const callNvidia = (prompt) => {
  return new Promise((resolve, reject) => {

    const body = JSON.stringify({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.2,
      max_tokens: 500,
      stream: false
    });


    console.log(
      "NVIDIA KEY AVAILABLE:",
      !!process.env.NVIDIA_API_KEY,
      "LENGTH:",
      process.env.NVIDIA_API_KEY
        ? process.env.NVIDIA_API_KEY.length
        : 0
    );


    execFile(
      "curl.exe",

      [
        "https://integrate.api.nvidia.com/v1/chat/completions",

        "-H",
        "Content-Type: application/json",

        "-H",
        `Authorization: Bearer ${process.env.NVIDIA_API_KEY}`,

        "--data-binary",
        body,

        "--connect-timeout",
        "10",

        "--max-time",
        "90"
      ],

      {
        maxBuffer: 1024 * 1024
      },

      (error, stdout, stderr) => {

        // ===============================
        // CURL ERROR
        // ===============================

        if (error) {

          console.error(
            "NVIDIA CURL ERROR:",
            error.message
          );

          console.error(
            "NVIDIA CURL STDERR:",
            stderr
          );

          reject(error);
          return;
        }


        // ===============================
        // PARSE NVIDIA RESPONSE
        // ===============================

        try {

          const data = JSON.parse(stdout);


          console.log(
            "NVIDIA RAW RESPONSE:",
            JSON.stringify(data, null, 2)
          );


          // NVIDIA API returned an error
          if (data.error) {

            reject(
              new Error(
                `NVIDIA API error: ${
                  data.error.message ||
                  JSON.stringify(data.error)
                }`
              )
            );

            return;
          }


          // No choices returned
          if (
            !data.choices ||
            !data.choices[0]
          ) {

            reject(
              new Error(
                "NVIDIA response did not contain choices."
              )
            );

            return;
          }


          resolve(data);

        } catch (err) {

          reject(
            new Error(
              `Invalid NVIDIA response: ${stdout}`
            )
          );

        }

      }
    );

  });
};



// ===============================
// ANALYSE PROBLEM
// ===============================

const analyseProblem = async (
  description,
  location
) => {


  const prompt = `
  You are the AI problem-analysis engine for a citizen
  societal-innovation platform for Jharkhand, India.

  Your task is to analyse a citizen-submitted problem and classify
  it into exactly ONE predefined category.

  The citizen may write in:
  - English
  - Hindi
  - Hinglish
  - informal/local language
  - a mixture of languages

  Do NOT classify based only on individual keywords.
  Understand the MAIN PURPOSE and CONTEXT of the complaint.

  --------------------------------------------------
  CITIZEN INPUT
  --------------------------------------------------

  Location:
  ${location}

  Complaint:
  ${description}

  --------------------------------------------------
  ALLOWED CATEGORIES
  --------------------------------------------------

  You MUST choose exactly ONE of:

  1. Water
  2. Agriculture
  3. Healthcare
  4. Education
  5. Environment
  6. Roads & Transport
  7. Electricity
  8. Public Safety
  9. Waste Management
  10. Other

  Never invent a new category.

  --------------------------------------------------
  CATEGORY DEFINITIONS
  --------------------------------------------------

  WATER

  Choose Water when the MAIN problem concerns water needed
  for human/domestic use or water quality.

  Examples:
  - drinking water shortage
  - contaminated drinking water
  - dirty/unsafe water
  - broken handpump used for drinking
  - household tap water problems
  - groundwater quality
  - potable water
  - household water supply
  - sanitation-related water problems

  IMPORTANT:
  If water is primarily needed for crops, farming, irrigation,
  vegetable cultivation, livestock or agricultural production,
  choose AGRICULTURE instead.

  --------------------------------------------------

  AGRICULTURE

  Choose Agriculture when the MAIN problem concerns farming,
  agricultural livelihoods, crops, livestock or agricultural
  production.

  Examples:
  - farmers or farming
  - crop cultivation
  - vegetable cultivation
  - irrigation for agricultural fields
  - lack of water for crops
  - drought affecting crops
  - soil problems
  - low crop productivity/yield
  - livestock
  - agricultural livelihoods
  - FPOs
  - post-harvest losses
  - agricultural storage
  - agricultural processing

  Example:
  "Farmers cannot grow vegetables because there is not enough
  water for irrigation."

  Category = Agriculture.

  --------------------------------------------------

  HEALTHCARE

  Choose Healthcare when the MAIN problem concerns healthcare
  access, medical treatment or health services.

  Examples:
  - hospitals
  - PHCs
  - doctors
  - medicines
  - disease
  - healthcare access
  - telemedicine
  - maternal healthcare
  - child healthcare
  - lack of medical facilities

  --------------------------------------------------

  EDUCATION

  Choose Education when the MAIN problem concerns education,
  schools, students, teachers or learning facilities.

  Examples:
  - schools
  - teachers
  - students
  - classrooms
  - lack of educational facilities
  - learning resources
  - digital education
  - school infrastructure

  --------------------------------------------------

  ENVIRONMENT

  Choose Environment when the MAIN problem concerns environmental
  damage or ecological conditions.

  Examples:
  - air pollution
  - environmental pollution
  - forest degradation
  - climate-related environmental problems
  - wildlife
  - ecological damage
  - loss of green cover
  - environmental degradation

  IMPORTANT ENVIRONMENT vs WATER RULE:

  If water is mentioned because it is being POLLUTED, CONTAMINATED,
  or environmentally damaged by industrial activity, sewage,
  chemicals, dumping, or pollution, classify the complaint as
  ENVIRONMENT.

  Choose WATER when the primary problem is ACCESS TO, AVAILABILITY
  OF, or QUALITY OF WATER FOR HUMAN/DOMESTIC USE.

  Examples:

  "Factory is polluting the river."
  → Environment

  "Industrial waste is being released into the river."
  → Environment

  "River water is becoming polluted because of factory waste."
  → Environment

  "Chemical pollution is affecting the river."
  → Environment

  "Peene ka paani ganda aa raha hai."
  → Water

  "Gaon mein drinking water nahi mil raha."
  → Water

  "Handpump ka paani contaminated hai."
  → Water

  The presence of the words "water", "paani", "river", or "nadi"
  MUST NOT automatically result in the Water category.

  Determine whether the complaint is primarily about:
  A) people obtaining/using water → WATER
  OR
  B) pollution/environmental damage affecting a water body → ENVIRONMENT.

  --------------------------------------------------

  ROADS & TRANSPORT

  Choose Roads & Transport when the MAIN problem concerns physical
  transport infrastructure or transportation.

  Examples:
  - damaged roads
  - potholes
  - broken bridges
  - unsafe roads
  - public transport
  - traffic
  - congestion
  - transportation access
  - road infrastructure

  --------------------------------------------------

  ELECTRICITY

  Choose Electricity when the MAIN problem concerns electricity,
  power supply or electrical infrastructure.

  Examples:
  - power cuts
  - unreliable electricity
  - electricity supply
  - transformers
  - electric connections
  - street electricity
  - electricity infrastructure
  - renewable-energy/electricity access problems

  --------------------------------------------------

  PUBLIC SAFETY

  Choose Public Safety when the MAIN problem concerns immediate
  public safety, crime, accidents, emergency response or law
  and order.

  Examples:
  - crime
  - women's safety
  - unsafe public areas
  - accidents
  - emergency safety
  - police/law-and-order issues
  - disaster-related public safety

  --------------------------------------------------

  WASTE MANAGEMENT

  Choose Waste Management when the MAIN problem concerns waste
  generation, collection, dumping, disposal or recycling.

  Examples:
  - garbage
  - garbage collection
  - waste collection
  - illegal dumping
  - solid waste
  - plastic waste
  - landfill
  - recycling
  - waste disposal

  --------------------------------------------------

  OTHER

  Choose Other ONLY when the complaint genuinely does not fit
  any of the nine defined categories.

  Before selecting Other, carefully reconsider whether the
  complaint can reasonably be classified as Water, Agriculture,
  Healthcare, Education, Environment, Roads & Transport,
  Electricity, Public Safety, or Waste Management.

  Do NOT use Other simply because the complaint is ambiguous,
  informal, written in Hindi/Hinglish, or contains multiple
  keywords.

  If the complaint clearly describes environmental pollution,
  ecological damage, or pollution of a river/lake/forest/land,
  choose Environment rather than Other.

  --------------------------------------------------
  IMPORTANT DECISION RULES
  --------------------------------------------------

  RULE 1:
  Classify according to the MAIN PURPOSE of the complaint,
  not the most frequently mentioned word.

  RULE 2:
  Water for farming/crops/irrigation = Agriculture.

  Drinking/domestic water/water quality = Water.

  RULE 3:
  Garbage collection/disposal/dumping = Waste Management.

  Pollution/ecological/environmental damage = Environment.

  RULE 4:
  A complaint may mention multiple issues.
  Choose the category representing the PRIMARY problem.

  RULE 5:
  Do not invent facts that are not present in the complaint.

  RULE 6:
  The location should NOT determine the category unless the
  complaint itself provides relevant context.

  RULE 7:
  Hindi/Hinglish expressions must be understood semantically.

  For example:
  "gaon mein peene ka paani ganda aa raha hai"
  means contaminated drinking water → Water.

  "fasal ke liye paani nahi mil raha"
  means lack of agricultural water → Agriculture.

  RULE 8:
  Confidence represents how certain you are about the category,
  not how serious the problem is.

  Use:
  0.90–1.00 = very clear classification
  0.75–0.89 = strong classification with minor ambiguity
  0.60–0.74 = reasonably likely but ambiguous
  below 0.60 = highly ambiguous / insufficient information

  Do NOT automatically give 1.0.

  --------------------------------------------------
  SUMMARY
  --------------------------------------------------

  Write a concise summary of the citizen's actual problem.

  The summary should:
  - preserve the important facts
  - be understandable to a government/university reviewer
  - NOT invent information
  - be approximately 1–2 sentences

  --------------------------------------------------
  REASON
  --------------------------------------------------

  Explain briefly why the selected category is the best match.

  Mention the main issue/context that led to the classification.

  Do NOT simply repeat the category name.

  --------------------------------------------------
  OUTPUT FORMAT
  --------------------------------------------------

  Return ONLY valid JSON.

  Do not include:
  - Markdown
  - code fences
  - explanations outside JSON
  - introductory text
  - trailing text

  Use exactly this structure:

  {
    "category": "one allowed category",
    "summary": "concise problem summary",
    "confidence": 0.00,
    "reason": "brief explanation for the classification"
  }

  The category MUST exactly match one of the allowed category names.

  The confidence MUST be a JSON number between 0 and 1.

  The output MUST be valid JSON.
  `;

  // ===============================
  // CALL AI
  // ===============================

  try {

    console.log(
      "Calling NVIDIA API..."
    );


    const response =
      await callNvidia(prompt);


    console.log(
      "NVIDIA API responded!"
    );


    const content =
      response.choices[0].message.content;


    if (!content) {

      throw new Error(
        "NVIDIA returned empty message content."
      );

    }


    console.log(
      "AI RAW CONTENT:",
      content
    );


    // ===============================
    // CLEAN JSON RESPONSE
    // ===============================

    let cleanedContent =
      content.trim();


    if (
      cleanedContent.startsWith("```")
    ) {

      cleanedContent =
        cleanedContent
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


    // ===============================
    // PARSE JSON
    // ===============================

    const result =
      JSON.parse(cleanedContent);


    // ===============================
    // VALIDATE RESULT
    // ===============================

    const validCategories = [
      "Water",
      "Agriculture",
      "Healthcare",
      "Education",
      "Environment",
      "Roads & Transport",
      "Electricity",
      "Public Safety",
      "Waste Management",
      "Other"
    ];


    if (
      !result.category ||
      !validCategories.includes(
        result.category
      )
    ) {

      throw new Error(
        "AI returned an invalid category."
      );

    }


    if (
      typeof result.confidence !==
      "number"
    ) {

      throw new Error(
        "AI returned invalid confidence."
      );

    }


    return result;

  } catch (error) {

    // ===============================
    // NVIDIA FALLBACK
    // ===============================

    console.error(
      "AI ANALYSIS ERROR:",
      error.message
    );


    const text =
      `${description} ${location}`
        .toLowerCase();


    // ===============================
    // KEYWORDS
    // ===============================

    const agricultureKeywords = [
      "farmer",
      "farmers",
      "farming",
      "crop",
      "crops",
      "cultivation",
      "vegetable",
      "vegetables",
      "irrigation",
      "agriculture",
      "agricultural",
      "field",
      "fields",
      "harvest",
      "soil",
      "livestock",
      "fpo",
      "drought"
    ];


    const waterKeywords = [
      "drinking water",
      "potable water",
      "tap water",
      "handpump",
      "water supply",
      "water quality",
      "contaminated water",
      "unsafe water",
      "groundwater quality"
    ];


    const healthcareKeywords = [
      "hospital",
      "doctor",
      "medicine",
      "phc",
      "healthcare",
      "health",
      "telemedicine"
    ];


    const educationKeywords = [
      "school",
      "teacher",
      "student",
      "classroom",
      "education"
    ];


    // ===============================
    // MATCH KEYWORDS
    // ===============================

    const agricultureMatch =
      agricultureKeywords.some(
        (keyword) =>
          text.includes(keyword)
      );


    const waterMatch =
      waterKeywords.some(
        (keyword) =>
          text.includes(keyword)
      );


    const healthcareMatch =
      healthcareKeywords.some(
        (keyword) =>
          text.includes(keyword)
      );


    const educationMatch =
      educationKeywords.some(
        (keyword) =>
          text.includes(keyword)
      );


    // ===============================
    // AGRICULTURE FALLBACK
    // ===============================

    if (
      agricultureMatch &&
      !waterMatch
    ) {

      console.log(
        "LOCAL FALLBACK: Agriculture"
      );


      return {
        category: "Agriculture",

        summary:
          description.substring(
            0,
            100
          ),

        confidence: 0.85,

        reason:
          "NVIDIA AI was unavailable, so the complaint was classified using local category rules."
      };

    }


    // ===============================
    // WATER FALLBACK
    // ===============================

    if (
      waterMatch &&
      !agricultureMatch
    ) {

      console.log(
        "LOCAL FALLBACK: Water"
      );


      return {
        category: "Water",

        summary:
          description.substring(
            0,
            100
          ),

        confidence: 0.85,

        reason:
          "NVIDIA AI was unavailable, so the complaint was classified using local category rules."
      };

    }


    // ===============================
    // HEALTHCARE FALLBACK
    // ===============================

    if (healthcareMatch) {

      console.log(
        "LOCAL FALLBACK: Healthcare"
      );


      return {
        category: "Healthcare",

        summary:
          description.substring(
            0,
            100
          ),

        confidence: 0.85,

        reason:
          "NVIDIA AI was unavailable, so the complaint was classified using local category rules."
      };

    }


    // ===============================
    // EDUCATION FALLBACK
    // ===============================

    if (educationMatch) {

      console.log(
        "LOCAL FALLBACK: Education"
      );


      return {
        category: "Education",

        summary:
          description.substring(
            0,
            100
          ),

        confidence: 0.85,

        reason:
          "NVIDIA AI was unavailable, so the complaint was classified using local category rules."
      };

    }


    // ===============================
    // FINAL FALLBACK
    // ===============================

    return {
      category: "Other",

      summary:
        description.substring(
          0,
          100
        ),

      confidence: 0.2,

      reason:
        "The AI service was unavailable and no local category rule matched the complaint."
    };

  }

};


// ===============================
// EXPORT
// ===============================

module.exports = {
  analyseProblem
};