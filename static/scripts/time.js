// ------ 時間帯管理 ---------------------
export function getTimeKey1() {
  const hour = new Date().getHours();

  if (hour >= 7 && hour < 17) return "hiru";
  if ((hour >= 17 && hour < 19) || (hour >= 4 && hour < 7)) return "yuu";
  return "yoru";
}

export function getTimeKey2() {
  const hour = new Date().getHours();

    // 昼夜
    if ((hour >= 7 && hour < 17) || (hour >= 19 && hour <= 23) || (hour >= 0 && hour < 4)) return "hiru";
    // 朝夕
    return "yuu";
}



// 背景切り替え
export function applyTimeBackground(pageKey) {
  // 背景要素を取得
  const bg = document.querySelector(".time-bg");
  if (!bg) return;

    const time = getTimeKey1();

  // 現在の時間帯クラスを追加
  bg.classList.add(time);

  // 背景画像を切り替え
  bg.style.backgroundImage = `url(/static/image/haikei/${pageKey}-${time}.webp)`;
}



export function applyTimeImage(imgEl, folder, baseName, ext = "PNG") {
  if (!imgEl) return;
  const time = getTimeKey1();
  imgEl.src = `/static/image/${folder}/${baseName}-${time}.${ext}`;
}


export function applyTimeBtn(className, folder = "", baseName, ext = "PNG") {
    // クラスで複数要素取得
    const btns = document.querySelectorAll(`.${className}`);
    if (!btns.length) return;

    const time = getTimeKey2();
    const path = `/static/image/${folder}/${baseName}-${time}.${ext}`;

    // 各ボタンにカスタムプロパティを設定
    btns.forEach(btn => {
        btn.style.backgroundImage = `url(${path})`;
    });
}


export function applyTimeMesse(className, baseName, ext = "PNG") {
    // クラスで複数要素取得
    const elems = document.querySelectorAll(`.${className}`);
    if (!elems.length) return;

    const time = getTimeKey2();
    const path = `/static/image/${baseName}-${time}.${ext}`;

    // 各ボタンにカスタムプロパティを設定
    elems.forEach(el => {
        el.style.setProperty('--bg-image', `url(${path})`);
    });
}
