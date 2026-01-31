const Sentiment = require('sentiment');

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const sentiment = new Sentiment();
    const result = sentiment.analyze(text);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Sentiment error:', error);
    return res.status(500).json({ error: error.message });
  }
}