const { execFile } = require("child_process");


// ===============================
// NVIDIA API CALL
// ===============================

const callNvidia = (prompt) => {
  return new Promise((resolve, reject) => {

    const body = JSON.stringify({
      model: "deepseek-ai/deepseek-v4-flash-0731",

      messages: [
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0.2,
      max_tokens: 3000,
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
        "30"
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
  You are an AI assistant for a government citizen-problem
  crowdsourcing platform in Jharkhand.

  Analyse the following citizen complaint.

  Location:
  ${location}

  Complaint:
  ${description}

  Choose exactly ONE category from:

  - Water
  - Agriculture
  - Healthcare
  - Education
  - Environment
  - Roads & Transport
  - Electricity
  - Public Safety
  - Waste Management
  - Other

  IMPORTANT CATEGORY RULES:

  1. Agriculture:
  Choose Agriculture when the complaint is mainly related to:
  - farmers or farming
  - crops or cultivation
  - vegetable cultivation
  - irrigation for agricultural fields
  - shortage of water for crops
  - drought affecting crops
  - soil problems
  - crop productivity or yield
  - livestock or agricultural activities
  - agricultural livelihoods
  - FPOs
  - post-harvest losses
  - agricultural storage or processing

  2. Water:
  Choose Water when the complaint is mainly related to:
  - drinking water
  - contaminated or unsafe water
  - handpump problems
  - tap water
  - potable water
  - groundwater quality
  - water quality
  - water supply for households
  - sanitation-related water problems

  IMPORTANT:
  If water is being requested specifically for farming,
  irrigation, crops, or vegetable cultivation, choose Agriculture
  instead of Water.

  3. Healthcare:
  Choose Healthcare for:
  - hospitals
  - PHCs
  - doctors
  - medicines
  - disease
  - healthcare access
  - telemedicine
  - maternal or child healthcare

  4. Education:
  Choose Education for:
  - schools
  - teachers
  - students
  - classrooms
  - education facilities
  - learning

  5. Environment:
  Choose Environment for:
  - pollution
  - forests
  - climate
  - environmental degradation
  - wildlife
  - ecological problems

  6. Roads & Transport:
  Choose Roads & Transport for:
  - damaged roads
  - potholes
  - bridges
  - public transport
  - traffic
  - transportation problems

  7. Electricity:
  Choose Electricity for:
  - power cuts
  - electricity supply
  - transformers
  - electric connections
  - street electricity

  8. Public Safety:
  Choose Public Safety for:
  - crime
  - women's safety
  - accidents
  - emergency safety
  - law and order

  9. Waste Management:
  Choose Waste Management for:
  - garbage
  - waste collection
  - dumping
  - solid waste
  - sewage/waste disposal

  Use the MAIN purpose of the complaint when choosing the category.

  Return ONLY valid JSON in this exact structure:

  {
    "category": "...",
    "summary": "...",
    "confidence": 0.0,
    "reason": "..."
  }

  confidence must be a number between 0 and 1.
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