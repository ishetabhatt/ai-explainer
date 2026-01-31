const analyzeBtn = document.getElementById("analyzeBtn");
const userInput = document.getElementById("userInput");
const result = document.getElementById("result");
const steps = document.getElementById("steps");

// Debounce function to prevent rapid clicks
let isAnalyzing = false;

analyzeBtn.addEventListener("click", async () => {
  // Prevent multiple simultaneous requests
  if (isAnalyzing) {
    return;
  }

  const text = userInput.value.trim();
  
  // Validate input
  if (!text) {
    result.textContent = "Please type something first 🙂";
    result.style.color = "#666";
    return;
  }

  if (text.length > 5000) {
    result.textContent = "Text too long! Please keep it under 5000 characters.";
    result.style.color = "#e74c3c";
    return;
  }

  // Set loading state
  isAnalyzing = true;
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  result.textContent = "Thinking...";
  result.style.color = "#666";
  steps.classList.add("hidden");

  try {
    const response = await fetch("/api/sentiment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error response:", data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    console.log("API response:", data);
    
   const sentimentEmoji = {
  positive: '😊',
  negative: '😞',
  neutral: '😐',
  mixed: '🤔',
  unclear: '❓'  // Add this
};

const sentimentColor = {
  positive: '#27ae60',
  negative: '#e74c3c',
  neutral: '#95a5a6',
  mixed: '#f39c12',
  unclear: '#95a5a6'  // Add this
};

    const confidenceText = data.confidence ? ` (${data.confidence} confidence)` : '';
    result.innerHTML = `
      ${sentimentEmoji[data.sentiment]} <strong>Sentiment: ${data.sentiment}</strong><br>
      Score: ${data.score}${confidenceText}<br>
      <small>Analyzed ${data.analysis.wordCount} words 
      (${data.analysis.positiveWords} positive, ${data.analysis.negativeWords} negative)</small>
    `;
    result.style.color = sentimentColor[data.sentiment];
    
    steps.classList.remove("hidden");
    
  } catch (err) {
    console.error("Error:", err);
    result.textContent = `Error: ${err.message}`;
    result.style.color = "#e74c3c";
  } finally {
    // Reset button state
    isAnalyzing = false;
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Ask the AI";
  }
});

// Optional: Add Enter key support
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    analyzeBtn.click();
  }
});

// Replace the character counter section with this:
userInput.addEventListener("input", () => {
  const length = userInput.value.length;
  const maxLength = 5000;
  
  // Always show counter if text exists
  if (length > 0) {
    if (!document.getElementById("charCounter")) {
      const counter = document.createElement("small");
      counter.id = "charCounter";
      counter.style.display = "block";
      counter.style.marginTop = "5px";
      userInput.parentElement.insertBefore(counter, userInput.nextSibling);
    }
    
    const remaining = maxLength - length;
    const counter = document.getElementById("charCounter");
    
    if (remaining < 0) {
      counter.textContent = `⚠️ Text is ${Math.abs(remaining)} characters too long!`;
      counter.style.color = "#e74c3c";
      analyzeBtn.disabled = true;
      analyzeBtn.style.opacity = "0.5";
      analyzeBtn.style.cursor = "not-allowed";
    } else if (remaining < 500) {
      counter.textContent = `${remaining} characters remaining`;
      counter.style.color = remaining < 100 ? "#e74c3c" : "#f39c12";
      analyzeBtn.disabled = false;
      analyzeBtn.style.opacity = "1";
      analyzeBtn.style.cursor = "pointer";
    } else {
      counter.textContent = `${length} / ${maxLength} characters`;
      counter.style.color = "#666";
      analyzeBtn.disabled = false;
      analyzeBtn.style.opacity = "1";
      analyzeBtn.style.cursor = "pointer";
    }
  } else {
    // Remove counter if text is empty
    if (document.getElementById("charCounter")) {
      document.getElementById("charCounter").remove();
      analyzeBtn.disabled = false;
      analyzeBtn.style.opacity = "1";
      analyzeBtn.style.cursor = "pointer";
    }
  }
});