# lds-plugin
Chrome extension for data visualization of LDS cache.

Dependency graph:
- parent `RecordRepresentation` points to children `__fields__`
- Directed acyclic graph

Histogram:
- in progress

Plugin outline:
- manifest.json file: metadata
- popup file: on open, triggers `content.js`
- content script: sends message to LDS page, receives cache data response and posts it for `background.js`
— also modified `lds lightning platform ldsInstrumentation` to, on message, post records data  
- background script: listens for `putSource` message from `content.js`, and `getSource` message from `newTab.js`
- newTab file: requests data from `background.js`, uses D3 to display graphs

