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
  const opts = await chrome.storage.local.get(['apiKey', 'size', 'quality', 'stylePrompt', 'useLLM']);
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
    let url = data.data?.[0]?.url;
    if (!url) {
      // Handle newer response format with image_url field
      const img = data.data?.[0]?.image_url;
      if (typeof img === 'string') {
        url = img;
      } else if (img && typeof img.url === 'string') {
        url = img.url;
      }
    }
    if (!url) {
      const b64 = data.data?.[0]?.b64_json;
      if (b64) {
        url = `data:image/png;base64,${b64}`;
      }
    }
    if (!url) {
      throw new Error('Image URL missing in response');
    }
    chrome.downloads.download({url, filename: 'generated.png', saveAs: false});
    const viewer = chrome.runtime.getURL('viewer.html') +
                  '?url=' + encodeURIComponent(url);
    chrome.windows.create({url: viewer});
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
