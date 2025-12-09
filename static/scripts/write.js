document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('msgForm');
  const userMsg = document.getElementById('userMsg');
  const aiReplyContainer = document.getElementById('aiReplyContainer');

  const haikei = document.querySelector(".haikei");
  const textarea = document.querySelector(".paper-text");
  const middle = document.querySelector(".paper-middle");
  const papers = document.querySelector('.letter-paper');
  const bottle = document.querySelector('.bot');
  const submit = document.getElementById('submit');
  const light = document.getElementById('light');

  let storageType = localStorage.getItem('volume-storage-type') || 'local';

  //ローカルかセッションかの取得
  function getStorage() {
    return (storageType === 'local') ? localStorage : sessionStorage;
  }

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

    autoResize();
  }

  textarea.addEventListener("input", autoResize);
  window.addEventListener("resize",resizeLetter);

  autoResize();
  resizeLetter();

const submitArea = document.getElementById("submit");

submitArea.addEventListener("click", (e) => {
  // ボタンなので本来 preventDefault しなくてもいいが、
  // 自前 submit 処理を優先させるなら残してOK
  e.preventDefault();
  form.requestSubmit();
});

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userMsg.value.trim();
    const submitButton = document.getElementById("submit");

    if (!userMessage) {
      aiReplyContainer.innerHTML = '<p style="color:red;">メッセージを入力してください。</p>';
      return;
    }


    // --- 1. ボタンの無効化とローディング表示 ---
    let originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '海に投げる (送信中...)';

    // フォーム非表示
    form.style.display = 'none';
    light.style.display = 'none';

    aiReplyContainer.innerHTML = `<p class="sending"></p>`;
    haikei.style.backgroundImage = 'url("/static/image/haikei/kari.PNG")'; 



    try {
      const response = await fetch('/api/reply', {
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

      // ユーザーの手紙は保存せず、AIの返答だけ保存
      saveChatHistory(data.reply);

      // 画面にAI返信を表示
      aiReplyContainer.innerHTML = `
        <div class="response">
          <strong>届いた漂流瓶</strong>
          <p>${data.reply}</p>
        </div>
      `;
    } catch (error) {
      console.error('通信処理中にエラー:', error);
      aiReplyContainer.innerHTML = `<p style="color:red;">通信に失敗しました。${error.message ? ' (' + error.message + ')' : ''}</p>`;
    } finally {
      userMsg.value = '';
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  function saveChatHistory(aiText) {
    if (getStorage().getItem("saveHistory") !== "true") return;
    
    const logs = JSON.parse(getStorage().getItem('letters') || '[]');
    
    // 日付の形式を 'YYYY-MM-DD' に統一（時間情報を含めない）
    const now = new Date();
    const dateString = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + // 月は 0 から始まるため +1
      String(now.getDate()).padStart(2, '0');

    logs.push({
      content: aiText,
      date: dateString,
      id: Date.now() + Math.random().toString(36).substring(2, 9) // 衝突防止のため乱数を追加
    });

    getStorage().setItem('letters', JSON.stringify(logs));
    console.log("AI返信履歴を保存しました:", dateString);
  }

});
