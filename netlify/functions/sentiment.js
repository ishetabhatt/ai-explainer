import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  const { text } = JSON.parse(event.body);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Classify the sentiment of the user's text as Positive, Neutral, or Negative. Respond with only one word.",
      },
      { role: "user", content: text },
    ],
  });

  const sentiment = completion.choices[0].message.content;

  return {
    statusCode: 200,
    body: JSON.stringify({ sentiment }),
  };
}
