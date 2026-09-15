const API_URL = "http://localhost:5000/api";


export async function submitProblem(description, location) {
  const response = await fetch(
    `${API_URL}/problems`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        description,
        location,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to submit problem."
    );
  }

  return data;
}


export async function getProblems() {
  const response = await fetch(
    `${API_URL}/problems`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch problems."
    );
  }

  return data;
}


export async function getProblemStats() {
  const response = await fetch(
    `${API_URL}/problems/stats`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch problem statistics."
    );
  }

  return data;
}