window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('history-container');
  const logs = JSON.parse(localStorage.getItem('chatHistory') || '[]');

  if (logs.length === 0) {
    container.innerHTML = '<p>履歴はありません。</p>';
    return;
  }

  // 日時フォーマット関数
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return '不明';
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString()}`;
  }

  logs.forEach((entry, index) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('historyItem');

    const content = document.createElement('div');
    content.classList.add('historyContent');

    if (entry.user !== undefined && entry.ai !== undefined) {
      const date = entry.date || '不明';
      content.innerHTML = `
        <p><strong>日時:</strong> ${formatDate(date)}</p>
        <p><strong>あなた:</strong> ${entry.user}</p>
        <p><strong>AI:</strong> ${entry.ai}</p>
      `;
    } else if (entry.role && entry.text) {
      const date = entry.date || '不明';
      content.innerHTML = `
        <p><strong>${entry.role === 'user' ? 'あなた' : 'AI'}:</strong> ${entry.text}</p>
        <p style="font-size: 0.8em; color: gray;"><strong>日時:</strong> ${formatDate(date)}</p>
      `;
    }

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '画像として保存';
    saveBtn.classList.add('saveItemBtn');

    saveBtn.addEventListener('click', () => {
      saveBtn.style.display = 'none';
      html2canvas(wrapper).then(canvas => {
        const link = document.createElement('a');
        link.download = `chat_item_${index + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).finally(() => {
        saveBtn.style.display = 'block'; 
      });
    });

    wrapper.appendChild(content);
    wrapper.appendChild(saveBtn);
    container.appendChild(wrapper);
  });
});