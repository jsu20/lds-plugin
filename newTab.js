chrome.runtime.sendMessage({action: 'getSource'}, function(response) {
    document.body.innerHTML = response.source;
});
