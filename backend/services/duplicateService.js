const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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


    const complaints =
        existingProblems.map((problem, index) => ({
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

Consider a complaint a duplicate only when:
1. It refers to the same underlying problem.
2. It is from approximately the same location.

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
            await client.responses.create({
                model: "gpt-5-mini",
                input: prompt
            });


        const result =
            JSON.parse(response.output_text);


        if (
            result.duplicateFound &&
            result.duplicateIndex !== null
        ) {

            const duplicate =
                existingProblems[
                    result.duplicateIndex
                ];


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