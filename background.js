// var connections = {};
// stores this tabId
let tabId = null;
chrome.runtime.onConnect.addListener(function (port) {

    // var extensionListener = function (message, sender, sendResponse) {
    //
    //     // The original connection event doesn't include the tab ID of the
    //     // DevTools page, so we need to send it explicitly.
    //     if (message.name == "init") {
    //       connections[message.tabId] = port;
    //       tabId = message.tabId;
    //       //window.postMessage({ type: 'GET_CACHE_DATA', text: "From bkg script." }, "*");
    //       alert('got tabId');
    //       return;
    //     }
    // }
    var devToolsListener = function(message, sender, sendResponse) {
        // Inject a content script into the identified tab
        // alert(message.tabId);
        tabId = message.tabId;
        chrome.tabs.executeScript(message.tabId,
            { file: message.scriptToInject });
    }

    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(devToolsListener);

    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(devToolsListener);
        // var tabs = Object.keys(connections);
        // for (var i=0, len=tabs.length; i < len; i++) {
        //   if (connections[tabs[i]] == port) {
        //     delete connections[tabs[i]]
        //     break;
        //   }
        // }
    });
});

let source = null; // will be set after putSource is executed
//
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'initialPutSource') {
        // alert(JSON.stringify(sender));
        // alert(sender.id);
        source = request.source;
        // alert(JSON.stringify(source));
    }
    // sent from DevTools, intended for saving source
    if (request.action === 'putSource') {
        // alert('putSource');
        source = request.source;
        let method = request.method;
        let args = request.args;
        chrome.runtime.sendMessage({action:'giveSource', source:source, tabId:tabId, method:method, args:args});
    }
    // sent from new tab, to get the source
    if(request.action === 'getSource') {
        // sending source
        // alert('background getSource');
        // alert(JSON.stringify(source));
        sendResponse({ source: source, tabId:tabId });
    }

    if (request.action === 'adapterCall') {
        // alert('adapterCall');
        // alert(request.name);
        // alert(JSON.stringify(request.config));
    }
});
