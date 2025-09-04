document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('msgForm');
  const userMsg = document.getElementById('userMsg');
  const aiReplyContainer = document.getElementById('aiReplyContainer');

  const dataElem = document.getElementById('history-data');
  if (dataElem) {
    const aiMessage = dataElem.dataset.ai;
    const saveSetting = localStorage.getItem("saveHistory");
    if (saveSetting === "true" && aiMessage) {
      const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      const now = new Date();
      history.push({
        ai: aiMessage,
        date: now.toISOString()
      });
      localStorage.setItem("chatHistory", JSON.stringify(history));
      console.log("履歴を保存しました（初回ロード時）");
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userMsg.value.trim();
    if (!text) return;

    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('通信エラー: ' + res.status);

      const data = await res.json();

      // ユーザーの手紙は保存せず、AIの返答だけ保存
      saveChatHistory(data.reply);

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

  function saveChatHistory(aiText) {
    const saveSetting = localStorage.getItem("saveHistory");
    if (saveSetting !== "true") return;

    const logs = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const now = new Date();
    logs.push({
      ai: aiText,
      date: now.toISOString()
    });
    localStorage.setItem('chatHistory', JSON.stringify(logs));
  }
});
