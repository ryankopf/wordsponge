document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['words'], (result) => {
    if (result.words) {
      const wordList = Object.entries(result.words)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      document.getElementById('wordList').value = wordList;
    }
  });
});

document.getElementById('saveButton').addEventListener('click', () => {
  const wordList = document.getElementById('wordList').value.split('\n');
  const words = {};
  wordList.forEach(line => {
    const [key, value] = line.split(/: ?/).map(item => item.trim());
    if (key && value) words[key] = value;
  });
  chrome.storage.local.set({ words: words }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      document.querySelector('.results').innerHTML = chrome.runtime.lastError.message;
    } else {
      console.log('Words saved successfully.');
      document.querySelector('.results').innerHTML = 'Words saved successfully.';
    }
  });
});

document.getElementById('updateWordsButton').addEventListener('click', () => {
    fetch('https://thewordsponge.com/sponge/words', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
          chrome.storage.local.set({ words: data }, () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          });
        });
});
