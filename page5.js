const analyzeBtn = document.getElementById("analyzeBtn");
const userInput = document.getElementById("userInput");
const result = document.getElementById("result");
const steps = document.getElementById("steps");

analyzeBtn.addEventListener("click", async () => {
  const text = userInput.value.trim();

  if (!text) {
    result.textContent = "Please type something first 🙂";
    return;
  }

  result.textContent = "Thinking...";
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
console.log("API response:", data);


    result.textContent = `Sentiment guessed by AI: ${data.sentiment}`;
    steps.classList.remove("hidden");
  } catch (err) {
    result.textContent = "Something went wrong. Try again.";
  }
});
