// requests cache data from LDS page
window.postMessage({ type: 'INITIAL_GET_CACHE_DATA', text: "From content script." }, "*");
// alert('content');
window.addEventListener("message", function (event) {
  // only accept messages from ourselves
  if (event.source !== window && event.source !== window.frames[0])
    return;

  if (event.data.type) {
    // checks if is proper request
    if (event.data.type == "INITIAL_CACHE_CONTENTS") {
      // get source
      source = event.data.source;
      // alert(JSON.stringify(event.data));
      alert('initial cache content');
      chrome.runtime.sendMessage({action: 'initialPutSource', source: source});
    }
    // checks if is proper request
    if (event.data.type == "CACHE_CONTENTS") {
      // get source
      source = event.data.source;
      // alert(JSON.stringify(event.data));
      // alert('cache content');
      args = event.data.keys;
      // alert(JSON.stringify(args));
      console.log('args');
      console.log(args);
      method = event.data.method;
      // alert(method);
      chrome.runtime.sendMessage({action: 'putSource', source: source});
    }
  }
});
