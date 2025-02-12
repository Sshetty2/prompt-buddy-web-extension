chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const platforms = ['chatgpt.com', 'claude.ai', 'perplexity.ai'];

    if (platforms.some(platform => tab.url?.includes(platform))) {
      chrome.tabs.sendMessage(tabId, {
        type: 'PAGE_RELOADED',
        url : tab.url
      });
    }
  }
});
