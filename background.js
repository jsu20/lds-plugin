let source = null; // will be set after putSource is executed

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'initialPutSource') {
        source = request.source;
        // create new tab
        chrome.tabs.create({ url: 'newTab.html' });
        // alert('in background');
    }
    // sent from current active tab, intended for saving source
    if (request.action === 'putSource') {
        source = request.source;
        // create new tab
        // chrome.tabs.create({ url: 'newTab.html' });
        // alert('in background');
    }
    // sent from new tab, to get the source
    if(request.action === 'getSource') {
        // sending source
        sendResponse({ source: source });
    }
});
