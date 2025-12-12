document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById('logo');
  const bottle = document.getElementById('bottle');
  let closed = false;

  // 泡のBGM設定
  const bubbleSound = new Howl({
    src: ["/static/audio/deep bubbles.mp3"],
    volume: 0.6,
    loop: true, // ループ再生
  });

  // setting.jsで保存された音量を読み込み、適用する
  const savedVolume = localStorage.getItem('bgm-volume');
  let volumeToApply = 0.6; // デフォルト値

  if (savedVolume !== null) {
    volumeToApply = parseFloat(savedVolume);// localStorageの値があればそれを適用
  }
  bubbleSound.volume(volumeToApply);


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

    //泡のBGM再生開始（ループ）
    bubbleSound.play();

    setTimeout(() => {
      document.body.classList.add('close');
    }, 300); // 1秒後にフェード開始

    const distance = window.innerWidth * 0.03; // 画面の3%分上に移動
    animateBottleFadeUp(2500, distance);

    //音をゆっくりフェードアウト（3秒かけて）
    setTimeout(() => {
      const currentVolume = bubbleSound.volume(); // 現在設定されている音量を取得
      bubbleSound.fade(currentVolume, 0, 3000);
    }, 1000);

    setTimeout(() => {
      bubbleSound.stop(); // フェード終わりで静かに停止
      window.location.href = "/main";
    }, 4500); // フェード時間と合わせる
  },
  { once: true }
);
});