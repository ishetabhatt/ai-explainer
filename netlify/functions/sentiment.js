const Sentiment = require('sentiment');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ sentiment: 'Error', error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ sentiment: 'Error', error: 'No text provided' });
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

    return res.status(200).json({
      sentiment: sentimentLabel,
      score: result.score,
      comparative: result.comparative
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ sentiment: 'Error', error: error.message });
  }
};