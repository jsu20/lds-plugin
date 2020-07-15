//from '__' import 'jdd' jdd is global
//from '' import 'slider'



function isRecord(key) {
    return key.includes('UiApi::RecordRepresentation') && !key.includes('__fields__');
  }
  
  
  // recursive function that builds Tree JSON object
  function makeTreeJSON(key, recs) {
    let obj = {'name':key};
    if (!(key in recs)) {
      console.log('key not in recs');
      console.log(key);
    }
    if (!('fields' in recs[key]) && (recs[key]['value'] === null || typeof(recs[key]['value'])!=='object')) { // is a leaf
      console.log('obj '+key);
      console.log(obj);
      return obj;
    }
  
    obj['children'] = [];
  
    // must be field
    if (!('fields' in recs[key])) {
      // special check for child Record
      let ref = recs[key]['value']['__ref']
      let ref_obj = makeTreeJSON(ref, recs);
      obj['children'].push(ref_obj);
      return obj;
    }
  
    let fields = recs[key]['fields'];
    for (let field in fields) {
      // if (field == '__proto__') {
      //   continue;
      // }
  
      let ref = fields[field]['__ref'];
      console.log('field ref '+field+' '+ref);
      let ref_obj = makeTreeJSON(ref, recs);
      console.log('ref obj');
      console.log(ref_obj);
      obj['children'].push(ref_obj);
    }
    //
    // console.log('key '+key);
    // console.log(obj);
    console.log('obj '+key);
    console.log(obj);
    return obj;
  }
  
  // format Response JSON to pass into makeTreeJSON
  function formatResponse(response) {
    let parentArray = []; // child - parent relationship
    let recordsArray = []; // keeps track of all Records
    let recs;
    let original_names = {}; // for names that had () replaced
    let isRoot = {};
  
    let tree = {};
  
    if (response.source && response.source.records) {
      recs = response.source.records;
      console.log('recs');
      console.log(recs);
  
      for (let key in recs) {
  
        // is a field Record
        if (key.includes('__fields__') && recs[key]['value'] !== null && typeof(recs[key]['value']) == 'object' && ('__ref' in recs[key]['value'])) {
          let ref = recs[key]['value']['__ref']
          if (isRecord(ref)) {
            isRoot[ref] = false;
          }
        }
        else if (isRecord(key)) {
          // insert into recordsArray
          // if (!(key in recordsArray)) {
          //   recordsArray.push(key);
          // }
          if (!(key in isRoot)) {
            isRoot[key] = true;
            console.log('true key');
            console.log(key);
          }
          // get all fields
          if (recs[key]['fields']) {
            let fields = recs[key]['fields'];
            for (let field in fields) {
              let ref = fields[field]['__ref'];
              if (isRecord(ref)) {
                isRoot[ref] = false;
              }
              
            }
          }
        }
      }
  
      // get root and root children
      let root = 'root';
  
      recs[root] = {"apiName": "root","fields":{}};
      for (let key in isRoot) {
        if (isRoot[key]) {
          recs[root]['fields'][key] = {'__ref':key};
        }
      }
     
      return recs;
  
    }
  }

  // stores tabId that opened this devtools window
  let tabId = null;
  let prevData = null;
  let currData = null;
  let step_data = [];
  let string_data = [];
  let ingest_data = [];
  let graph_data = [];
  let method_history = [];

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('got message');
    
    if (request.tabId == tabId && request.action == 'giveSource') {
      alert('giveSource');
      method_history.push(request.method);
      alert(request.method);
      if (request.method != 'storeBroadcast') {
        let new_recs = formatResponse(request);
        let treeData = makeTreeJSON('root', new_recs);

        graph_data.push(treeData);
        step_data.push(step_data[step_data.length-1]+1);
        
        var date = new Date();
        var hours = date.getHours();
        // var days = date.getDay(); 
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        string_data.push(hours + ":" + minutes + ":" + seconds);
        prevData = currData;
        currData = treeData;
        // generateTree(treeData, new_recs);
        // generateJSON(prevData, currData);
        ingested = request.args; // key, request, response. key+request empty if Aura.
        ingest_data.push(ingested);
        
        slider.rangeSlider(step_data, string_data, graph_data, ingest_data, generateJSON);
        // slider.stepSlider(step_data, string_data, graph_data, ingest_data, generateJSON);
        // console.log(step_data);
        // console.log(string_data);
        // console.log(graph_data);
      }
    } 
  
  });
  
  //
chrome.runtime.sendMessage({action: 'getSource'}, function(response) {
    // format response to be put in sugiyama-DAG
    alert('getSource devtools');
    alert(response.tabId);
    console.log(response);
    tabId = response.tabId;
    let new_recs = formatResponse(response);
    console.log('new recs');
    console.log(new_recs);
    let treeData = makeTreeJSON('root', new_recs);
    console.log(treeData);
    currData = treeData;
    step_data.push(0);
    graph_data.push(treeData);

    var date = new Date();
    var hours = date.getHours();
    // var days = date.getDay(); 
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    string_data.push(hours + ":" + minutes + ":" + seconds);
    // generateTree(treeData, new_recs);
    ingest_data.push('');

    slider.rangeSlider(step_data, string_data, graph_data, ingest_data, generateJSON);
    // slider.stepSlider(step_data, string_data, graph_data, ingest_data, generateJSON);
});
  
function generateJSON(data, data2) {
    // alert(JSON.stringify(data));
    // alert(JSON.stringify(data2));
    console.log('data');
    console.log(data);
    console.log(data2);
    
    jdd.compare(data, data2);
    
    $('#sample').click(function (e) {
        e.preventDefault();
        jdd.loadSampleData();
    });
    
    $(document).keydown(function (event) {
        if (event.keyCode === 78 || event.keyCode === 39) {
            /*
            * The N key or right arrow key
            */
            jdd.highlightNextDiff();
        } else if (event.keyCode === 80 || event.keyCode === 37) {
            /*
            * The P key or left arrow key
            */
            jdd.highlightPrevDiff();
        }
    });
}