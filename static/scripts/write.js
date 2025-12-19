//音量を読み込む
function getVolume(key, defaultValue) {
  const savedVolume = localStorage.getItem(key);
  if (savedVolume !== null) {
    return parseFloat(savedVolume);
  }
  return defaultValue;
}

//Howler.js用のBGM変数
let mainBGM = null;

//Main bgm再生
function startMainBGM() {
  if (!mainBGM) {
    const targetVolume = getVolume('bgm-volume', 0.4);//bgm-volume がない時の音量　0.4
    mainBGM = new Howl({
      src: ['/static/audio/main beach2.mp3'],  
      loop: true,
      volume: 0,//0から開始
    });
    mainBGM.play();
    mainBGM.fade(0, targetVolume, 4000);//4秒かけてフェードイン
    console.log("Main BGM started in look.js");
  } else {
    const targetVolume = getVolume('bgm-volume', 0.4);//すでに再生中は音量を更新
    mainBGM.volume(targetVolume);
  }
}

// Main BGMの停止
function stopMainBGM(callback) {
  if (mainBGM) {
    mainBGM.fade(mainBGM.volume(), 0, 1000); // 1秒でフェードアウト
    setTimeout(() => {
      mainBGM.stop();
      mainBGM = null;      
      console.log("Main BGM stopped in look.js");
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
  src: ['/static/audio/walk beach.mp3'],
  volume: getVolume('se-volume', 0.3)//デフォルト0.3
});

// 送るボタン
const submitSound = new Howl({
  src: ['/static/audio/bottle-open.mp3'], 
  volume: getVolume('se-volume', 0.5)//デフォルト0.5
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('msgForm');
  const userMsg = document.getElementById('userMsg');

  const haikei = document.querySelector(".haikei");
  const textarea = document.querySelector(".paper-text");
  const middle = document.querySelector(".paper-middle");
  const papers = document.querySelector('.letter-paper');
  const bottle = document.querySelector('.bot');
  const submit = document.getElementById('submit');
  const light = document.getElementById('light');
  const backBtn = document.getElementById('back');
  const fade = document.getElementById('fade');

  const malert = document.getElementById('m-a');
  const msuccess = document.getElementById('m-s');
  const merror = document.getElementById('m-e');

  const nagare = document.getElementById('nagare')
  const n1 = document.querySelector('.nagare1');
  const n2 = document.querySelector('.nagare2');
  const n3 = document.querySelector('.nagare3');


  let storageType = localStorage.getItem('volume-storage-type') || 'local';

  //ローカルかセッションかの取得
  function getStorage() {
    return (storageType === 'local') ? localStorage : sessionStorage;
  }
  
  startMainBGM();//BGMのフェードイン再生開始

  const dataElem = document.getElementById('history-data');
  if (dataElem) {
    const aiMessage = dataElem.dataset.ai;
    const saveSetting = getStorage().getItem("saveHistory");
    if (saveSetting === "true" && aiMessage) {
      const history = JSON.parse(getStorage().getItem("letters") || "[]");
      const now = new Date();
      history.push({
        ai: aiMessage,
        date: now.toISOString()
      });
      getStorage().setItem("letters", JSON.stringify(history));
      console.log("履歴を保存しました（初回ロード時）");
    }
  }


  // 基準サイズ（棚画像の元サイズ）
  const baseWidth = 855;
  const baseHeight = 585;

  function autoResize() {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";

    // 中央部分の高さを textarea に追従させる
    middle.style.height = textarea.scrollHeight + "px";
  }

  function resizemessage() {
    // 画面が小さい時だけ縮める
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.8;

    const scaleW = maxWidth / baseWidth;
    const scaleH = maxHeight / baseHeight;

    // 大きくはしない（1が上限）
    const scale = Math.min(scaleW, scaleH, 1);

    malert.style.width = 155 * scale + 'px';
    malert.style.height = 25 * scale + 'px';
    malert.style.fontSize = 18 * scale + 'px';
    malert.style.padding = `${5 * scale}px ${10 * scale}px`;
    malert.style.marginBottom = 100 * scale + 'px'

    msuccess.style.width = 190 * scale + 'px';
    msuccess.style.height = 30 * scale + 'px';
    msuccess.style.fontSize = 22 * scale + 'px';
    msuccess.style.padding = `${8 * scale}px ${20 * scale}px`;
    msuccess.style.marginTop = 100 * scale + 'px';

    merror.style.width = 230 * scale + 'px';
    merror.style.height = 30 * scale + 'px';
    merror.style.fontSize = 20 * scale + 'px';
    merror.style.padding = `${8 * scale}px ${20 * scale}px`;
    merror.style.marginTop = 100 * scale + 'px';

  }

  function resizeLetter() {

    // 画面が小さい時だけ縮める
    const maxWidth = window.innerWidth * 0.7;
    const maxHeight = window.innerHeight * 0.9;

    const scaleW = maxWidth / baseWidth;
    const scaleH = maxHeight / baseHeight;

    // 大きくはしない（1が上限）
    const scale = Math.min(scaleW, scaleH, 1);
    
      // まずリサイズ処理を全部終わらせる
      papers.style.width = baseWidth * scale + 'px';
      papers.style.maxHeight = `${690 * scale}px`
      middle.style.minHeight = `${baseHeight * scale}px`; 
      
      bottle.style.width = 175 * scale + 'px';
      bottle.style.height = 900 * scale + 'px';
      submit.style.width = 157 * scale + 'px';
      submit.style.height = 260 * scale + 'px';
      backBtn.style.width = 175 * scale + 'px';
      backBtn.style.height = 205 * scale + 'px';
      nagare.style.width = baseWidth * scale + 'px';
      nagare.style.height = baseHeight * scale + 'px';

    autoResize();
    resizemessage();
  }

  textarea.addEventListener("input", autoResize);
  window.addEventListener("resize",resizeLetter);
  window.addEventListener("resize",resizemessage)

  autoResize();
  resizemessage();
  resizeLetter();
  



// 関数一覧

  // --- settimeoutの代わり ---
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- ボトル流し ---
  async function showBottle() {
    //SE再生
    submitSound.play();

    // --- フェード ---
    fade.classList.remove("hidden");
    await sleep(500);
    fade.style.opacity = 1;    
    await sleep(800);
    // フォーム非表示
    form.style.display = 'none';
    light.style.display = 'none';
    backBtn.style.display = 'none';
    haikei.style.backgroundImage = 'url("/static/image/haikei/main.JPG")'

    // --- ボトル ---
    n1.style.opacity = 1 ;
    await sleep(500);
    fade.style.opacity = 0;   
    await sleep(1500);
    n1.style.opacity = 0;
    n2.style.opacity = 1;
    await sleep(1500);
    n2.style.opacity = 0;
    n3.style.opacity = 0.8;
    await sleep(1300);
    n3.style.opacity = 0;
  }

  // --- メイン画面へ ---
  async function fadeOutAndGoMain() {
    fade.classList.remove("hidden");
    await sleep(3000);

    stopMainBGM(() => {
      fade.style.opacity = 1;
    });

    await sleep(3030);
    
    window.location.href = '/main';
  }


// -------- submitボタン ------------------------- 

  // -----発火用---------
  const submitArea = document.getElementById("submit");
  submitArea.addEventListener("click", (e) => {
    e.preventDefault();
    form.requestSubmit();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userMsg.value.trim();
    const submitButton = document.getElementById("submit");

    // ここで送信ブロック（requiredの代わり）
    if (userMessage === "") {
      malert.classList.add("show");
      setTimeout(() =>{
      malert.classList.remove("show");
      },2000)
      return;
    }


    // --- 画面切り替え ---------------------
    
    submitButton.disabled = true;

    try {
      await showBottle();
    } catch (error) {
      console.error("showBottle 内でエラー:", error);
      // ここで強制的に続行する
    }

    // -------fetch強行(6秒以内に届かないとエラー)----------------
    function fetchWithTimeout(url, options, timeout = 6000) {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("タイムアウトしました")), timeout)
        )
      ]);
    }

    // --- API送信 ----------------------
    try {
      const response = await fetchWithTimeout('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok){
        const errorText = await response.text();
        throw new Error(`通信エラー (${response.status} ${response.statusText}): ${errorText.substring(0, 100)}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('サーバー応答の解析に失敗しました。');
      }
            
      // --- 3. AI応答データのチェック ---
      if (!data.reply) {
        throw new Error('AIからの応答データが空でした。');
      }
      // ここで一時保存（画面遷移用）
      const storage = getStorage();

      storage.setItem("pendingReply", JSON.stringify({
        content: data.reply,
        date: dateString,
        createdAt: Date.now()
      }));

      // ユーザーの手紙は保存せず、AIの返答だけ保存
      saveChatHistory(data.reply);

      // --- 成功メッセージ ---
      msuccess.classList.add("show");
      setTimeout(() =>{
      msuccess.classList.remove("show");
      },3000)

    } catch (error) {

      console.error("fetch エラー:", error);

      // --- 失敗メッセージ ---
      merror.classList.add("show");
      setTimeout(() =>{
      merror.classList.remove("show");
      },3000)

    } finally {
      userMsg.value = '';
      submitButton.disabled = false;

      await fadeOutAndGoMain();
    }
  });

  function saveChatHistory(aiText) {
    // 現在の設定（local か session か）を取得
    const storageType = localStorage.getItem('volume-storage-type') || 'local';

    // もし 'session' (保存しない) なら、ここで処理を終了する
    if (storageType === 'session') {
      console.log("設定が『保存しない』のため、履歴は保存しません。");
      return;
    }

    // --- 以下、'local' (保存する) の時だけ実行される ---
    const storage = localStorage;
    const logs = JSON.parse(storage.getItem('letters') || '[]');
    
    // 日付の形式を 'YYYY-MM-DD' に統一（時間情報を含めない）
    const now = new Date();
    const dateString = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + // 月は 0 から始まるため +1
      String(now.getDate()).padStart(2, '0');

    logs.push({
      content: aiText,
      date: dateString,
      createdAt: Date.now(),
      id: Date.now() + Math.random().toString(36).substring(2, 9)
    });

    storage.setItem('letters', JSON.stringify(logs));
    console.log("AI返信履歴を保存しました:", dateString);
  }

  //--------- back -----------------------

  backBtn.addEventListener('click', () => {
    //se再生
    closeSound.play();
    stopMainBGM(() => {
      window.location.href = '/main';
    });
  });
});
