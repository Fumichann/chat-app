window.addEventListener('DOMContentLoaded', () => {

  const storage = localStorage;

  // ----------リサイズ----------------------------------------------
  function resizeShelf() {
    const wrapper = document.querySelector('.shelf-wrapper');
    const shelfImg = document.querySelector('.shelf-img');
    const shelfGrid = document.querySelector('.shelf-grid');
    const bottles = document.querySelectorAll('.bottle');

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

    // wrapperサイズ
    wrapper.style.width = baseWidth * scale + 'px';
    wrapper.style.height = baseHeight * scale + 'px';

    // 棚画像
    shelfImg.style.width = baseWidth * scale + 'px';
    shelfImg.style.height = baseHeight * scale + 'px';
    shelfImg.style.top = (33 * scale) + 'px';
    shelfImg.style.left = '50%';
    shelfImg.style.transform = 'translateX(-50%)';

    // 棚グリッド
    shelfGrid.style.top = (47 * scale) + 'px';
    shelfGrid.style.gridTemplateColumns = `repeat(10, ${75 * scale}px)`;
    shelfGrid.style.gridAutoRows = `${233 * scale}px`;
    shelfGrid.style.rowGap = `${45 * scale}px`;
    shelfGrid.style.columnGap = `${21 * scale}px`;

    // 瓶サイズ
    bottles.forEach(bottle => {
      bottle.style.width = `${75 * scale}px`;
      bottle.style.height = `${233 * scale}px`;
    });

  }

  // 初期・リサイズ時に呼ぶ
  window.addEventListener('resize', resizeShelf);


  // ---------瓶生成-----------------------------------------
  const letters = JSON.parse(storage.getItem('letters')) || [];

  // 瓶追加関数
  function addBottle(letter) {
    const shelf = document.getElementById("shelf");

      // 瓶コンテナ（中に瓶画像と文字を入れる）
    const bottleWrapper = document.createElement("div");
    bottleWrapper.className = "bottle";
    bottleWrapper.dataset.id = letter.id;

    const bottleImg = document.createElement("img");
    bottleImg.src = "/static/image/rireki/bottle.PNG";
    bottleImg.className = "bottle-img";

    // ラベル文字 (日付)
    const label = document.createElement("div");
    label.className = "bottle-label";

    // --- 日付を「年/月/日」で改行 ---
    const [y, m, d] = letter.date.split("-");
    label.innerHTML = `${y}<br>${m}/${d}`;

    // ← ここでクリックイベント！
    bottleWrapper.addEventListener("click", () => {
      openLetter(letter.id);
    });

    // 追加
    bottleWrapper.appendChild(bottleImg);
    bottleWrapper.appendChild(label);
    shelf.appendChild(bottleWrapper);

  }



// ---------手紙表示-----------------------------------------


  function openLetter(id) {
    const letters = JSON.parse(localStorage.getItem("letters")) || [];
    const letter = letters.find(l => l.id == id);

    if (!letter) return;

    // 手紙の内容をセット
    document.getElementById("letter-text").textContent = letter.content;
    document.getElementById("letter-date").textContent = letter.date;

    // 表示
    document.getElementById("letter-modal").classList.remove("hidden");

  }

  // 背景クリックで閉じる
  document.getElementById("letter-modal").addEventListener("click", (e) => {
    if (e.target.id === "letter-modal") {
      e.target.classList.add("hidden");
    }
});

  // 手紙の数だけ瓶を並べる
  letters.forEach(letter => addBottle(letter));

  // 初回リサイズ適用
  resizeShelf();


//---------戻りボタン-----------------------------------------


  // ★ 戻るボタン
  const backBtn = document.getElementById('back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});