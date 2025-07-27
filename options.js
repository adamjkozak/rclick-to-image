document.addEventListener('DOMContentLoaded', async () => {
  const opts = await chrome.storage.local.get(['apiKey', 'size', 'style']);
  if (opts.apiKey) document.getElementById('apiKey').value = opts.apiKey;
  if (opts.size) document.getElementById('size').value = opts.size;
  if (opts.style) document.getElementById('style').value = opts.style;
});

document.getElementById('save').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value;
  const size = document.getElementById('size').value;
  const style = document.getElementById('style').value;
  await chrome.storage.local.set({apiKey, size, style});
  const status = document.getElementById('status');
  status.textContent = 'Saved!';
  setTimeout(() => status.textContent = '', 1000);
});
