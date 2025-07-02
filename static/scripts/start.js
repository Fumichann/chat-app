document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");

  // 表示
  startScreen.style.display = "flex";

  // クリックで index.html に遷移
  document.addEventListener("click", () => {
    window.location.href = "/index";
  }, { once: true });
});
