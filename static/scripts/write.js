document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('msgForm');
  const userMsg = document.getElementById('userMsg');
  const aiReplyContainer = document.getElementById('aiReplyContainer');
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userMsg.value.trim();
    const submitButton = form.querySelector('button[type="submit"]');

    if (!userMessage) {
      aiReplyContainer.innerHTML = '<p style="color:red;">メッセージを入力してください。</p>';
      return;
    }
    
    // --- 1. ボタンの無効化とローディング表示 ---
    let originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '海に投げる (送信中...)';

    // フォーム非表示
    userMsg.style.display = 'none';
    submitButton.style.display = 'none';
    aiReplyContainer.innerHTML = `<p class="sending"></p>`;

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
    logs.push({
      ai: aiText,
      date: new Date().toISOString()
    });
    getStorage().setItem('letters', JSON.stringify(logs));
  }
});


