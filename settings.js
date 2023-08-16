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
  var selectedLanguage = document.getElementById('languageSelect').value;
  var url = 'https://thewordsponge.com/sponge/words/' + selectedLanguage;
  fetch(url, { credentials: 'include' })
      .then(response => {
        console.log(response.body);
        return response.json();
      })
      .then(data => {
        chrome.storage.local.set({ words: data }, () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      });
});

document.getElementById('languageSelect').addEventListener('change', function() {
  var selectedLanguage = this.value;
  chrome.storage.local.set({ 'language': selectedLanguage }, function() {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
});

function loadLanguageSetting() {
  chrome.storage.local.get('language', function(data) {
    if (data.language) {
      document.getElementById('languageSelect').value = data.language;
      console.log('Language setting loaded:', data.language);
    }
  });
}
document.addEventListener('DOMContentLoaded', loadLanguageSetting);