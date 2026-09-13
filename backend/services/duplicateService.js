const OpenAI = require("openai");

const DUPLICATE_TIMEOUT = 15000;

const client = new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY
});

const checkDuplicate = async (newProblem, existingProblems) => {

    // No existing complaints
    if (!existingProblems || existingProblems.length === 0) {
        return {
            duplicateFound: false,
            duplicateOf: null,
            confidence: 0
        };
    }

    const complaints = existingProblems.map((problem, index) => ({
        index,
        id: problem.id,
        description: problem.description,
        location: problem.location
    }));

    const prompt = `
You are checking whether a new citizen complaint
refers to the same real-world problem as an existing complaint.

NEW COMPLAINT:
${newProblem.description}

NEW LOCATION:
${newProblem.location}

EXISTING COMPLAINTS:
${JSON.stringify(complaints)}

Consider a complaint a duplicate ONLY when:

1. It refers to the same underlying problem.
2. It is from approximately the same location.
3. Do NOT mark complaints as duplicates merely because
   they belong to the same category.
4. If uncertain, return duplicateFound as false.

Return ONLY valid JSON.
Do not use markdown.
Do not include explanations.

Required format:

{
  "duplicateFound": false,
  "duplicateIndex": null,
  "confidence": 0.0
}

OR:

{
  "duplicateFound": true,
  "duplicateIndex": 0,
  "confidence": 0.0
}
`;

    try {

        const response = await Promise.race([

            client.chat.completions.create({
                model: "deepseek-ai/deepseek-v4-flash-0731",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 200,
                stream: false
            }),

            new Promise((_, reject) =>
                setTimeout(
                    () => reject(
                        new Error("Duplicate detection timed out.")
                    ),
                    DUPLICATE_TIMEOUT
                )
            )
        ]);

        const rawContent =
            response?.choices?.[0]?.message?.content;

        if (!rawContent) {
            throw new Error("Empty duplicate detection response.");
        }

        console.log("DUPLICATE RAW RESPONSE:", rawContent);

        // Remove accidental markdown code fences
        const cleanedContent = rawContent
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const result = JSON.parse(cleanedContent);

        if (!result || typeof result !== "object") {
            throw new Error("Invalid duplicate detection response.");
        }

        const confidence =
            typeof result.confidence === "number"
                ? result.confidence
                : 0;

        const duplicateIndex =
            Number.isInteger(result.duplicateIndex)
                ? result.duplicateIndex
                : null;

        // Accept duplicate only with >= 75% confidence
        if (
            result.duplicateFound === true &&
            duplicateIndex !== null &&
            duplicateIndex >= 0 &&
            duplicateIndex < existingProblems.length &&
            confidence >= 0.75
        ) {

            const duplicate =
                existingProblems[duplicateIndex];

            return {
                duplicateFound: true,
                duplicateOf: duplicate.id,
                confidence
            };
        }

        return {
            duplicateFound: false,
            duplicateOf: null,
            confidence
        };

    } catch (error) {

        console.error(
            "Duplicate detection error:",
            error.message
        );

        // Safe fallback:
        // never block complaint submission because
        // duplicate detection failed.
        return {
            duplicateFound: false,
            duplicateOf: null,
            confidence: 0
        };
    }
};

module.exports = {
    checkDuplicate
};