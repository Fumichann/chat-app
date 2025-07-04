
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('msgForm');
  const userMsg = document.getElementById('userMsg');
  const aiReplyContainer = document.getElementById('aiReplyContainer');

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
    const logs = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    logs.push({ role, text });
    localStorage.setItem('chatHistory', JSON.stringify(logs));
  }
});
