function getStorage(){
  const currentType = localStorage.getItem('volume-storage-type') || 'local';
  return (currentType === 'local') ? localStorage : sessionStorage;
}

// -----Howler.jsの設定
const bgmSound = new Howl({
  src: ['/static/audio/main beach2.mp3'],  
  html5: true,
  loop: true,
  volume: 1.0
});

const closeSound = new Howl({
  src: ['/static/audio/open door.mp3'],
  html5: true,
  volume: 1.0
});

//bgmフェードイン
function startBgmWithFadeIn(duration = 2000) {
  const targetVolume = parseFloat(localStorage.getItem('bgm-volume')) || 1.0;
  if (!bgmSound.playing()) {
    bgmSound.volume(0);// 音量を0に設定して再生開始
    bgmSound.play();// 0から目標音量までフェードイン
    
    if (targetVolume > 0) {
      bgmSound.fade(0, targetVolume, duration);
    }
  } else {
    bgmSound.volume(targetVolume);
  }
}


window.addEventListener('DOMContentLoaded', () => {

  const storage = localStorage;

  // localStorageから保存されたBGM音量を読み込み、適用する
  const savedBgmVolume = parseFloat(storage.getItem('bgm-volume')) ;
  if (!isNaN(savedBgmVolume)) {
    bgmSound.volume(savedBgmVolume);
  }

  // localStorageから保存されたSE音量を読み込み、適用する
  const savedSeVolume = parseFloat(storage.getItem('se-volume')) ;
  if (!isNaN(savedSeVolume)) {
    closeSound.volume(savedSeVolume);
  }

  //-----------フェード-----------------------
  setTimeout(() => {
    const fade = document.getElementById('fade');
    if (fade) fade.style.opacity = 0 ;
  }, 1000); // 読み込みが安定したら外す

  //BGM フェードイン再生
  startBgmWithFadeIn(2000);

  // ----------リサイズ----------------------------------------------
  function resizeShelf() {
    const wrapper = document.querySelector('.shelf-wrapper');
    const shelfImg = document.querySelector('.shelf-img');
    const shelfGrid = document.querySelector('.shelf-grid');
    const bottles = document.querySelectorAll('.bottle');
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

    // 手紙サイズ
    papers.forEach(paper => {
    const middle = paper.querySelector('.letter-middle');
    const text = paper.querySelector('#letter-text');

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

  // 手紙の数だけ瓶を並べる
  letters.forEach(letter => addBottle(letter));

  // 初回リサイズ適用
  resizeShelf();

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

//---------戻りボタン-----------------------------------------

  const backBtn = document.getElementById('back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {

      // SE再生を追加
      closeSound.play();

      //BGM フェードアウト
      if (bgmSound.playing()) {
        const currentVolume = bgmSound.volume();
        bgmSound.fade(currentVolume, 0, 1000);// 1秒でフェードアウト

        setTimeout(() => {
          bgmSound.stop();
          window.location.href = '/main';
        }, 1000);// フェード時間と合わせて遷移
      } else {
        window.location.href = '/main';
      }
    });
  }
});

//getStorageの追加
function getStorage(){
  const currentType = localStorage.getItem('volume-storage-type') || 'local';
  return (currentType === 'local') ? localStorage : sessionStorage;
}