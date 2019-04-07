if (window.chrome) {

    chrome.browserAction.onClicked.addListener(function () {
        chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
    });
}

if (window.browser) {
    browser.browserAction.onClicked.addListener(function () {
        chrome.tabs.create({ url: browser.runtime.getURL("index.html") });
    });
}