// Display generated images passed via query parameter
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const urlsParam = params.get('urls');
  let urls = [];
  if (urlsParam) {
    try {
      urls = JSON.parse(urlsParam);
    } catch (e) {
      urls = [urlsParam];
    }
  }
  if (!Array.isArray(urls) || !urls.length) return;
  const container = document.getElementById('images');
  urls.forEach(u => {
    const img = document.createElement('img');
    img.src = u;
    img.title = 'Click to copy URL';
    img.addEventListener('click', () => {
      navigator.clipboard.writeText(u).then(() => alert('URL copied to clipboard'));
    });
    container.appendChild(img);
  });
});
