// Background page -- background.js
// alert('hi');
// chrome.runtime.onConnect.addListener(function(devToolsConnection) {
//     alert('he');
//     // assign the listener function to a variable so we can remove it later
//     var devToolsListener = function(message, sender, sendResponse) {
//         // Inject a content script into the identified tab
//         alert('bkg');
//         chrome.tabs.executeScript(message.tabId,
//             { file: message.scriptToInject });
//     }
//     // add the listener
//     devToolsConnection.onMessage.addListener(devToolsListener);
//
//     devToolsConnection.onDisconnect.addListener(function() {
//          devToolsConnection.onMessage.removeListener(devToolsListener);
//     });
// });


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
        alert('bkg');
        alert(message.tabId);
        tabId = message.tabId;
        chrome.tabs.executeScript(message.tabId,
            { file: message.scriptToInject });
    }


	// other message handling


    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(devToolsListener);

    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(devToolsListener);

        var tabs = Object.keys(connections);
        for (var i=0, len=tabs.length; i < len; i++) {
          if (connections[tabs[i]] == port) {
            delete connections[tabs[i]]
            break;
          }
        }
    });
});

// window.addEventListener("message", function (event) {
//   alert('message?');
//   if (event.source !== window && event.source !== window.frames[0])
//     return;
//
//   if (event.data.type) {
//     // checks if is proper request
//     if (event.data.type == "CACHE_CONTENTS") {
//       // get source
//       source = event.data.source;
//       alert('posting source');
//       chrome.runtime.sendMessage({action:'giveSource', source:source});
//       //connections[tabId].postMessage(source);
//     }
//   }
// });


//
//
// window.addEventListener("message", function (event) {
//   // only accept messages from ourselves
//   if (event.source !== window && event.source !== window.frames[0])
//     return;
//
//   if (event.data.type) {
//     // checks if is proper request
//     if (event.data.type == "CACHE_CONTENTS") {
//       // get source
//       source = event.data.source;
//       // alert(JSON.stringify(event.data));
//       alert('cache content');
//       // chrome.runtime.sendMessage({action: 'putSource', source: source});
//
//
//       if (sender.tab) {
//         var tabId = sender.tab.id;
//         if (tabId in connections) {
//           // if (request.action === 'initialPutSource') {
//           //     alert('initialPutSource');
//           //     source = request.source;
//           //     // create new tab
//           //     chrome.tabs.create({ url: 'newTab.html' });
//           //     // alert('in background');
//           // }
//           // sent from current active tab, intended for saving source
//           if (request.action === 'putSource') {
//             alert('putSource');
//             source = request.source;
//             chrome.runtime.sendMessage({action:'giveSource', source:source})
//             connections[tabId].postMessage(source);
//           }
//         } else {
//           console.log("Tab not found in connection list.");
//         }
//       } else {
//         console.log("sender.tab not defined.");
//       }
//       return true;
//     }
//   }
// });
//
// // Receive message from content script and relay to the devTools page for the
// // current tab
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     // Messages from content scripts should have sender.tab set
//     if (sender.tab) {
//       var tabId = sender.tab.id;
//       if (tabId in connections) {
//         // if (request.action === 'initialPutSource') {
//         //     alert('initialPutSource');
//         //     source = request.source;
//         //     // create new tab
//         //     chrome.tabs.create({ url: 'newTab.html' });
//         //     // alert('in background');
//         // }
//         // sent from current active tab, intended for saving source
//         if (request.action === 'putSource') {
//           alert('putSource');
//           source = request.source;
//           chrome.runtime.sendMessage({action:'giveSource', source:source})
//           connections[tabId].postMessage(source);
//         }
//       } else {
//         console.log("Tab not found in connection list.");
//       }
//     } else {
//       console.log("sender.tab not defined.");
//     }
//     return true;
// });
//
//
//
//
let source = null; // will be set after putSource is executed
//
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'initialPutSource') {
        alert('initialPutSource');
        alert(JSON.stringify(sender));
        alert(sender.id);
        source = request.source;
        // method = request.method;
        // args = request.args;
        alert(JSON.stringify(source));
        // sendResponse({ source: source });
        // chrome.runtime.sendMessage({action:'giveSource', source:source, tabId:tabId, method:method, args:args});
        // create new tab
        // chrome.tabs.create({ url: 'newTab.html' });
        // alert('in background');
    }
    // sent from DevTools, intended for saving source
    if (request.action === 'putSource') {
        alert('putSource');
        source = request.source;
        let method = request.method;
        let args = request.args;
        chrome.runtime.sendMessage({action:'giveSource', source:source, tabId:tabId, method:method, args:args});
        // create new tab
        // chrome.tabs.create({ url: 'newTab.html' });
        // alert('in background');
    }
    // sent from new tab, to get the source
    if(request.action === 'getSource') {
        // sending source
        alert('background getSource');
        alert(JSON.stringify(source));
        sendResponse({ source: source, tabId:tabId });
    }
});
