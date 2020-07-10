chrome.devtools.panels.create("LDS Cache Visualization",
    null,
    //"hope_tree.html",
    "slider/index.html",
    function(panel) {
      // code invoked on panel creation
    }
);

var backgroundPageConnection = chrome.runtime.connect({
   name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
    // Handle responses from the background page, if any
});

// Relay the tab ID to the background page
// chrome.runtime.sendMessage({
//     tabId: chrome.devtools.inspectedWindow.tabId,
//     scriptToInject: "content.js"
// });

backgroundPageConnection.postMessage({
  tabId: chrome.devtools.inspectedWindow.tabId,
  scriptToInject: "content.js"
});
//
// // Create a connection to the background page
// var backgroundPageConnection = chrome.runtime.connect({
//     name: "panel"
// });
//
// backgroundPageConnection.postMessage({
//     name: 'init',
//     tabId: chrome.devtools.inspectedWindow.tabId
// });
//
// chrome.devtools.panels.elements.createSidebarPane("My Sidebar",
//     function(sidebar) {
//         // sidebar initialization code here
//         sidebar.setObject({ some_data: "Some data to show" });
// });
