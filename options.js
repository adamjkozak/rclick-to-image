document.addEventListener('DOMContentLoaded', async () => {
  const opts = await chrome.storage.local.get(['apiKey', 'size', 'quality', 'stylePrompt', 'useLLM']);
  if (opts.apiKey) document.getElementById('apiKey').value = opts.apiKey;
  if (opts.size) document.getElementById('size').value = opts.size;
  document.getElementById('quality').value = opts.quality || 'auto';
  if (opts.stylePrompt) document.getElementById('stylePrompt').value = opts.stylePrompt;
  document.getElementById('useLLM').checked = !!opts.useLLM;
});

document.getElementById('save').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value;
  const size = document.getElementById('size').value;
  const quality = document.getElementById('quality').value;
  const stylePrompt = document.getElementById('stylePrompt').value;
  const useLLM = document.getElementById('useLLM').checked;
  await chrome.storage.local.set({apiKey, size, quality, stylePrompt, useLLM});
  const status = document.getElementById('status');
  status.textContent = 'Saved!';
  setTimeout(() => status.textContent = '', 1000);
});
