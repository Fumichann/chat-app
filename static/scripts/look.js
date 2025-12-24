//音量を読み込む
function getVolume(key, defaultValue) {
  const savedVolume = localStorage.getItem(key);
  if (savedVolume !== null) {
    return parseFloat(savedVolume);
  }
  return defaultValue;
}

//Howler.js用のBGM変数
let roomBGM = null;

//Room bgm再生
function startRoomBGM() {
  if (!roomBGM) {
    const targetVolume = getVolume('bgm-volume', 0.4);//bgm-volume がない時の音量　0.4
    roomBGM = new Howl({
      src: ['/static/audio/main beach2.mp3'],  
      loop: true,
      volume: 0,//0から開始
    });
    roomBGM.play();
    roomBGM.fade(0, targetVolume, 4000);//4秒かけてフェードイン
    console.log("Room BGM started in look.js");
  } else {
    const targetVolume = getVolume('bgm-volume', 0.4);//すでに再生中は音量を更新
    roomBGM.volume(targetVolume);
  }
}

// Room BGMの停止
function stopRoomBGM(callback) {
  if (roomBGM) {
    roomBGM.fade(roomBGM.volume(), 0, 1000); // 1秒でフェードアウト
    setTimeout(() => {
      roomBGM.stop();
      roomBGM = null;      
      console.log("Room BGM stopped in look.js");
      if(callback){
        callback();
      }
    },1000);
  } else if (callback) {
    callback();
  }
}

// 戻るボタン
const closeSound = new Howl({
  src: ['/static/audio/open door.mp3'],
  volume: getVolume('se-volume', 0.3)//デフォルト0.3
});

// 瓶を開けるボタン用の効果音
const soundOpen = new Howl({
  src: ['/static/audio/bottle-open.mp3'], 
  volume: getVolume('se-volume', 0.2)//デフォルト0.2
});

import { showLetter, setupLetterModal } from './letter.js';

window.addEventListener('DOMContentLoaded', () => {
    setupLetterModal();

  // --- ストレージ判定ロジックを追加 ---
  const storageType = localStorage.getItem('volume-storage-type') || 'local';
  // const currentStorage = (storageType === 'local') ? localStorage : sessionStorage;

  startRoomBGM();//BGMのフェードイン再生開始

  setTimeout(() => {
    const fade = document.getElementById('fade');//フェード
    if (fade) fade.style.opacity = 0 ;
  }, 1000);

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
  const letters = (storageType === 'local')
                  ? (JSON.parse(localStorage.getItem('letters')) || [])
                  : [];

  // 瓶追加関数
  function addBottle(letter) {
    const shelf = document.getElementById("shelf");

    // 瓶コンテナ（中に瓶画像と文字を入れる）
    const bottleWrapper = document.createElement("div");
    bottleWrapper.className = "bottle";
    bottleWrapper.dataset.id = letter.id;

    const bottleImg = document.createElement("img");
    bottleImg.src = "/static/image/rireki/bottle.webp";
    bottleImg.className = "bottle-img";

    // ラベル文字 (日付)
    const label = document.createElement("div");
    label.className = "bottle-label";

    // --- 日付を「年/月/日」で改行 ---
    const [y, m, d] = letter.date.split("-");
    label.innerHTML = `${y}<br>${m}/${d}`;

    // ← ここでクリックイベント！
    bottleWrapper.addEventListener("click", () => {
      soundOpen.play();
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
  const lettersData =
    (storageType === 'local')
      ? (JSON.parse(localStorage.getItem("letters")) || [])
      : [];

  const letter = lettersData.find(l => l.id == id);
  if (!letter) return;

  showLetter(letter);
}

//---------戻りボタン-----------------------------------------

  const backBtn = document.getElementById('back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {

      // SE再生
      closeSound.play();
      
      stopRoomBGM(() => { 
        window.location.href = '/main';
      });
    });
  }
});