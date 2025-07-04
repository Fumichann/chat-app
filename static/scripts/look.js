window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('history-container');
  const logs = JSON.parse(localStorage.getItem('chatHistory') || '[]');

  if (logs.length === 0) {
    container.innerHTML = '<p>履歴はありません。</p>';
    return;
  }

  logs.forEach(msg => {
    const entry = document.createElement('div');
    entry.className = 'message';
    entry.innerHTML = `<strong>${msg.role === 'user' ? 'あなた' : 'AI'}:</strong> ${msg.text}`;
    container.appendChild(entry);
  });
});
