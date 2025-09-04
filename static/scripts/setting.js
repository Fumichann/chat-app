const bgm = document.getElementById('bgm');
const se = document.getElementById('se');
const bgmSlider = document.getElementById('bgm-volume');
const seSlider = document.getElementById('se-volume');
const bgmSelect = document.getElementById('bgm-select');


const bgmFolder = '/static/audio/';

function saveSettings() {
  localStorage.setItem('bgmVolume', bgmSlider.value);
  localStorage.setItem('seVolume', seSlider.value);
  localStorage.setItem('selectedBGM', bgmSelect.value);
  
}

window.addEventListener('load', () => {
  const savedBGM = localStorage.getItem('bgmVolume');
  const savedSE = localStorage.getItem('seVolume');
  const savedBGMFile = localStorage.getItem('selectedBGM');

  if (savedBGM !== null) {
    bgmSlider.value = savedBGM;
    bgm.volume = savedBGM;
  }
  if (savedSE !== null) {
    seSlider.value = savedSE;
    se.volume = savedSE;
  }
  if (savedBGMFile) {
    bgmSelect.value = savedBGMFile;
    bgm.src = bgmFolder + savedBGMFile;
    bgm.load();
    bgm.play();
  } else {
    const defaultBGM = 'bgm1.mp3';
    bgm.src = bgmFolder + defaultBGM;
    bgmSelect.value = defaultBGM;
    bgm.load();
    bgm.play();
  }
});

bgmSlider.addEventListener('input', () => {
  bgm.volume = bgmSlider.value;
});

seSlider.addEventListener('input', () => {
  se.volume = seSlider.value;
  se.currentTime = 0;
  se.play();
});

bgmSelect.addEventListener('change', () => {
  const selectedBGM = bgmSelect.value;
  bgm.src = bgmFolder + selectedBGM;
  bgm.load();
  bgm.play();
  localStorage.setItem('selectedBGM', selectedBGM);
});

// タブ切り替え
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


// 履歴保存設定
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const saveToggle = document.getElementById("saveToggle");
  saveToggle.checked = localStorage.getItem("saveHistory") === "true";
  saveToggle.addEventListener("change", () => {
    localStorage.setItem("saveHistory", saveToggle.checked);
  });

  // ===== 履歴削除モーダル =====
  const modal = document.getElementById('deleteConfirmModal');
  const modalMessage = document.getElementById('modalMessage');
  const confirmBtn = document.getElementById('confirmDelete');
  const cancelBtn = document.getElementById('cancelDelete');

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