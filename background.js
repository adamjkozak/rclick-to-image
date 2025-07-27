chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generate',
    title: 'Generate image from selection',
    contexts: ['selection']
  });
});

async function getSelectedText(tabId) {
  const [{result}] = await chrome.scripting.executeScript({
    target: {tabId},
    func: () => window.getSelection().toString()
  });
  return result;
}

async function generateImageFromSelection(tab) {
  const text = await getSelectedText(tab.id);
  if (!text) return;
  const opts = await chrome.storage.local.get(['apiKey', 'size', 'style']);
  if (!opts.apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }
  const prompt = opts.style ? `${text}, ${opts.style}` : text;
  const size = opts.size || '512x512';
  try {
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opts.apiKey}`
      },
      body: JSON.stringify({prompt, n: 1, size})
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error?.message || 'Failed to generate image');
    }
    const url = data.data?.[0]?.url;
    if (!url) {
      throw new Error('Image URL missing in response');
    }
    chrome.downloads.download({url, filename: 'generated.png', saveAs: false});
    chrome.windows.create({url});
  } catch (e) {
    console.error(e);

    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: msg => alert(msg),
      args: ["Error generating image: " + e.message]
    });

  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generate') {
    generateImageFromSelection(tab);
  }
});

chrome.action.onClicked.addListener((tab) => {
  generateImageFromSelection(tab);
});
