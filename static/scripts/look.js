window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('history-container');
  const logs = JSON.parse(localStorage.getItem('chatHistory') || '[]');

  if (logs.length === 0) {
    container.innerHTML = '<p>履歴はありません。</p>';
    return;
  }

  logs.forEach(entry => {
    const div = document.createElement('div');
    div.classList.add('historyItem');

    // 日時フォーマット関数
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      if (isNaN(date)) return '不明';
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString()}`;
    }

    // 新形式（user, ai, date）に対応
    if (entry.user !== undefined && entry.ai !== undefined) {
      const date = entry.date || '不明';
      div.innerHTML = `
        <p><strong>日時:</strong> ${formatDate(date)}</p>
        <p><strong>あなた:</strong> ${entry.user}</p>
        <p><strong>AI:</strong> ${entry.ai}</p>
      `;
    }

    // 旧形式（role, text, date）に対応
    else if (entry.role && entry.text) {
      const date = entry.date || '不明';
      div.innerHTML = `
        <p><strong>${entry.role === 'user' ? 'あなた' : 'AI'}:</strong> ${entry.text}</p>
        <p style="font-size: 0.8em; color: gray;"><strong>日時:</strong> ${formatDate(date)}</p>
      `;
    }

    container.appendChild(div);
  });
});
