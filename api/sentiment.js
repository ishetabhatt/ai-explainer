const Sentiment = require('sentiment');

exports.handler = async (event) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { text } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ sentiment: 'Error', error: 'No text provided' })
      };
    }

    // Run sentiment analysis
    const sentiment = new Sentiment();
    const result = sentiment.analyze(text);

    // Determine sentiment based on score
    let sentimentLabel;
    if (result.score > 0) {
      sentimentLabel = 'Positive';
    } else if (result.score < 0) {
      sentimentLabel = 'Negative';
    } else {
      sentimentLabel = 'Neutral';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sentiment: sentimentLabel,
        score: result.score,
        comparative: result.comparative
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ sentiment: 'Error', error: error.message })
    };
  }
};