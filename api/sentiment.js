export default async function handler(req, res) {
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

    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'love', 'happy', 'joy', 'beautiful', 'perfect', 'best', 'awesome',
      'brilliant', 'nice', 'pleased', 'delighted', 'excited', 'enjoy',
      'thank', 'thanks', 'appreciated', 'glad', 'superb', 'outstanding'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad',
      'angry', 'upset', 'disappointing', 'disappointed', 'poor', 'useless',
      'disgusting', 'annoying', 'frustrating', 'frustrated', 'stupid',
      'waste', 'regret', 'sorry', 'unfortunately', 'problem', 'issue'
    ];

    const lowerText = text.toLowerCase();
    const words = lowerText.match(/\b\w+\b/g) || [];
    
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    });
    
    let sentimentLabel = 'neutral';
    if (score > 0) sentimentLabel = 'positive';
    if (score < 0) sentimentLabel = 'negative';
    
    return res.status(200).json({ 
      sentiment: sentimentLabel,
      score: score
    });
  } catch (error) {
    console.error('Sentiment error:', error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}