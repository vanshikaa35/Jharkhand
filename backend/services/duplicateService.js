const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: process.env.NVIDIA_API_KEY
});

const checkDuplicate = async (
    newProblem,
    existingProblems
) => {

    // No existing complaints
    if (existingProblems.length === 0) {
        return {
            duplicateFound: false,
            duplicateOf: null,
            confidence: 0
        };
    }

    const complaints = existingProblems.map(
        (problem, index) => ({
            index,
            id: problem.id,
            description: problem.description,
            location: problem.location
        })
    );

    const prompt = `
You are checking whether a new citizen complaint
refers to the same real-world problem as an existing complaint.

NEW COMPLAINT:
${newProblem.description}

NEW LOCATION:
${newProblem.location}

EXISTING COMPLAINTS:
${JSON.stringify(complaints)}

Consider a complaint a duplicate only when:

1. It refers to the same underlying problem.

2. It is from approximately the same location.

3. Do not mark complaints as duplicates merely because they
belong to the same category. They must describe the same
or very closely related real-world incident/problem.

4. If you are uncertain, return duplicateFound as false.

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
`;

    try {

        const response =
        await client.chat.completions.create({
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

        const result =
            JSON.parse(response.choices[0].message.content);

        // Only accept duplicates with >= 75% confidence
        if (
            result.duplicateFound &&
            result.duplicateIndex !== null &&
            result.confidence >= 0.75
        ) {

            const duplicate =
                existingProblems[result.duplicateIndex];

            return {
                duplicateFound: true,
                duplicateOf: duplicate.id,
                confidence: result.confidence
            };
        }

        return {
            duplicateFound: false,
            duplicateOf: null,
            confidence: result.confidence
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

module.exports = {
    checkDuplicate
};