document.addEventListener('DOMContentLoaded',() =>{
  const fade = document.getElementById('fade-overlay');
  const main = document.getElementById('main-screen');
  const tutorial = document.getElementById('tutorial');
  const tutorialText = document.getElementById('tutorial-text');

  // 1 フェードアウト処理
  setTimeout(() => {
    requestAnimationFrame(() => {
      fade.style.opacity = 0;

      // 完全に透明になったら非表示にする
        setTimeout(() => {
          fade.classList.add("hidden");
        }, 2000); // フェードアウト時間
    });
  }, 1000); // 黒い状態を保つ時間

// チュートリアルテキスト
const tutorialTexts = [
  "ここは誰もいない海、あなた以外誰もいない",
  "でも海の向こうには誰かいるかもしれない",
  "つながりを求めるのも、ひとりを楽しむのもあなたの自由",
  "さぁ、あなただけの海へ"
];

let currentIndex = 0;
tutorialText.textContent = tutorialTexts[currentIndex];

tutorial.addEventListener('click', () => {
  tutorialText.style.opacity = 0;

  setTimeout(() => {
    setTimeout(() => {
      currentIndex++;
      
      if (currentIndex < tutorialTexts.length) {
        // テキスト切り替え
        tutorialText.textContent = tutorialTexts[currentIndex];
        tutorialText.style.opacity = 1;
      } else {
        // 全文表示終了後、フェードアウト
        tutorial.style.opacity = 0;

        setTimeout(() => {
          tutorial.classList.add("hidden");

        // メイン画面表示
        main.classList.remove("hidden");
        requestAnimationFrame(() => {
          main.style.opacity = 1;
        });
      }, 1800); // チュートリアルフェードアウト
    }}, 400); // 文字切り替え前の待機時間
  }, 600); // テキスト切り替えまでのフェードアウト
   // localhostに保存
  localStorage.setItem('hasSeenTutorial', 'true');
});

// メイン画面のボタンにクリックイベントを追加
document.querySelectorAll(".link-button").forEach(button => {
  button.addEventListener("click", function (event) {
    event.stopPropagation(); // 背景のクリックイベントを無効にする
    const url = this.dataset.link;
      window.location.href = url;
    });
  });
});

// localstorageでチュートリアル制限
document.addEventListener('DOMContentLoaded', () => {
  const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
  const tutorial = document.getElementById('tutorial');
  const main = document.getElementById('main-screen');

  if (hasSeenTutorial === 'true') {
    tutorial.classList.add('hidden');
    main.classList.remove('hidden');
    main.style.opacity = 1;
    return;
  }
});


