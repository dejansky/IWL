chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log('Intercepted request: ', details);
    // Add your logic here
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  // Your background script code here
});
