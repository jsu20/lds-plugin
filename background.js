let source = null; // will be set after putSource is executed

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // sent from current active tab, intended for saving source
    if(request.action === 'putSource') {
        source = request.source;
        // got source
        alert(source);
        // create new tab
        chrome.tabs.create({ url: 'newTab.html' });
    }
    // sent from new tab, to get the source
    if(request.action === 'getSource') {
        // sending source
        alert(source);
        sendResponse({ source: source });
    }
});
