// get data from current active tab
let source = document.body.innerHTML;
// send putSource command 
chrome.runtime.sendMessage({action: 'putSource', source: source});
