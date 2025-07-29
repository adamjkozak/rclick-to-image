chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generate',
    title: 'Generate image from selection',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: 'view-history',
    title: 'View image history',
    contexts: ['all']
  });
});

async function getSelectedText(tabId) {
  const [{result}] = await chrome.scripting.executeScript({
    target: {tabId},
    func: () => window.getSelection().toString()
  });
  return result;
}

async function callLLM(apiKey, text) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Rewrite the provided text into a concise image generation prompt that accentuates descriptive adjectives and adds professional stylistic modifiers.'
        },
        { role: 'user', content: text }
      ]
    })
  });
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error?.message || 'Failed to enhance prompt');
  }
  return data.choices?.[0]?.message?.content?.trim() || text;
}

async function generateImageFromSelection(tab) {
  const text = await getSelectedText(tab.id);
  if (!text) return;
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
  if (!opts.apiKey) {
    chrome.runtime.openOptionsPage();
    return;
  }
  let basePrompt = text;
  if (opts.useLLM) {
    try {
      basePrompt = await callLLM(opts.apiKey, text);
    } catch (e) {
      console.error(e);
    }
  }
  const prompt = opts.stylePrompt ? `${basePrompt}, ${opts.stylePrompt}` : basePrompt;
  const size = opts.size || '1024x1024';
  const quality = opts.quality || 'auto';
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
        n: parseInt(opts.numImages, 10) || 1,
        size,
        model: 'gpt-image-1',
        quality
      })
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error?.message || 'Failed to generate image');
    }
    const extractUrl = item => {
      let u = item?.url;
      if (!u) {
        const img = item?.image_url;
        if (typeof img === 'string') {
          u = img;
        } else if (img && typeof img.url === 'string') {
          u = img.url;
        }
      }
      if (!u && item?.b64_json) {
        u = `data:image/png;base64,${item.b64_json}`;
      }
      return u;
    };
    const urls = (data.data || [])
      .map(extractUrl)
      .filter(Boolean);
    if (!urls.length) {
      throw new Error('Image URL missing in response');
    }
    const timestamp = Date.now();
    urls.forEach((u, i) => {
      const fname = `${opts.filenamePrefix || 'generated'}-${i + 1}-${timestamp}.png`;
      chrome.downloads.download({url: u, filename: fname, saveAs: false});
    });
    // store history
    try {
      const {history = [], historySize = 20} = await chrome.storage.local.get(['history', 'historySize']);
      history.unshift({prompt, urls, time: timestamp});
      while (history.length > parseInt(historySize, 10)) history.pop();
      await chrome.storage.local.set({history});
    } catch (e) {
      console.error('Failed to save history', e);
    }
    const viewer = chrome.runtime.getURL('viewer.html') +
                  '?urls=' + encodeURIComponent(JSON.stringify(urls));
    chrome.windows.create({url: viewer});
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
  } else if (info.menuItemId === 'view-history') {
    chrome.tabs.create({url: chrome.runtime.getURL('history.html')});
  }
});

chrome.action.onClicked.addListener((tab) => {
  generateImageFromSelection(tab);
});
