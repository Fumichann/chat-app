  // ----------リサイズ----------------------------------------------
  function resizeLetter() {
    const papers = document.querySelectorAll('.letter-paper')

    // 基準サイズ（棚画像の元サイズ）
    const baseWidth = 1055;
    const baseHeight = 540;

    // 画面が小さい時だけ縮める
    const maxWidth = window.innerWidth * 0.86;
    const maxHeight = window.innerHeight * 0.9;

    const scaleW = maxWidth / baseWidth;
    const scaleH = maxHeight / baseHeight;

    // 大きくはしない（1が上限）
    const scale = Math.min(scaleW, scaleH, 1);

    // 手紙サイズ
    papers.forEach(paper => {
    const middle = paper.querySelector('.letter-middle');
    const text = paper.querySelector('.letter-text');

    // まずリサイズ処理を全部終わらせる
    paper.style.width = `${855 * scale}px`;
    paper.style.maxHeight = `${690 * scale}px`;
    paper.style.height = "auto"; 

    // テキストの高さを取得
    const textHeight = text.scrollHeight;

    // 「短文」と判定する境界（調整可能）
    const threshold = 200 * scale;

    if (textHeight < threshold) {
      middle.style.backgroundSize = "100% auto";   // 短文 → ボケない
    } else {
      middle.style.backgroundSize = "100% 100%";    // 長文 → ずれない
    }
  });
}

    // 初期・リサイズ時に呼ぶ
    let resizeTimer;
        window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeLetter, 100);
    });

    resizeLetter();


export function showLetter({ content, date }) {
  document.querySelector(".letter-text").textContent = content;
  document.getElementById("letter-date").textContent = date;

  const modal = document.getElementById("letter-modal");
  modal.classList.remove("hidden");

  resizeLetter();
}

// 背景クリックで閉じる（一回だけ登録）
let modalInitialized = false;

export function setupLetterModal() {
    if (modalInitialized) return;
    modalInitialized = true;

    const modal = document.getElementById("letter-modal");
    if (!modal) return;

  modal.addEventListener("click", (e) => {
    e.stopPropagation();

    if (e.target.id === "letter-modal") {
      modal.classList.add("hidden");
       resizeLetter();
    }
  });
}
