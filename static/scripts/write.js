document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('msgForm');
  const userMsg = document.getElementById('userMsg');
  const aiReplyContainer = document.getElementById('aiReplyContainer');

  const dataElem = document.getElementById('history-data');
  if (dataElem) {
    const userMessage = dataElem.dataset.user;
    const aiMessage = dataElem.dataset.ai;
    const saveSetting = localStorage.getItem("saveHistory");
    if (saveSetting === "true" && userMessage && aiMessage) {
      const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      history.push({ user: userMessage, ai: aiMessage });
      localStorage.setItem("chatHistory", JSON.stringify(history));
      console.log("履歴を保存しました（初回ロード時）");
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userMsg.value.trim();
    if (!text) return;

    // ユーザーメッセージをlocalStorageに保存
    saveMessage('user', text);

    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('通信エラー: ' + res.status);

      const data = await res.json();

      // AIの返答をlocalStorageに保存
      saveMessage('ai', data.reply);

      // 画面にAI返信を表示
      aiReplyContainer.innerHTML = `
        <div class="response">
          <strong>AIからの返信:</strong>
          <p>${data.reply}</p>
        </div>
      `;
    } catch (error) {
      console.error(error);
      aiReplyContainer.innerHTML = `<p style="color:red;">通信に失敗しました。</p>`;
    }

    userMsg.value = '';
  });

  function saveMessage(role, text) {
  const saveSetting = localStorage.getItem("saveHistory");
  if (saveSetting !== "true") return;  // 保存OFFなら保存しない

  const logs = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  logs.push({ role, text });
  localStorage.setItem('chatHistory', JSON.stringify(logs));
}

});
