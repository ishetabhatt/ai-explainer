export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid text provided' });
    }

    // Limit text length to prevent abuse
    const maxLength = 5000;
    if (text.length > maxLength) {
      return res.status(400).json({ 
        error: `Text too long. Maximum ${maxLength} characters allowed.` 
      });
    }

    // Trim whitespace
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      return res.status(400).json({ error: 'Text cannot be empty' });
    }

    // Enhanced word lists with weights
    const sentimentWords = {
      positive: {
        // Strong positive (weight: 2)
        strong: ['amazing', 'excellent', 'outstanding', 'fantastic', 'wonderful', 
                 'brilliant', 'spectacular', 'magnificent', 'superb', 'phenomenal',
                 'exceptional', 'perfect', 'incredible', 'fabulous'],
        // Moderate positive (weight: 1)
        moderate: ['good', 'great', 'nice', 'happy', 'love', 'like', 'enjoy',
                   'pleasant', 'beautiful', 'lovely', 'glad', 'pleased', 'delighted',
                   'excited', 'thank', 'thanks', 'appreciated', 'approve', 'best',
                   'better', 'awesome', 'cool', 'fine', 'positive', 'success',
                   'successful', 'win', 'winner', 'helpful', 'effective']
      },
      negative: {
        // Strong negative (weight: -2)
        strong: ['terrible', 'awful', 'horrible', 'worst', 'disgusting', 'hate',
                 'despise', 'atrocious', 'dreadful', 'appalling', 'abysmal'],
        // Moderate negative (weight: -1)
        moderate: ['bad', 'sad', 'angry', 'upset', 'disappointing', 'disappointed',
                   'poor', 'useless', 'annoying', 'frustrating', 'frustrated',
                   'stupid', 'waste', 'regret', 'sorry', 'unfortunately', 'problem',
                   'issue', 'fail', 'failed', 'failure', 'wrong', 'negative',
                   'weak', 'worse', 'difficult', 'hard', 'confusing', 'confused']
      }
    };

    // Intensifiers and negations
    const intensifiers = ['very', 'really', 'extremely', 'absolutely', 'totally', 
                          'completely', 'utterly', 'highly', 'so', 'super'];
    const negations = ['not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither',
                       'nowhere', 'hardly', 'barely', 'scarcely', "don't", "doesn't",
                       "didn't", "won't", "wouldn't", "shouldn't", "couldn't", "can't"];

    // Normalize and tokenize text
    const lowerText = trimmedText.toLowerCase();
    // Match words, including contractions
    const words = lowerText.match(/\b[\w']+\b/g) || [];
    
    if (words.length === 0) {
      return res.status(400).json({ error: 'No valid words found in text' });
    }

    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    const detectedWords = [];

    // Analyze sentiment with context awareness
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : null;
      
      let wordScore = 0;
      let wordType = null;

      // Check for positive words
      if (sentimentWords.positive.strong.includes(word)) {
        wordScore = 2;
        wordType = 'positive';
        positiveCount++;
      } else if (sentimentWords.positive.moderate.includes(word)) {
        wordScore = 1;
        wordType = 'positive';
        positiveCount++;
      }
      // Check for negative words
      else if (sentimentWords.negative.strong.includes(word)) {
        wordScore = -2;
        wordType = 'negative';
        negativeCount++;
      } else if (sentimentWords.negative.moderate.includes(word)) {
        wordScore = -1;
        wordType = 'negative';
        negativeCount++;
      }

      // Apply modifiers if sentiment word found
      if (wordScore !== 0) {
        // Check for intensifier before the word
        if (prevWord && intensifiers.includes(prevWord)) {
          wordScore = wordScore * 1.5;
        }

        // Check for negation before the word (flips and reduces magnitude)
        if (prevWord && negations.includes(prevWord)) {
          wordScore = wordScore * -0.75;
          wordType = wordType === 'positive' ? 'negative' : 'positive';
        }

        score += wordScore;
        detectedWords.push({
          word: prevWord && (intensifiers.includes(prevWord) || negations.includes(prevWord)) 
                ? `${prevWord} ${word}` 
                : word,
          type: wordType,
          weight: wordScore
        });
      }
    }

    // Determine sentiment label with confidence
    let sentimentLabel = 'neutral';
    let confidence = 'low';
    
    const normalizedScore = score / words.length; // Normalize by text length

    if (score > 0) {
      sentimentLabel = 'positive';
      if (normalizedScore > 0.1) confidence = 'high';
      else if (normalizedScore > 0.05) confidence = 'medium';
    } else if (score < 0) {
      sentimentLabel = 'negative';
      if (normalizedScore < -0.1) confidence = 'high';
      else if (normalizedScore < -0.05) confidence = 'medium';
    } else {
      confidence = 'medium';
    }

    // Return comprehensive results
    return res.status(200).json({ 
      sentiment: sentimentLabel,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      confidence: confidence,
      analysis: {
        wordCount: words.length,
        positiveWords: positiveCount,
        negativeWords: negativeCount,
        detectedWords: detectedWords.slice(0, 10) // Limit to top 10 for response size
      }
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}