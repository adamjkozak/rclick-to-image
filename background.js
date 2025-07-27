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
  const opts = await chrome.storage.local.get(['apiKey', 'size', 'quality', 'stylePrompt']);
  if (!opts.apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }
  const prompt = opts.stylePrompt ? `${text}, ${opts.stylePrompt}` : text;
  const size = opts.size || '1024x1024';
  const quality = opts.quality || 'standard';
  let progressWin;
  try {
    progressWin = await chrome.windows.create({
      url: chrome.runtime.getURL('progress.html'),
      type: 'popup',
      width: 400,
      height: 200
    });

    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opts.apiKey}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size,
        model: 'gpt-image-1',
        quality
      })
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
    chrome.windows.remove(progressWin.id);
  } catch (e) {
    console.error(e);

    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: msg => alert(msg),
      args: ["Error generating image: " + e.message]
    });

  } finally {
    if (progressWin && progressWin.id) {
      chrome.windows.remove(progressWin.id);
    }

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
