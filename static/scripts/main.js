import { showLetter, setupLetterModal } from './letter.js';

document.addEventListener('DOMContentLoaded', () => {
  setupLetterModal();

//デバッグ用：毎回前置きを表示（確認が終わったら削除！）
//localStorage.removeItem('hasSeenTutorial');

const fade = document.getElementById('fade-overlay');
const haikei = document.querySelector('.haikei')
const maeoki = document.getElementById('maeoki');
const maeokiText = document.getElementById('maeoki-text');
const textImage = document.getElementById('text-img')
const tutorial = document.getElementById('tutorial')
const tutorialImage = document.getElementById('tutorial-img');
const main = document.getElementById('main-screen');

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


//----------リサイズ--------------------
function resizeLinkButtons() {
  const scale = Math.min(window.innerWidth / 1100, 1);

  const btns = document.querySelectorAll('.link-button');
  const container = document.getElementById('link-buttons');

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


// localstorageでチュートリアル制限
window.onload = function() {
  const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');

  if (hasSeenTutorial === 'true') {
    // maeoki と tutorial を完全にスキップ
    maeoki.remove();
    tutorial.remove();
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

// 背景画像切り替え
function switchToMainBackground(){
  haikei.classList.remove('maeoki');
  haikei.classList.add('main');
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

maeoki.addEventListener('click', showMaeoki);
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
      });
    }, 800);
  }
}

// ------------------ 背景見せ ----------------
function showhaikei() {
  switchToMainBackground();

  // メインBGMの再生開始
  startMainBGM();

  fadeOut(fade, 2.5, 1.3, () => {
    setTimeout(() => {
      showTutorial(); // 初回だけここに来る
    }, 1000);
  });
}

// ---------------- チュートリアル ---------------
const tutorialImages = [
  "../static/image/tutorial/kkri.png",
  "../static/image/tutorial/kkri2.png",
  "../static/image/tutorial/kkri3.png"
]; // 何枚でも追加可能

let imageIndex = 0;
tutorialImage.src = tutorialImages[imageIndex];

let TAnimating = false; // フェード中クリックを無効化

tutorial.addEventListener('click', showTutorial);
function showTutorial() {
  if (TAnimating) return;

  if (imageIndex < tutorialImages.length) {
    TAnimating = true;
    tutorial.classList.remove("hidden");
    tutorial.style.opacity = 1;

    // 画像切り替え
    tutorialImage.style.opacity = 0;
    setTimeout(() => {
      tutorialImage.src = tutorialImages[imageIndex];
      tutorialImage.style.opacity = 1;
      imageIndex++;

      // アニメーション終了後にクリックを再び有効化
      setTimeout(() => { TAnimating = false; }, 500);
    },900);

  } else {
    // 最後
    tutorialImage.style.opacity = 0;
    localStorage.setItem('hasSeenTutorial', 'true');

    setTimeout(() => {
      tutorial.remove();
      showMainScreen();
    },900);
  }
}

// ---------------- メイン ----------------
main.addEventListener('click', showMainScreen);
function showMainScreen() {
  setTimeout(() => {
  main.classList.remove("hidden");
  requestAnimationFrame(() => {
    main.style.opacity = 1;

    const storage = getStorage();
    const pending = storage.getItem("pendingReply");

    if (pending) {
      const letter = JSON.parse(getStorage().getItem("pendingReply"));
      
      showLetter(letter);

      // 一度きりなので削除（local / session 共通）
      storage.removeItem("pendingReply");
    }

    //メインBGMの再生開始
    startMainBGM();

    // メイン画面が出たときにリンクボタンのイベントを登録
    document.querySelectorAll(".link-button").forEach(button => {
      console.log("showMainScreen 実行 at", new Error().stack);
      console.log("found button:", button);
      button.addEventListener("click", function (event) {
        event.stopPropagation(); // 背景のクリックイベントを無効化
        const url = this.dataset.link;
        console.log("clicked:", url);
        
        // data-link の値でボタンを判別
        if (url === '/look') {
          soundClickB.play(); 
        } else {
          soundClickA.play();
        }

        // ページ遷移処理を関数として定義
        const navigate = () => {
          window.location.href = url;
        };
        // stopMainBGM()を呼び出し、完了後に navigate 関数を実行させる
        stopMainBGM(navigate);
        // BGMが再生されていない場合は、stopMainBGM 内で navigate が即座に実行される
        
      });
    });
  });
  },1500); //メイン出すまでの間
}
});
