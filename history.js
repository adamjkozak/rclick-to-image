async function loadHistory() {
  const {history = []} = await chrome.storage.local.get('history');
  const container = document.getElementById('history');
  container.innerHTML = '';
  history.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';
    const title = document.createElement('h3');
    const date = new Date(entry.time).toLocaleString();
    title.textContent = `${date} - ${entry.prompt}`;
    div.appendChild(title);
    const imgWrap = document.createElement('div');
    imgWrap.className = 'images';
    (entry.urls || []).forEach(url => {
      const img = document.createElement('img');
      img.src = url;
      img.title = 'Click to copy URL';
      img.addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => alert('URL copied to clipboard')); 
      });
      imgWrap.appendChild(img);
    });
    div.appendChild(imgWrap);
    container.appendChild(div);
  });
}

document.getElementById('clear').addEventListener('click', async () => {
  await chrome.storage.local.set({history: []});
  loadHistory();
});

loadHistory();
