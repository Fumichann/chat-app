window.dispatchEvent(new Event('resize'));
console.log("JS 読み込まれてるぞ");

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

  // 背表紙クリックで左右判定
  const cover = document.getElementById('cover');
  cover.addEventListener('click', (e) => {
    const rect = cover.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      alert('左背表紙クリック');
    } else {
      alert('右背表紙クリック');
    }
  });

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

// 保存されたストレージタイプを読む（local / session）
let storageType = localStorage.getItem('volume-storage-type') || 'local';

// アイコン反映
storageBtn.src = (storageType === 'local') ? 'check1.PNG' : 'check2.PNG';

console.log("現在のストレージタイプ:", storageType);

// イベントリスナー
storageBtn.addEventListener('click', () => {
  // 切り替え
  storageType = (storageType === 'local') ? 'session' : 'local';

  // アイコン更新
  storageBtn.src = (storageType === 'local') ? 'check1.PNG' : 'check2.PNG';

  // 保存
  localStorage.setItem('volume-storage-type', storageType);

  console.log("切り替え後:", storageType);
});

// 実際の保存・読み込みで使う関数
function getStorage() {
  return (storageType === 'local') ? localStorage : sessionStorage;
}

  //---------delete------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 保存されてる手紙データ確認
  const storedLetter = localStorage.getItem('letters');
  const deleteBtn = document.getElementById('delete-btn');

  // データが無い場合 → 最初から gomi2.PNG にしておく
  if (!storedLetter || storedLetter === '[]') {
    deleteBtn.src = '/static/image/settei/gomi2.PNG';
  } else {
    deleteBtn.src = '/static/image/settei/gomi1.PNG';
  }

  // 削除ボタンの動作
  deleteBtn.addEventListener('click', () => {
    const storedLetter = localStorage.getItem('letters');

    if (!storedLetter || storedLetter === '[]') {
      alert('手紙はありません。');
      return;
    }

    const confirmDelete = confirm('保存した手紙を削除しますか？');
    if (!confirmDelete) return;

    localStorage.removeItem('letters');
    deleteBtn.src = '/static/image/settei/gomi2.PNG';
    alert('保存した手紙を削除しました。');
  });

  //--------- back -----------------------

  const backBtn = document.getElementById('back');

  backBtn.addEventListener('click', () => {
    window.location.href = '/main'; 
  });

});