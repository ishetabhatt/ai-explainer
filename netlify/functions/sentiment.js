export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const data = await response.json();

    // Example response:
    // [{ label: "POSITIVE", score: 0.99 }]

    const label = data?.[0]?.label;

    let sentiment = "Unknown";
    if (label === "POSITIVE") sentiment = "Positive";
    if (label === "NEGATIVE") sentiment = "Negative";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentiment }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        sentiment: "Error",
        error: error.message,
      }),
    };
  }
}
