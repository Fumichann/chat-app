document.addEventListener("DOMContentLoaded", () => {
  const mainScreen = document.getElementById("main-screen");

  // 表示
  mainScreen.style.display = "flex";

  // メイン画面のボタンにクリックイベントを追加
  document.querySelectorAll(".link-button").forEach(button => {
    button.addEventListener("click", function (event) {
      event.stopPropagation(); // 背景のクリックイベントを無効にする
      const url = this.dataset.link;
      window.location.href = url;
    });
  });
});
