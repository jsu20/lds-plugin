let source = null; // will be set after putSource is executed

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'initialPutSource') {
        alert('initialPutSource');
        source = request.source;
        // create new tab
        chrome.tabs.create({ url: 'newTab.html' });
        // alert('in background');
    }
    // sent from current active tab, intended for saving source
    if (request.action === 'putSource') {
        alert('putSource');
        source = request.source;
        chrome.runtime.sendMessage({action:'giveSource', source:source})
        // create new tab
        // chrome.tabs.create({ url: 'newTab.html' });
        // alert('in background');
    }
    // sent from new tab, to get the source
    if(request.action === 'getSource') {
        // sending source
        alert('getSource');
        sendResponse({ source: source });
    }
});
