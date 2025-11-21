window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('history-container');
  const logs = JSON.parse(getStorage().getItem('chatHistory') || '[]');

  const previewModal = document.getElementById('preview-modal');
  const previewImage = document.getElementById('preview-image');
  const downloadConfirmBtn = document.getElementById('download-confirm-btn');
  const previewCloseBtn = document.getElementById('preview-close-btn');

  let currentCanvas = null;
  let currentFileName = '';

  if (logs.length === 0) {
    container.innerHTML = '<p>届いた漂流瓶はありません。</p>';
    return;
  }

  //ローカルかセッション
  function getStorage() {
    return (storageType === 'local') ? localStorage : sessionStorage;
  }


  // 日時フォーマット関数
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return '不明';
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.toLocaleTimeString('ja-JP', {hour:'2-digit',minute:'2-digit'})}`;
  }

  // 安全に要素を作成する関数
  function createParagraph(label, text) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label;
    p.appendChild(strong);
    p.appendChild(document.createTextNode(` ${text}`));
    return p;
  }

  logs.slice().reverse().forEach((entry, index) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('historyItem');

    const content = document.createElement('div');
    content.classList.add('historyContent');

    const date = entry.date || '不明';

    if (entry.ai !== undefined) {
      content.appendChild(createParagraph('日時:',formatDate(date)));
      content.appendChild(createParagraph('AI:', entry.ai));
    } else if (entry.role && entry.text) {
      content.appendChild(createParagraph(entry.role === 'user' ? 'あなた:' : 'AI:', entry.text));

      const dateP = document.createElement('p');
      dateP.style.fontSize = '0.8em';
      dateP.style.color = 'gray';
      dateP.appendChild(document.createElement('strong')).textContent = '日時:';
      dateP.appendChild(document.createTextNode(` ${formatDate(date)}`));
      content.appendChild(dateP);
    }

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '画像として保存';
    saveBtn.classList.add('saveItemBtn');

    saveBtn.addEventListener('click',() =>{
      saveBtn.disabled = true;
      saveBtn.style.display = 'none';

      html2canvas(wrapper).then(canvas => {
        currentCanvas = canvas;
        currentFileName = `chat_item_${index + 1}.png`;
        previewImage.src = canvas.toDataURL('image/png');
        previewModal.style.display = 'flex';
      }).finally(() => {
        saveBtn.disabled = false;
        saveBtn.style.display = 'block';
      });
    });

    wrapper.appendChild(content);
    wrapper.appendChild(saveBtn);
    container.appendChild(wrapper);
  });

  downloadConfirmBtn.addEventListener('click', () => {
    if (currentCanvas) {
      const link = document.createElement('a');
      link.download = currentFileName;
      link.href = currentCanvas.toDataURL('image/png');
      link.click();
    }
    previewModal.style.display = 'none';
    currentCanvas = null;
    currentFileName = '';
  });

  previewCloseBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
    currentCanvas = null;
    currentFileName = '';
  });

  previewModal.addEventListener('click', (event) => {
    if (event.target === previewModal) {
      previewModal.style.display = 'none';
      currentCanvas = null;
      currentFileName = '';
    }
  });
});
