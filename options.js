document.addEventListener('DOMContentLoaded', async () => {
  const opts = await chrome.storage.local.get(['apiKey', 'size', 'quality', 'openaiStyle', 'stylePrompt']);
  if (opts.apiKey) document.getElementById('apiKey').value = opts.apiKey;
  if (opts.size) document.getElementById('size').value = opts.size;
  if (opts.quality) document.getElementById('quality').value = opts.quality;
  if (opts.openaiStyle) document.getElementById('openaiStyle').value = opts.openaiStyle;
  if (opts.stylePrompt) document.getElementById('stylePrompt').value = opts.stylePrompt;
});

document.getElementById('save').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value;
  const size = document.getElementById('size').value;
  const quality = document.getElementById('quality').value;
  const openaiStyle = document.getElementById('openaiStyle').value;
  const stylePrompt = document.getElementById('stylePrompt').value;
  await chrome.storage.local.set({apiKey, size, quality, openaiStyle, stylePrompt});
  const status = document.getElementById('status');
  status.textContent = 'Saved!';
  setTimeout(() => status.textContent = '', 1000);
});
