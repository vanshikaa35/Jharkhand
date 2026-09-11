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
      max_tokens: 1000,
      stream: false
    });

    execFile(
      "curl.exe",
      [
        "https://integrate.api.nvidia.com/v1/chat/completions",
        "-H", "Content-Type: application/json",
        "-H", `Authorization: Bearer ${process.env.NVIDIA_API_KEY}`,
        "--data-binary", body
      ],
      { maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error("Invalid NVIDIA response"));
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

    const result = JSON.parse(
      response.choices[0].message.content
    );

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