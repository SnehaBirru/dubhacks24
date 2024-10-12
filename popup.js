document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get('popupDisplay', (data) => {
    if (data.popupDisplay) {
      document.getElementById('cookieOutput').textContent = data.popupDisplay;
    } else {
      document.getElementById('cookieOutput').textContent = 'No cookie data found!';
    }
  });
});
