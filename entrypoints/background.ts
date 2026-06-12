import { defineBackground } from 'wxt/sandbox';

const key = 'novelReader.state';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async () => {
    const result = await chrome.storage.local.get(key);
    if (!result[key]) {
      await chrome.storage.local.set({
        [key]: {
          version: 1,
          config: {
            theme: 'Dark+ (default dark)',
            wordsPerPage: 800,
            fontFamily: 'Microsoft YaHei',
            fontSize: 14,
            sidebarVisible: true,
            lastOpenedBookId: null,
            autoCloseTimeout: 0,
          },
          books: [],
          progressByBookId: {},
          derivedByBookId: {},
        },
      });
    }
  });

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === 'openSidePanel' && sender.tab) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  });
});
