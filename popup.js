document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const domainNameElement = document.querySelector('.domain_name');

  // Get the current tab's URL and set the toggle switch state based on the stored value
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab && tab.url && tab.url.startsWith('http')) {
      const url = new URL(tab.url);
      domainNameElement.textContent = url.hostname;
      chrome.storage.sync.get([url.hostname], (result) => {
        toggle.checked = !result[url.hostname];
      });

      // Update the Chrome storage and content script when the toggle switch state changes
      toggle.addEventListener('change', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          const url = new URL(tab.url);
          chrome.storage.sync.set({ [url.hostname]: !toggle.checked }, () => {
            chrome.tabs.sendMessage(tab.id, { action: 'replaceWords' });
          });
        });
      });
    } else {
      toggle.disabled = true;
    }
  });
});
