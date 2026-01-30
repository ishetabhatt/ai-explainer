module.exports.handler = async function (event) {
  try {
    const { text } = JSON.parse(event.body);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const data = await response.json();

    // Hugging Face can return:
    // 1) [{ label: "POSITIVE", score: 0.99 }]
    // 2) [[{ label: "POSITIVE", score: 0.99 }]]
    // 3) { error: "...", estimated_time: ... }

    let label;

    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        label = data[0][0]?.label;
      } else {
        label = data[0]?.label;
      }
    }

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sentiment: "Error",
        error: error.message,
      }),
    };
  }
};
