window.addEventListener('DOMContentLoaded', () => {
  // === BGM・SE 設定 ===
  const bgmFrame = document.getElementById('bgm-frame');
  const se = document.getElementById('se');
  const bgmSlider = document.getElementById('bgm-volume');
  const seSlider = document.getElementById('se-volume');
  const bgmSelect = document.getElementById('bgm-select');
  const bgmFolder = '/static/audio/';

  const savedBGMVol = parseFloat(localStorage.getItem('bgmVolume')) || 0.5;
  const savedSEVol = parseFloat(localStorage.getItem('seVolume')) || 0.5;
  const savedBGMFile = localStorage.getItem('selectedBGM') || 'bgm1.mp3';

  bgmSlider.value = savedBGMVol;
  seSlider.value = savedSEVol;
  bgmSelect.value = savedBGMFile;
  se.volume = savedSEVol;

  // iframeが読み込まれたらBGM要素を取得
  if (bgmFrame){
    bgmFrame.addEventListener('load', () => {
      bgmFrame.contentWindow.postMessage({ type: 'setVolume', value: savedBGMVol }, '*');
      bgmFrame.contentWindow.postMessage({ type: 'setMusic', value: bgmFolder + savedBGMFile }, '*');
    });
  }

  // === SE 音量 ===
  seSlider.addEventListener('input', () => {
    const vol = parseFloat(seSlider.value);
    se.volume = vol;
    se.currentTime = 0;
    se.play();
    localStorage.setItem('seVolume', vol);
  });

// === BGM 音量 ===
  bgmSlider.addEventListener('input', () => {
    const vol = parseFloat(bgmSlider.value);
    localStorage.setItem('bgmVolume', vol);
    if (bgmFrame && bgmFrame.contentWindow) {
      bgmFrame.contentWindow.postMessage({ type: 'setVolume', value: vol }, '*');
    }
  });


// === BGM切り替え ===
  bgmSelect.addEventListener('change', () => {
    const selectedBGM = bgmSelect.value;
    localStorage.setItem('selectedBGM', selectedBGM);
    if (bgmFrame && bgmFrame.contentWindow) {
      bgmFrame.contentWindow.postMessage({ type: 'setMusic', value: bgmFolder + selectedBGM }, '*');
    }
  });

 // === タブ切り替え ===
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.tab;
      tabContents.forEach(content => {
        content.style.display = content.id === target ? 'block' : 'none';
      });
    });
  });


// ===== 履歴保存設定 =====
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const saveToggle = document.getElementById("saveToggle");
  const modal = document.getElementById('deleteConfirmModal');
  const modalMessage = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('confirmDelete');
  const cancelBtn = document.getElementById('cancelDelete');

// ===== チェックボックスの状態復元 =====
  saveToggle.checked = localStorage.getItem("saveHistory") === "true";
  saveToggle.addEventListener("change", () => {
    localStorage.setItem("saveHistory", saveToggle.checked);
  });

// ===== 履歴削除モーダル =====
  clearHistoryBtn.addEventListener('click', () => {
    modalMessage.textContent = "本当に履歴を削除しますか？";
    confirmBtn.style.display = cancelBtn.style.display = "inline-block";
    modal.classList.remove('hidden');
  });

  confirmBtn.addEventListener('click', () => {
    localStorage.removeItem("chatHistory");
    modalMessage.textContent = "履歴を削除しました";
    confirmBtn.style.display = cancelBtn.style.display = "none";
    setTimeout(() => modal.classList.add('hidden'), 3000);
  });

  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
});
