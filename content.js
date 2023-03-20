function fetchAndUpdateWords() {
  const url = new URL(window.location.href);
  chrome.storage.local.get([url.hostname], (result) => {
    if (!result[url.hostname]) {
      fetch('https://thewordsponge.com/sponge/words', { credentials: 'include' })
          .then(response => response.json())
          .then(data => {
            chrome.storage.local.set({ words: data }, () => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
              }
            });
            setTimeout(function() { undo_translation(); do_traversal(); }, 1000);
          });
    } else {
      undo_translation();
    }
  });
}

function undo_translation() {
  const translatedWords = document.querySelectorAll('.translated-word');
  translatedWords.forEach(word => {
    const originalText = word.dataset.original;
    const parent = word.parentNode;
    parent.replaceChild(document.createTextNode(originalText), word);
  });
}

function replaceWordsInTextNode(textNode, words, count) {
  const text = textNode.nodeValue;
  let newText = text;

  for (const word in words) {
    const translation = words[word];
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    // newText = newText.replace(regex, `<span class="translated-word" data-original="${word}" data-translation="${translation}">${translation}</span>`);
    newText = newText.replace(regex, () => {
      return `<span class="translated-word" data-original="${word}" data-translation="${translation}">${translation}</span>`;
    });
  }

  if (newText !== text) {
    count += 1;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newText;
    const parentNode = textNode.parentNode;
    while (tempDiv.firstChild) {
      parentNode.insertBefore(tempDiv.firstChild, textNode);
    }
    parentNode.removeChild(textNode);
  }
}
function traverseDOM(node, words, insideSomethingToSkip = false, count = 1) {
  if (count > 10) {
    return;
  }
  if (node.nodeType === Node.TEXT_NODE && !insideSomethingToSkip) {
    replaceWordsInTextNode(node, words, count);
  } else {
    const tagsToSkip = ['a', 'input', 'script', 'style', 'textarea', 'pre', 'code'];
    let isSomethingToSkip = tagsToSkip.includes(node.nodeName.toLowerCase());
    const classesToSkip = ['ace_editor','notranslate','translated-word'];
    if (node.classList) {
      for (const className of classesToSkip) {
        if (node.classList.contains(className)) {
          isSomethingToSkip = true;
          break;
        }
      }
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      traverseDOM(node.childNodes[i], words, insideSomethingToSkip || isSomethingToSkip, count);
    }
  }
}

function toggleTranslation(event) {
  if (event.target.classList.contains('translated-word')) {
    const original = event.target.getAttribute('data-original');
    const translation = event.target.getAttribute('data-translation');
    event.target.textContent = event.target.textContent === original ? translation : original;
  }
}

chrome.storage.local.get(['words'], ({ words }) => {
  if (words) {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              traverseDOM(node, words);
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function(){traverseDOM(document.body, words)},1000);
    document.body.addEventListener('click', toggleTranslation);
  } else {
    fetchAndUpdateWords();
  }
});
function do_traversal() {
  chrome.storage.local.get(['words'], ({ words }) => {
    if (words) {
      traverseDOM(document.body, words)
    }
  });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'replaceWords') {
    fetchAndUpdateWords();
  }
});

/////////////////////////////////////////////////////////
// Now listen for changes to the language chosen.
document.addEventListener('DOMContentLoaded', () => {
  attachUpdateWordsButtonEventListener();
});
function handleClick() {
  fetchAndUpdateWords();
}
function attachUpdateWordsButtonEventListener() {
  const updateWordsButton = document.querySelector('#update-words-button');
  if (updateWordsButton) {
    console.log("Adding Listener");
    updateWordsButton.removeEventListener('click', handleClick);
    updateWordsButton.addEventListener('click', handleClick);
  }
}
function observeMutations() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        attachUpdateWordsButtonEventListener();
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

observeMutations();