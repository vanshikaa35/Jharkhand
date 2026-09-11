require("dotenv").config();

async function test() {
  console.log("Starting NVIDIA test...");

  try {
    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-ai/deepseek-v4-flash-0731",
          messages: [
            {
              role: "user",
              content: "Say hello in one sentence."
            }
          ],
          temperature: 0.2,
          max_tokens: 100,
          stream: false
        })
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.log("ERROR:");
    console.log(error.message);
  }
}

test();