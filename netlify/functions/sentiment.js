export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Classify the sentiment of this text as exactly one word: Positive, Neutral, or Negative.\n\nText: "${text}"`,
        temperature: 0,
      }),
    });

    const data = await response.json();

    // ✅ THIS is the correct field
    const sentiment = data.output_text?.trim() || "Unknown";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentiment }),
    };
  } catch (error) {
    console.error("Sentiment error:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sentiment: "Error",
        error: error.message,
      }),
    };
  }
}
