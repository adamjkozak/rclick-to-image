document.addEventListener('DOMContentLoaded', async () => {
  const opts = await chrome.storage.local.get([
    'apiKey',
    'size',
    'quality',
    'stylePrompt',
    'useLLM',
    'numImages',
    'filenamePrefix',
    'historySize'
  ]);
  if (opts.apiKey) document.getElementById('apiKey').value = opts.apiKey;
  if (opts.size) document.getElementById('size').value = opts.size;
  document.getElementById('quality').value = opts.quality || 'auto';
  if (opts.stylePrompt) document.getElementById('stylePrompt').value = opts.stylePrompt;
  if (opts.numImages) document.getElementById('numImages').value = opts.numImages;
  if (opts.filenamePrefix) document.getElementById('filenamePrefix').value = opts.filenamePrefix;
  if (opts.historySize) document.getElementById('historySize').value = opts.historySize;
  document.getElementById('useLLM').checked = !!opts.useLLM;
});

document.getElementById('save').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKey').value;
  const size = document.getElementById('size').value;
  const quality = document.getElementById('quality').value;
  const stylePrompt = document.getElementById('stylePrompt').value;
  const numImages = parseInt(document.getElementById('numImages').value, 10) || 1;
  const filenamePrefix = document.getElementById('filenamePrefix').value || 'generated';
  const historySize = parseInt(document.getElementById('historySize').value, 10) || 20;
  const useLLM = document.getElementById('useLLM').checked;
  await chrome.storage.local.set({
    apiKey,
    size,
    quality,
    stylePrompt,
    numImages,
    filenamePrefix,
    historySize,
    useLLM
  });
  const status = document.getElementById('status');
  status.textContent = 'Saved!';
  setTimeout(() => status.textContent = '', 1000);
});

document.getElementById('viewHistory').addEventListener('click', () => {
  chrome.tabs.create({url: chrome.runtime.getURL('history.html')});
});
