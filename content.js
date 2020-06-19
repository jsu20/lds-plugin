// global variable to check if we have already sent a message; prevents running again after clicking again
window.sentMessage = false;

if (!window.sentMessage) {
  window.postMessage({ type: 'GET_CACHE_DATA', text: "Response from content script." }, "*");
}
window.addEventListener("message", function (event) {
  // We only accept messages from ourselves. frames to allow component test scenario.
  if (window.sentMessage || event.source !== window && event.source !== window.frames[0])
    return;

  if (event.data.type) {
    if (event.data.type == "CACHE_CONTENTS") {
      window.sentMessage = true;
      // get source
      source = event.data.source;
      alert(JSON.stringify(event.data));
      alert('in content');
      chrome.runtime.sendMessage({action: 'putSource', source: source});
    }
  }
});
