async function fetchAndUpdateWords() {
  const response = await fetch('https://thewordsponge.com/sponge/words', { credentials: 'include' });
  const data = await response.json();
  chrome.storage.local.set({ words: data }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
}
function replaceWords(words) {
  const bodyText = document.body.innerHTML;
  let newText = bodyText;

  for (const word in words) {
    const translation = words[word];
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    newText = newText.replace(regex, `<span class="translated-word" data-original="${word}" data-translation="${translation}">${translation}</span>`);
  }

  document.body.innerHTML = newText;
}

function replaceWordsInTextNode(textNode, words) {
  const text = textNode.nodeValue;
  let newText = text;

  for (const word in words) {
    const translation = words[word];
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    newText = newText.replace(regex, `<span class="translated-word" data-original="${word}" data-translation="${translation}">${translation}</span>`);
  }

  if (newText !== text) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newText;
    const parentNode = textNode.parentNode;
    while (tempDiv.firstChild) {
      parentNode.insertBefore(tempDiv.firstChild, textNode);
    }
    parentNode.removeChild(textNode);
  }
}
function traverseDOM(node, words, insideSomethingToSkip = false) {
  if (node.nodeType === Node.TEXT_NODE && !insideSomethingToSkip) {
    replaceWordsInTextNode(node, words);
  } else {
    const isSomethingToSkip = node.nodeName.toLowerCase() === 'a' || node.nodeName.toLowerCase() === 'input';
    for (let i = 0; i < node.childNodes.length; i++) {
      traverseDOM(node.childNodes[i], words, insideSomethingToSkip || isSomethingToSkip);
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
    traverseDOM(document.body, words);
    document.body.addEventListener('click', toggleTranslation);
  } else {
    fetchAndUpdateWords();
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'replaceWords') {
    fetchAndUpdateWords();
  }
});
