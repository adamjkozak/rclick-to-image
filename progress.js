let value = 0;
setInterval(() => {
  value = (value + 5) % 105;
  document.getElementById('bar').style.width = `${value}%`;
}, 200);
