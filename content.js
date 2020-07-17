// requests cache data from LDS page
window.postMessage({ type: 'INITIAL_GET_CACHE_DATA' }, "*");

window.addEventListener("message", function (event) {
    // only accept messages from ourselves
    if (event.source !== window && event.source !== window.frames[0])
        return;

    if (event.data.type) {
        if (event.data.type == "INITIAL_CACHE_CONTENTS") {
            // get source
            source = event.data.source;
            // alert(JSON.stringify(event.data));
            alert('initial cache content');
            chrome.runtime.sendMessage({ action: 'initialPutSource', source: source });
        }
        // checks if is proper request
        if (event.data.type == "CACHE_CONTENTS") {
            // get source
            alert('getting cache contents');
            source = event.data.source;
            // alert(JSON.stringify(event.data));
            // alert('cache content');
            args = event.data.args; // 
            // alert(JSON.stringify(args));
            method = event.data.method; // storeIngest or storeEvict
            // alert(method);
            chrome.runtime.sendMessage({ action: 'putSource', source: source, method: method, args: args });
        }

        if (event.data.type == 'ADAPTER_CALL') {
            chrome.runtime.sendMessage({ action: 'adapterCall', config: event.data.config, name: event.data.name });
        }

        if (event.data.type == 'BROADCAST') {
            chrome.runtime.sendMessage({ action: 'broadcast' });
        }
    }
});
