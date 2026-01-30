export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Classify the sentiment of the text as exactly one word: Positive, Neutral, or Negative.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0,
      }),
    });

    const data = await response.json();

    const sentiment =
      data?.choices?.[0]?.message?.content?.trim() ?? "Unknown";

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
