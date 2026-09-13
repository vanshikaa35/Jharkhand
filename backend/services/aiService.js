const { execFile } = require("child_process");

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
        "-H", "Content-Type: application/json",
        "-H", `Authorization: Bearer ${process.env.NVIDIA_API_KEY}`,
        "--data-binary", body,
        "--max-time", "90"
      ],
      { maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          const data = JSON.parse(stdout);

          console.log(
            "NVIDIA RAW RESPONSE:",
            JSON.stringify(data, null, 2)
          );

          if (data.error) {
            reject(
              new Error(
                `NVIDIA API error: ${data.error.message || JSON.stringify(data.error)}`
              )
            );
            return;
          }

          if (!data.choices || !data.choices[0]) {
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


const analyseProblem = async (description, location) => {

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

  try {

    console.log("Calling NVIDIA API...");

    const response = await callNvidia(prompt);

    console.log("NVIDIA API responded!");

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("NVIDIA returned empty message content.");
    }

    const result = JSON.parse(content);

    return result;

  } catch (error) {

    console.error("AI ANALYSIS ERROR:", error);

    return {
      category: "Other",
      summary: description.substring(0, 100),
      confidence: 0.2,
      reason: "The AI could not confidently classify this problem."
    };
  }
};


module.exports = {
  analyseProblem
};