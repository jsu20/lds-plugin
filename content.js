// requests cache data from LDS page
window.postMessage({ type: 'INITIAL_GET_CACHE_DATA' }, "*");

window.addEventListener("message", function (event) {
    // only accept messages from ourselves
    if (event.source !== window && event.source !== window.frames[0])
        return;
    // alert('asdf');
    // alert(JSON.stringify(event));
    if (event.data.type) {
        if (event.data.type == "INITIAL_CACHE_CONTENTS") {
            // get source
            let source = event.data.source;
            // alert(JSON.stringify(event.data));
            alert('initial cache content');
            chrome.runtime.sendMessage({ 
                action: 'initialPutSource', 
                source: source,
                startTime: event.data.startTime,
                endTime: event.data.endTime 
            });
        }
        // checks if is proper request
        if (event.data.type == "CACHE_CONTENTS") {
            // get source
            // alert('getting cache contents');
            let source = event.data.source;
            // alert(JSON.stringify(event.data));
            alert('cache content');
            let args = event.data.args; // 
            // alert(JSON.stringify(args));
            let method = event.data.method; // storeIngest or storeEvict
            // alert(method);
            chrome.runtime.sendMessage({ 
                action: 'putSource', 
                source: source, 
                method: method, 
                args: args,
                startTime: event.data.startTime,
                endTime: event.data.endTime 
            });
        }

        if (event.data.type == 'ADAPTER_CALL') {
            alert('content_ADApter');
            chrome.runtime.sendMessage({ 
                action: 'adapterCall', 
                config: event.data.config, 
                name: event.data.name,
                startTime: event.data.startTime,
                endTime: event.data.endTime,
                method: event.data.method,
                name: event.data.name 
            });
        }

        if (event.data.type == 'BROADCAST') {
            alert('content_broadcast');
            chrome.runtime.sendMessage({ 
                action: 'broadcast',
                startTime: event.data.startTime,
                endTime: event.data.endTime,
                method: event.data.method
            });
        }
    }
});
