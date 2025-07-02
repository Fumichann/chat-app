document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("history-container");
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");

  if (history.length === 0) {
    container.innerHTML = "<p>履歴はありません。</p>";
    return;
  }

  history.forEach(entry => {
    const block = document.createElement("div");
    block.classList.add("history-entry");
    block.innerHTML = `
      <p><strong>${entry.date}</strong></p>
      <p><strong>あなた：</strong>${entry.user}</p>
      <p><strong>AI：</strong>${entry.ai}</p>
      <hr>
    `;
    container.appendChild(block);
  });
});
