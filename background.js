function createOrUpdateAlarm() {
  chrome.alarms.create('updateWords', { periodInMinutes: 60 * 24 });
}

chrome.runtime.onInstalled.addListener(() => {
  createOrUpdateAlarm();
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'updateWords') {
    chrome.runtime.sendMessage({ action: 'replaceWords' });
  }
});
