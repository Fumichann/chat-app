//音量を読み込む
function getVolume(key, defaultValue) {
  const savedVolume = localStorage.getItem(key);
  if (savedVolume !== null) {
    return parseFloat(savedVolume);
  }
  return defaultValue;
}

// BGM/SE のデフォルト音量を定義
const DEFAULT_BGM_VOLUME = 0.4;
const DEFAULT_SE_VOLUME = 0.3;


// Howler.js設定
const pageFlipSound = new Howl({
  src: ['/static/audio/paper.mp3'],//ページめくり音
  html5:true,
  volume: getVolume('se-volume', DEFAULT_SE_VOLUME)
});

const bookCloseSound = new Howl({
    src: ['/static/audio/close book.mp3'], // 本を閉じる音
    html5: true,
    volume: getVolume('se-volume', DEFAULT_SE_VOLUME)
});

const bgmSound = new Howl({
  src: ['/static/audio/main beach2.mp3'],
  html5: true,
  loop: true,
  volume: getVolume('bgm-volume', DEFAULT_BGM_VOLUME)
});

// BGM フェードイン再生
function startBgmWithFadeIn(duration = 2000) {
  const targetVolume = bgmSound.volume();
  if (!bgmSound.playing()) {
    bgmSound.volume(0);
    bgmSound.play();
    if (targetVolume > 0) {
      bgmSound.fade(0, targetVolume, duration);
    }
  } else {
    bgmSound.volume(targetVolume);//すでに再生中の場合の音量
  }
}

// ストレージ種別読み込み（初回は local）
if (!localStorage.getItem('volume-storage-type')) {
  localStorage.setItem('volume-storage-type', 'local');
}
let storageType = localStorage.getItem('volume-storage-type') ;

// 実際の保存・読み込みで使う関数
function getStorage() {
  return (storageType === 'local') ? localStorage : sessionStorage;
}

window.dispatchEvent(new Event('resize'));

//-----------メッセージ----------------------
function showMessage(text,color = 'rgba(18, 17, 43, 1)') {
  const message = document.getElementById('message');

  if (!message) return;

  message.textContent = text;
  message.style.color = color;
  message.classList.add('show');

  setTimeout(() => {
    message.classList.remove('show');
  }, 2000);
}

// BGM/SE の音量をまとめて設定するヘルパー関数
function setAllSEVolume(volume) {
  pageFlipSound.volume(volume);
  bookCloseSound.volume(volume);
}

//-------- BGM -------------------------------

function setupVolume(howlerObject, storageKey, dotsId, muteId, numDots = 10) {
  const dotsContainer = document.getElementById(dotsId);
  const muteBtn = document.getElementById(muteId);

  if (!dotsContainer|| !muteBtn) {
      console.error(`Error: Missing element for ${storageKey}.`);
      return; 
  }

  // 保存された音量を読み込む（無ければ1）
  let currentVolume = howlerObject.volume();
  let prevVolume = currentVolume > 0 ? currentVolume : 1; // 0ならミュートからの復帰用に1を初期値とする
  let isBGM = (storageKey === 'bgm-volume');// BGM/SEでミュートボタン画像を変えるため
  let muted = currentVolume === 0;

  // BGMとSEの音量を一度に設定するヘルパー関数
  function applyVolume(volume) {
    howlerObject.volume(volume);// 渡されたHowlerオブジェクトの音量を設定

     // SEの場合、関連する全てのSEの音量も一緒に設定
    if (!isBGM) { 
      setAllSEVolume(volume);
    }
    if (isBGM && howlerObject.playing()) {
      howlerObject.volume(volume);
    }

    // localStorageに保存
    localStorage.setItem(storageKey, volume);

    if (isBGM) {
    } else {
    }
  }

  // ミュートボタンの初期画像設定
  function updateMuteBtnImage() {
    const base = isBGM ? 'mute' : 'mute';
    if (muted) {
      muteBtn.src = isBGM ? '/static/image/settei/mute2.PNG' : '/static/image/settei/mute4.PNG';
    } else {
      muteBtn.src = isBGM ? '/static/image/settei/mute1.PNG' : '/static/image/settei/mute3.PNG';
    }
  }

  updateMuteBtnImage();

  // ドット生成
  for (let i = 0; i < numDots; i++) {
    const dot = document.createElement('span');
    dotsContainer.appendChild(dot);
  }

  // ドット更新
  function updateDots(volume) {
    const dots = dotsContainer.querySelectorAll('span');
    const activeCount = Math.ceil(volume * numDots);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i < activeCount);
    });
  }

  updateDots(currentVolume);

  // ドットクリック
  dotsContainer.addEventListener('click', e => {
    const rect = dotsContainer.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    ratio = Math.min(Math.max(ratio, 0), 1);
    ratio = Math.ceil(ratio * numDots) / numDots;

    currentVolume = ratio;
    applyVolume(ratio);
    
    muted = ratio === 0; // 0ならミュート扱い
    if (!muted) {
      prevVolume = ratio;
    }
    updateDots(currentVolume);
    updateMuteBtnImage();// ミュートボタン画像を更新
  });

  // ミュートボタン
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    let newVolume;

    if (muted) {
      prevVolume = currentVolume > 0 ? currentVolume : 1; // 0でない音量を prevVolume に保存
      newVolume = 0;
      currentVolume = 0;
    } else {
      newVolume = prevVolume;
      currentVolume = newVolume;
    }
    
    applyVolume(newVolume);
    updateMuteBtnImage(); // ミュートボタン画像を更新
    updateDots(currentVolume);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // BGM と SE をそれぞれセットアップ
  setupVolume(bgmSound, 'bgm-volume', 'bgm-dots', 'bgm-mute');
  setupVolume(pageFlipSound, 'se-volume', 'se-dots', 'se-mute');

  startBgmWithFadeIn(2000);

  //-----------フェード-----------------------  
  setTimeout(() => {
    const fade = document.getElementById('fade');
    if (fade) fade.style.opacity = 0;
  }, 1000);



//--------turn.js---------------------------------
  const $flipbook = $('#flipbook');
  let isPageTurning = false;

  // 本の初期化
  $flipbook.turn({
    width: 1200,
    height: 900,
    elevation: 2,
    autoCenter: true,
    duration: 900,
    display: 'double',
    gradients: false,
    page: 1
  });
  
  function setInitialNavigationState() {
    $('#previous').css('pointer-events', 'none').css('opacity', '0.5'); 
    $('#next').css('pointer-events', 'auto').css('opacity', '1');
  }
  
  setInitialNavigationState();

  $flipbook.on('turned', () => {
    isPageTurning = false;
    const currentPage = $flipbook.turn('page');
    // 「前のページ！」ボタンのワンクリック制御
    if (currentPage === 1) {
      $('#previous').css('pointer-events', 'none').css('opacity', '0.5'); 
    } else {
      $('#previous').css('pointer-events', 'auto').css('opacity', '1');
    }

    // 「次のページ！」ボタンのワンクリック制御
    if (currentPage === 2) {
      $('#next').css('pointer-events', 'none').css('opacity', '0.5'); 
    } else {
      $('#next').css('pointer-events', 'auto').css('opacity', '1');
    }
  });

  // ページ送りボタン
  $('#previous').click(() => {
    if (isPageTurning) return;
    isPageTurning = true;

    pageFlipSound.play();
    $flipbook.turn('previous');
  });

  $('#next').click(() => {
    if (isPageTurning) return;
    isPageTurning = true;

    pageFlipSound.play();
    $flipbook.turn('next');
  });

//----------本表示--------------------------------
function resizeBook() {
  const wrapper = document.getElementById('book-wrapper');
  const cover = document.getElementById('cover');
  const overlays = document.querySelectorAll('.overlay');
  const aspect = 1600 / 1200;

  // 幅優先で計算
  let width = 1600;
  let height = 1200

  // 画面が小さい場合だけ縮める 
  const maxWidth = window.innerWidth * 0.85; 
  const maxHeight = window.innerHeight * 1.05;

// 幅と高さのスケール比をそれぞれ計算
const scaleW = maxWidth / width;
const scaleH = maxHeight / height;

// 小さい方のスケールを採用（はみ出さないように）
const scaleBook = Math.min(scaleW, scaleH);

// スケールが1未満のときだけ縮める
if (scaleBook < 1) {
  width *= scaleBook;
  height *= scaleBook;
}
  // 適用
  wrapper.style.width = width + 'px';
  wrapper.style.height = height + 'px';
  cover.style.width = width + 'px';
  cover.style.height = height + 'px';

  $('#flipbook').turn('size', width, height);

  overlays.forEach(overlay => {
    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';
    overlay.style.transform = `translate(-50%, -50%)`;

  // 子要素の文字サイズだけ縮小
  const texts = overlay.querySelectorAll('*');
  texts.forEach(t => {
    t.style.fontSize = (32 * (width / 1600)) + 'px'; // 元の32pxを画面幅に合わせて縮小
  });
});
  // turn.js のページ内テキストにも同じスケーリングを適用
  const pages = document.querySelectorAll('#flipbook *');
  pages.forEach(p => {
    p.style.fontSize = (32 * (width / 1600)) + 'px';
  });

  const message = document.getElementById('message');
  if (message) {
    message.style.fontSize = (25 * (width / 1600)) + 'px';
    message.style.padding = (12 * (width / 1600)) + 'px ' + (24 * (width / 1600)) + 'px'; // パディングもスケール
    // 高さも必要なら line-height も調整
    message.style.lineHeight = (1.2 * (width / 1600)) + 'em';
  }
}

// 初期とリサイズ時
window.addEventListener('resize', resizeBook);
resizeBook();

//--------- SAVE -----------------------

// ボタン取得
const storageBtn = document.getElementById('local-btn');

// アイコン反映
storageBtn.src = (storageType === 'local') ? '/static/image/settei/check1.PNG' : '/static/image/settei/check2.PNG';

console.log("現在のストレージタイプ:", storageType);

// イベントリスナー
storageBtn.addEventListener('click', () => {
  // 切り替え
  storageType = (storageType === 'local') ? 'session' : 'local';

  // アイコン更新
  storageBtn.src = (storageType === 'local') ? '/static/image/settei/check1.PNG' : '/static/image/settei/check2.PNG';

  // 保存
  localStorage.setItem('volume-storage-type', storageType);

  console.log("切り替え後:", storageType);
});

  //---------delete------------------------------
  // 保存されてる手紙データ確認
  const storedLetter = getStorage().getItem('letters');
  const deleteBtn = document.getElementById('delete-btn');

  // データが無い場合 → 最初から gomi2.png にしておく
  if (!storedLetter || storedLetter === '[]') {
    deleteBtn.src = '/static/image/settei/gomi2.PNG';
  } else {
    deleteBtn.src = '/static/image/settei/gomi1.PNG';
  }

  // 削除ボタンの動作
  let deleteConfirm = false;
  let clickLocked = false;
  let messageTimeout;

  deleteBtn.addEventListener('click', () => {
    
  const storedLetter = getStorage().getItem('letters');
  if (clickLocked) return;  // ロック中は無視する


  // 手紙が無い場合
  if (!storedLetter || storedLetter === '[]') {
    clickLocked = true;
    showMessage('手紙はないようだ');

    setTimeout(() => {
      clickLocked = false;
    }, 4000);

    return;
  }

  // まだ確認してなければ「本当に？」を出して終了
  if (!deleteConfirm) {
    deleteConfirm = true;   // ← 次のクリックで削除するモード
    showMessage('本当に？');
    
    // 3秒以内に押されなかったらキャンセル
    setTimeout(() => {
      deleteConfirm = false;
    }, 3000);

    return;
  }

  // 2回目クリック（＝削除実行）
  getStorage().removeItem('letters');
  deleteBtn.src = '/static/image/settei/gomi2.PNG';
  showMessage('手紙はなくなった');
  deleteConfirm = false;  // 念のためリセット
});

  //--------- back -----------------------

  const backBtn = document.getElementById('back');

  backBtn.addEventListener('click', () => {

    bookCloseSound.play();//閉じるボタン音

    // BGMをフェードアウトさせてから停止し、遷移する
    if (bgmSound.playing()) {
      const currentVolume = bgmSound.volume();
      bgmSound.fade(currentVolume, 0, 1000);
      
      setTimeout(() => {
        bgmSound.stop();
        window.location.href = '/main';
      }, 1000);// フェード時間と合わせる
    } else {
       window.location.href = '/main'; // BGMが再生されていなければ、すぐに遷移
    }
  });
});