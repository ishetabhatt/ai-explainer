async function queryHF(text) {
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

  return response.json();
}

export async function handler(event) {
  try {
    const { text } = JSON.parse(event.body);

    let data = await queryHF(text);

    // 🟡 Model loading → wait & retry once
    if (data?.error || data?.estimated_time) {
      await new Promise(res => setTimeout(res, 4000));
      data = await queryHF(text);
    }

    // Expected success response:
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
