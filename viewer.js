// Display generated image passed via query parameter
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const url = params.get('url');
  if (url) {
    document.getElementById('img').src = url;
  }
});
