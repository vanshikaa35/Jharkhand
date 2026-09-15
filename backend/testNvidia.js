require("dotenv").config();

async function test() {
    console.log("Starting NVIDIA test...");

    // Check whether API key exists WITHOUT printing the key
    if (!process.env.NVIDIA_API_KEY) {
        console.log("ERROR: NVIDIA_API_KEY is missing from .env");
        return;
    }

    console.log("API key found.");
    console.log("Sending request to NVIDIA...");

    try {

        const response = await fetch(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.NVIDIA_API_KEY}`
                },

                body: JSON.stringify({

                    model:
                        "deepseek-ai/deepseek-v4-flash-0731",

                    messages: [
                        {
                            role: "user",
                            content:
                                "Say hello in one sentence."
                        }
                    ],

                    temperature: 0.2,

                    max_tokens: 100,

                    stream: false
                }),

                // IMPORTANT:
                // Stop waiting after 15 seconds
                signal: AbortSignal.timeout(15000)
            }
        );


        console.log(
            "HTTP Status:",
            response.status
        );

        console.log(
            "Status Text:",
            response.statusText
        );


        // Read response as text first
        // so we can see errors even if NVIDIA
        // doesn't return valid JSON.
        const text =
            await response.text();


        console.log("\nNVIDIA RESPONSE:");

        console.log(text);


        if (response.ok) {

            console.log(
                "\n✅ NVIDIA API IS WORKING."
            );

        } else if (response.status === 401) {

            console.log(
                "\n❌ 401: API key is invalid or unauthorized."
            );

        } else if (response.status === 403) {

            console.log(
                "\n❌ 403: API key does not have access."
            );

        } else if (response.status === 429) {

            console.log(
                "\n❌ 429: RATE/USAGE LIMIT."
            );

        } else if (response.status >= 500) {

            console.log(
                "\n❌ NVIDIA SERVER ERROR."
            );

        } else {

            console.log(
                "\n❌ NVIDIA REQUEST FAILED."
            );

        }


    } catch (error) {

        console.log(
            "\nERROR TYPE:",
            error.name
        );

        console.log(
            "ERROR MESSAGE:",
            error.message
        );


        if (
            error.name ===
            "TimeoutError"
        ) {

            console.log(
                "\n❌ REQUEST TIMED OUT AFTER 15 SECONDS."
            );

            console.log(
                "This is NOT enough evidence to call it a rate-limit issue."
            );

            console.log(
                "It means NVIDIA did not respond within 15 seconds."
            );

        }

    }
}


test();