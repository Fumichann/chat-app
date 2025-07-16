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


// ===== 履歴保存設定の読み書き =====
document.addEventListener("DOMContentLoaded", () => {
  const saveToggle = document.getElementById("saveToggle");

  // 初期表示で localStorage の値を反映
  const savedSetting = localStorage.getItem("saveHistory");
  saveToggle.checked = savedSetting === "true";

  // 状態が変わったときに保存
  saveToggle.addEventListener("change", () => {
    localStorage.setItem("saveHistory", saveToggle);
    console.log("チェックボックスが変更されました！");
    console.log("履歴保存設定:", saveToggle.checked);
  });
});

// ===== saveSettings() が必要なら定義する =====
function saveSettings() {
  const saveToggle = document.getElementById("saveToggle");
  localStorage.setItem("saveHistory", saveToggle.checked);
  console.log("saveSettings 関数が呼ばれました");
  console.log("履歴保存設定:", saveToggle.checked);
}

