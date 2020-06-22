// requests cache data from LDS page
window.postMessage({ type: 'GET_CACHE_DATA', text: "Response from content script." }, "*");

window.addEventListener("message", function (event) {
  // only accept messages from ourselves
  if (event.source !== window && event.source !== window.frames[0])
    return;

  if (event.data.type) {
    // checks if is proper request 
    if (event.data.type == "CACHE_CONTENTS") {
      // get source
      source = event.data.source;
      // alert(JSON.stringify(event.data));
      // alert('in content');
      chrome.runtime.sendMessage({action: 'putSource', source: source});
    }
  }
});
