const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

- Water & Sanitation
- Roads & Transport
- Healthcare
- Education
- Environment
- Agriculture
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

The reason should briefly explain why the complaint belongs
to the selected category.
`;

  try {
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: prompt
    });

    const result = JSON.parse(response.output_text);

    return result;

  } catch (error) {
    console.error("AI analysis error:", error.message);

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