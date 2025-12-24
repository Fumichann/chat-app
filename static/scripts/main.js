import { showLetter, setupLetterModal } from './letter.js';
import { applyTimeBackground,applyTimeImage,applyTimeBtn } from './time.js';

document.addEventListener('DOMContentLoaded', () => {
  setupLetterModal();

//デバッグ用：毎回前置きを表示（確認が終わったら削除！）
//localStorage.removeItem('hasSeenTutorial');

const fade = document.getElementById('fade-overlay');
const haikei = document.querySelector('.haikei')
const maeoki = document.getElementById('maeoki');
const maeokiText = document.getElementById('maeoki-text');
const textImage = document.getElementById('text-img')
const main = document.getElementById('main-screen');

const btns = document.querySelectorAll('.link-button');
const container = document.getElementById('link-buttons');
const btnWrite = document.getElementById('wr');
const btnSetting = document.getElementById('se');
const btnLook = document.getElementById('lo');

const nagare = document.getElementById('nagare')
const n1 = document.querySelector('.nagare1');
const n2 = document.querySelector('.nagare2');
const n3 = document.querySelector('.nagare3');

  // 時間帯に応じた背景設定
  applyTimeBtn("link-button", "main", "sentaku");

  applyTimeImage(n1, "binsen", "nagare1");
  applyTimeImage(n2, "binsen", "nagare2");
  applyTimeImage(n3, "binsen", "nagare3");


maeoki.addEventListener("click", () => {
  console.log("maeoki clicked!");
});

//LocalStorageから音量を読み込む
function getVolume(key, defaultValue) {
  const savedVolume = localStorage.getItem(key);
  if (savedVolume !== null) {
    return parseFloat(savedVolume);
  }
  return defaultValue;
}

//  (Howler.js)用のBGM変数
let maeokiBGM;
let mainBGM;

//前置きBGMの再生
function startMaeokiBGM() {
  if (!maeokiBGM) {
    const targetVolume = getVolume('bgm-volume', 0.4);
    maeokiBGM = new Howl({
      src: ["/static/audio/deep bubble.mp3"],
      loop: true,//ループ再生
      volume: 0,
    });
    maeokiBGM.play();
    //ゆっくりフェードイン（4秒かけて）
    maeokiBGM.fade(0, targetVolume, 4000);
    console.log("Maeoki BGM started");
  }
}

//前置きBGMの停止
function stopMaeokiBGM() {
  if (maeokiBGM) {
    // ゆっくりフェードアウト（4.5秒かけて）
    maeokiBGM.fade(maeokiBGM.volume(), 0, 4500);
    setTimeout(() => {
      maeokiBGM.stop();
      maeokiBGM = null;
      console.log("Maeoki BGM stopped");
    }, 4600);
  }
}

//メインBGMの再生
function startMainBGM() {
  if (!mainBGM) {
    const targetVolume = getVolume('bgm-volume', 0.4);
    mainBGM = new Howl({
      src: ["/static/audio/main beach2.mp3"],
      loop: true, // ループ再生
      volume: 0,
    });
    mainBGM.play();
    // ゆっくりフェードイン（4秒かけて）
    mainBGM.fade(0, targetVolume, 4000); 
    console.log("Main BGM started");
  }
}

// メインBGMの停止
function stopMainBGM(callback) {
    if (mainBGM) {
        mainBGM.fade(mainBGM.volume(), 0, 2000);
        setTimeout(() => {
            mainBGM.stop();
            mainBGM = null;
            console.log("Main BGM stopped");
            //BGM停止後にコールバックを実行
            if(callback){
              callback();
            }
        }, 2000);
      } else if (callback) {
        callback();
      }
  }

// 手紙を書くボタンと設定ボタン用の効果音
const soundClickA = new Howl({
  src: ["/static/audio/walk beach.mp3"],
  volume: getVolume('se-volume', 0.2)
});

// 手紙を見るボタン用の効果音
const soundClickB = new Howl({
  src: ["/static/audio/open door.mp3"],
  volume: getVolume('se-volume', 0.1)
});

// ストレージ種別読み込み（初回は local）
if (!localStorage.getItem('volume-storage-type')) {
  localStorage.setItem('volume-storage-type', 'local');
}
let storageType = localStorage.getItem('volume-storage-type') ;

// 実際の保存・読み込みで使う関数
function getStorage() {
  return (storageType === 'local') ? localStorage : sessionStorage;
}

//----------リサイズ--------------------
function resizeLinkButtons() {
  const scale = Math.min(window.innerWidth / 1100, 1);

  nagare.style.height = Math.round(200 * scale) + 'px';
  nagare.style.width  = Math.round(1000 * scale) + 'px';

  btns.forEach(btn => {
    btn.style.width  = Math.round(285 * scale) + 'px';
    btn.style.height = Math.round(70 * scale) + 'px';
    btn.style.fontSize = Math.round(17 * scale) + 'px';
  });

  if (container) {
    container.style.gap = Math.round(50 * scale) + 'px';
  }
}

window.addEventListener('resize', resizeLinkButtons);
resizeLinkButtons();


// localstorageで前置き制限
window.onload = function() {
  const hasSeenMain = localStorage.getItem('hasSeenMain');

  if (hasSeenMain === 'true') {
    // maeoki を完全にスキップ
    maeoki.remove();
    //メインBGMの再生開始
    startMainBGM();
    switchToMainBackground();

    fadeOut(fade, 2, 0.7, () => {
    showMainScreen();
    });
  } else {
    // 初回はmaeokiを出す
    maeoki.style.opacity = 1;
    maeoki.classList.remove("hidden");

    // 前置きBGMの再生開始
    startMaeokiBGM();

    showMaeoki();
    fadeOut(fade, 2, 1, () => {
    });
  }
};

// フェードイン　duration=フェードにかかる時間　delay=フェードを始める待機時間
function fadeIn(element, duration = 0, delay = 0, callback) {
  element.classList.remove("hidden");
  element.style.opacity = 0;
  element.style.transition = `opacity ${duration}s ease`;

  setTimeout(() => {
    requestAnimationFrame(() => {
      element.style.opacity = 1;

      if (callback) {
        setTimeout(() => {
          requestAnimationFrame(callback);
        }, duration * 1000);
      }
    });
  }, delay * 1000);
}

// フェードアウト　duration=フェードにかかる時間　delay=フェードを始める待機時間
function fadeOut(element, duration = 0, delay = 0, callback) {
  element.classList.remove("hidden"); // 表示状態にする
  element.style.opacity = 1;
  element.style.transition = `opacity ${duration}s ease-out`;

  setTimeout(() => {
    requestAnimationFrame(() => {
      element.style.opacity = 0;

      setTimeout(() => {
        element.classList.add("hidden"); // 完全に透明になったら非表示
        if (callback) requestAnimationFrame(callback);
      }, duration * 1000);
    });
  }, delay * 1000);
}

// --------- 背景画像切り替え ------------------
function switchToMainBackground(){
  haikei.remove();
  document.body.classList.add('haikei');
  document.body.classList.add('time-bg');
  applyTimeBackground('main');
};

// ---------------- 前置き ----------------
// まえおきテキスト
const maeokiTexts = [
  "ここは誰もいない海、<wbr>あなた以外誰もいない",
  "でも海の向こうには<wbr>誰かいるかもしれない"                                                                                            ,
  "つながりを求めるのも、<wbr>ひとりを楽しむのもあなたの自由",
  "さぁ、あなただけの海へ"
];

let currentIndex = 0;
maeokiText.innerHTML = maeokiTexts[currentIndex];

let MAnimating = false; // フェード中クリックを無効化

function showMaeoki() {
  if (MAnimating) return; // フェード中は無視

  if (currentIndex < maeokiTexts.length) {
    MAnimating = true;

    // テキスト切り替え
    maeokiText.style.opacity = 0;
    maeokiText.style.transition = "opacity 1.5s ease"; // フェード速度をゆっくりに

    setTimeout(() => {
      maeokiText.innerHTML = maeokiTexts[currentIndex];
      maeokiText.style.opacity = 1;
      currentIndex++;

      // アニメーション終了後にクリックを再び有効化
      setTimeout(() => { MAnimating = false; }, 600);//クリック可能になるまでの速さ（0.6秒）
    }, 1500);

  } else {
    // 最後
    maeokiText.style.opacity = 0;
    textImage.style.opacity = 0;

    // 🎵 前置きBGMフェードアウト
    stopMaeokiBGM();

    // 黒幕フェードイン
    setTimeout(() => {
      fadeIn(fade, 2.5, 1.5, () => {
        maeoki.style.opacity = 0;
        maeoki.remove();
        MAnimating = false;
        showhaikei();

        // ここで一度見たことを記録
        localStorage.setItem('hasSeenMain', 'true');

        // 前置き終了後は document のクリックイベントを解除
        document.removeEventListener('click', showMaeoki);
      });
    }, 800);
  }
}

// 画面全体でクリック判定
document.addEventListener('click', showMaeoki);

// ------------------ 背景見せ ----------------
function showhaikei() {
  switchToMainBackground();

  // メインBGMの再生開始
  startMainBGM();

  fadeOut(fade, 2.5, 1.3, () => {
    setTimeout(() => {
      showMainScreen(); // 初回だけここに来る
    }, 1000);
  });
}


// --- settimeoutの代わり ---
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------- 乱数 -------------------
function randomDelay(min, max) {
  return Math.random() * (max - min) + min;
}

// ---------------- 状態 ----------------
let isBottleActive = false;
let bottleTimerId = null;


// ------------ ボタン止め ---------------------
function blockWriteButton() {
  btnWrite.disabled = true;
}

function disableMainButtons() {
  btns.forEach(btn => btn.disabled = true);
}

function enableMainButtons() {
  btns.forEach(btn => btn.disabled = false);
}

// --------------ボトル瓶--------------------
async function showBottle() {

  // --- ボトル ---
  n3.style.opacity = 1 ;
  await sleep(1200);
  fade.style.opacity = 0;   
  await sleep(1200);
  n3.style.opacity = 0;
  n2.style.opacity = 1;
  await sleep(1200);
  n2.style.opacity = 0;
  n1.style.opacity = 0.8;
  n1.style.pointerEvents = "auto";
  }

// ---------------- ボトル処理 ----------------
async function startBottleSequence() {
  isBottleActive = true;
  disableMainButtons();

  const storage = getStorage();
  const data = storage.getItem("pendingReply");
  if (!data) return;

  const letter = JSON.parse(data);

  // ボトルが流れてくる演出
  await showBottle();   

  // ここから「触るまで待ち」
  await waitForBottleClick(n1);
  showLetter(letter);
}

function waitForBottleClick(n1) {
  return new Promise(resolve => {
    const handler = (e) => {
      e.stopPropagation();

      if (!isBottleActive) return;

      isBottleActive = false;
      enableMainButtons();
      getStorage().removeItem("pendingReply");

      n1.style.opacity = 0;
      n1.style.pointerEvents = "none";
      n1.removeEventListener("click", handler);
      resolve();
    };

    n1.addEventListener("click", handler, { once: true });
  });
}





// ---------------- ここからメイン！！！！！！！！！！！！ -----------------------------
main.addEventListener('click', showMainScreen);

async function showMainScreen() {
  setTimeout(() => {
    if (!main) return; // main が存在しない場合は処理中断

    main.classList.remove("hidden");

    requestAnimationFrame(async () => {
      main.style.opacity = 1;
      enableMainButtons();

      if (bottleTimerId) {
        clearTimeout(bottleTimerId);
        bottleTimerId = null;
      }

      const storage = getStorage();
      const pending = storage.getItem("pendingReply");

      if (pending) {
        // writeだけロックした状態で待つ
        blockWriteButton();

        const delay = randomDelay(1000,10000);

        bottleTimerId = setTimeout(() => {
          startBottleSequence();
        }, delay);

      } else {
        // pendingReply がない場合はボトルは流さない
        console.log("ボトルなし");
      }

      //メインBGMの再生開始
      startMainBGM();
    });
  }, 1500);
}

// ---------------- ボタンイベント ----------------
btns.forEach(button => {
  button.addEventListener("click", (event) => {
    if (isBottleActive) return;

    event.stopPropagation();

    const url = button.dataset.link;

    if (url === '/look') {
      soundClickB.play();
    } else {
      soundClickA.play();
    }

    // ページ遷移前にタイマー止める
    if (bottleTimerId) {
      clearTimeout(bottleTimerId);
      bottleTimerId = null;
    }

    stopMainBGM(() => {
      window.location.href = url;
    });
  });
});

});