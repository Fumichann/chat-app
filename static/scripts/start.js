document.addEventListener("DOMContentLoaded", () => {
  const fade = document.getElementById("fade-overlay");

  document.addEventListener("click", () => {
    // 1. opacity 表示状態にする
    fade.style.opacity = 1;

    // 2. フェード完了後に遷移
      setTimeout(() => {
        window.location.href = "/index";
      }, 5000); // フェード時間と合わせる
    });
  }, { once: true });

fade.addEventListener("transitionstart", () => {
  console.log("→ フェード開始、opacity:", getComputedStyle(fade).opacity);
});

fade.addEventListener("transitionend", () => {
  console.log("→ フェード完了、opacity:", getComputedStyle(fade).opacity);
});