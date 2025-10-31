document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById('logo');
  const bottle = document.getElementById('bottle');
  let closed = false;

// 🫧 効果音（泡の音）設定
  const bubbleSound = new Howl({
    src: ["/static/audio/deep bubbles.mp3"],
    volume: 0.7,
    loop: true, // 🔁 フェード中ずっとループ再生
  });


  function updateBottlePosition() {
    const rect = logo.getBoundingClientRect(); // logo の位置とサイズ
    bottle.style.top = rect.top + 'px';
    bottle.style.left = rect.left + 'px';
    bottle.style.width = rect.width + 'px';
    bottle.style.height = rect.height + 'px';
  }

  // ページ読み込み時とリサイズ時に位置更新
  window.addEventListener('load', updateBottlePosition);
  window.addEventListener('resize', updateBottlePosition);
    updateBottlePosition();

  // 揺れながら上にフェードアウトするアニメ
  function animateBottleFadeUp(duration = 1500, distance = 150) {
      const start = performance.now();

      function frame(time) {
          const elapsed = time - start;
          const progress = Math.min(elapsed / duration, 1);

          // 上に移動
          const translateY = -distance * progress;
          // 横揺れ（サイン波で揺れる）
          const translateX = 2 * Math.sin(progress * Math.PI * 2);
          // 回転
          const rotate = 1 * Math.sin(progress * Math.PI * 3);

          bottle.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`;
          // フェードアウト

          if (progress < 1) {
              requestAnimationFrame(frame);
          } else {
              bottle.style.display = 'none';
          }
      }

      requestAnimationFrame(frame);
  }

  
  // --- クリックイベント ---
  document.addEventListener("click", () => {
    if (closed) return;
    closed = true;

    //泡音スタート（ループON）
    bubbleSound.play();

    setTimeout(() => {
      document.body.classList.add('close');
    }, 300); // 1秒後にフェード開始

    const distance = window.innerWidth * 0.03; // 画面の3%分上に移動
    animateBottleFadeUp(2500, distance);

    //3.5秒後くらいから音をゆっくりフェードアウト（2秒かけて）
    setTimeout(() => {
      bubbleSound.fade(0.2, 0, 2000);
    }, 3500);

    setTimeout(() => {
      bubbleSound.stop(); // フェード終わりで静かに停止
      window.location.href = "/main";
    }, 5000); // フェード時間と合わせる
  },
  { once: true }
);
});