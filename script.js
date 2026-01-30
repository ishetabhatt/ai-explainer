console.log("script.js loaded");

const buttons = document.querySelectorAll(".option");
const response = document.getElementById("response");
const nextBtn = document.getElementById("nextBtn");

// Force hide on load (extra safety)
nextBtn.style.display = "none";

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const answer = button.getAttribute("data-answer");

    if (answer === "nope") {
      response.textContent = "❌ Nope. Not quite.";
      response.style.color = "#f87171";
      nextBtn.style.display = "none";
    }

    if (answer === "yup") {
      response.textContent = "✅ Yup! That’s actually pretty close.";
      response.style.color = "#4ade80";
      nextBtn.style.display = "inline-block";
    }
  });
});

nextBtn.addEventListener("click", () => {
  window.location.href = "page3.html";
});

