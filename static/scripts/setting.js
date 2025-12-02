window.dispatchEvent(new Event('resize'));

// ストレージ種別読み込み（初回は local）
if (!localStorage.getItem('volume-storage-type')) {
  localStorage.setItem('volume-storage-type', 'local');
}
let storageType = localStorage.getItem('volume-storage-type') ;

// 実際の保存・読み込みで使う関数
function getStorage() {
  return (storageType === 'local') ? localStorage : sessionStorage;
}

//-----------フェード-----------------------
setTimeout(() => {
  const fade = document.getElementById('fade');
  if (fade) fade.style.opacity = 0 ;
}, 1000); // 読み込みが安定したら外す

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

//--------turn.js---------------------------------
$(function() {
  const $flipbook = $('#flipbook');

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

  // ページ送りボタン
  $('#previous').click(() => $flipbook.turn('previous'));
  $('#next').click(() => $flipbook.turn('next'));

  //ページめくり効果音の再生
  $flipbook.on('turning', (event, page, view) => {
    const turnAudio = document.getElementById('turn-audio');
    if (turnAudio) {
      turnAudio.volume = 1.0;
      turnAudio.currentTime = 0;
      turnAudio.play().catch(e => console.log("Audio play prevented:", e));
    }
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

//-------- BGM -------------------------------

function setupVolume(audioId, dotsId, muteId, numDots = 10) {
  const audio = document.getElementById(audioId);
  const dotsContainer = document.getElementById(dotsId);
  const muteBtn = document.getElementById(muteId);
  let muted = false;
  
  // 保存された音量を読み込む（無ければ1）
  let currentVolume = parseFloat(localStorage.getItem(audioId)) || 1;
  audio.volume = currentVolume;

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

  updateDots(audio.volume);

  // ドットクリック
  dotsContainer.addEventListener('click', e => {
    const rect = dotsContainer.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    ratio = Math.min(Math.max(ratio, 0), 1);
    ratio = Math.ceil(ratio * numDots) / numDots;
    currentVolume = ratio;
    audio.volume = ratio;
    muted = ratio === 0; // 0ならミュート扱い
    updateDots(ratio);
    localStorage.setItem(audioId, ratio);
  });

  // ミュートボタン
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    if (muted) {
      audio.dataset.prevVolume = audio.volume;
      audio.volume = 0;
	    muteBtn.src = (audioId.includes('bgm')) ? '/static/image/settei/mute2.PNG' : '/static/image/settei/mute4.PNG';
    } else {
      audio.volume = audio.dataset.prevVolume || 1;
      muteBtn.src = (audioId.includes('bgm')) ? '/static/image/settei/mute1.PNG' : '/static/image/settei/mute3.PNG';
    }
    updateDots(audio.volume);
    localStorage.setItem(audioId, audio.volume);
  });
}

// BGM と SE をそれぞれセットアップ
setupVolume('bgm-audio', 'bgm-dots', 'bgm-mute');
setupVolume('se-audio', 'se-dots', 'se-mute');

});

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


document.addEventListener('DOMContentLoaded', () => {
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

  function showMessage(msg) {
    const messageEl = document.getElementById('message');

      if (messageEl.classList.contains('show')) {
        // フェードアウトさせてから新しいメッセージをフェードイン
        messageEl.classList.remove('show');

        setTimeout(() => {
          messageEl.textContent = msg;
          messageEl.classList.add('show');
        }, 800); // CSS の transition と同じ時間
      } else {
        messageEl.textContent = msg;
        messageEl.classList.add('show');
      }

    if (messageTimeout) clearTimeout(messageTimeout);

    messageTimeout = setTimeout(() => {
      messageEl.classList.remove('show');
      messageTimeout = null;
    }, 3000);
  }

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

});

  //--------- back -----------------------

  const backBtn = document.getElementById('back');

  backBtn.addEventListener('click', () => {
    window.location.href = '/main'; 
  });