import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Classify the sentiment of the user's text as exactly one of these words: Positive, Neutral, or Negative. Respond with only that one word.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0,
    });

    const sentiment =
      completion.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sentiment: sentiment || "Unknown",
      }),
    };
  } catch (error) {
    console.error("Sentiment function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sentiment: "Error",
        error: error.message,
      }),
    };
  }
}
