function isRecord(key) {
    return key.includes('UiApi::RecordRepresentation') && !key.includes('__fields__');
}

// recursive function that builds Tree JSON object
function makeTreeJSON(key, recs) {
    let obj = { 'name': key };
    if (!(key in recs)) {
        console.log('key not in recs');
        console.log(key);
    }
    if (!('fields' in recs[key]) && (recs[key]['value'] === null || typeof (recs[key]['value']) !== 'object')) { // is a leaf
        console.log('obj ' + key);
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
        let ref = fields[field]['__ref'];
        console.log('field ref ' + field + ' ' + ref);
        let ref_obj = makeTreeJSON(ref, recs);
        console.log('ref obj');
        console.log(ref_obj);
        obj['children'].push(ref_obj);
    }
    // console.log('obj '+key);
    // console.log(obj);
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
            if (key.includes('__fields__') && recs[key]['value'] !== null && typeof (recs[key]['value']) == 'object' && ('__ref' in recs[key]['value'])) {
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

        recs[root] = { "apiName": "root", "fields": {} };
        for (let key in isRoot) {
            if (isRoot[key]) {
                recs[root]['fields'][key] = { '__ref': key };
            }
        }

        return recs;

    }
}


// var lanes = ["adapterCall", "storeIngest","storeBroadcast"],
// 			laneLength = lanes.length,
// 			items = [{"lane": 0, "id": "Qin", "start": 5, "end": 205},
// 					{"lane": 0, "id": "Jin", "start": 265, "end": 420},
// 					{"lane": 0, "id": "Sui", "start": 580, "end": 615},
// 					{"lane": 0, "id": "Tang", "start": 620, "end": 900},
// 					{"lane": 0, "id": "Song", "start": 960, "end": 1265},
// 					{"lane": 0, "id": "Yuan", "start": 1270, "end": 1365},
// 					{"lane": 0, "id": "Ming", "start": 1370, "end": 1640},
// 					{"lane": 0, "id": "Qing", "start": 1645, "end": 1910},
// 					{"lane": 1, "id": "Yamato", "start": 300, "end": 530},
// 					{"lane": 1, "id": "Asuka", "start": 550, "end": 700},
// 					{"lane": 1, "id": "Nara", "start": 710, "end": 790},
// 					{"lane": 1, "id": "Heian", "start": 800, "end": 1180},
// 					{"lane": 1, "id": "Kamakura", "start": 1190, "end": 1330},
// 					{"lane": 1, "id": "Muromachi", "start": 1340, "end": 1560},
// 					{"lane": 1, "id": "Edo", "start": 1610, "end": 1860},
// 					{"lane": 1, "id": "Meiji", "start": 1870, "end": 1900},
// 					{"lane": 1, "id": "Taisho", "start": 1910, "end": 1920},
// 					{"lane": 1, "id": "Showa", "start": 1925, "end": 1985},
// 					{"lane": 1, "id": "Heisei", "start": 1990, "end": 1995},
// 					{"lane": 2, "id": "Three Kingdoms", "start": 10, "end": 670},
// 					{"lane": 2, "id": "North and South States", "start": 690, "end": 900},
// 					{"lane": 2, "id": "Goryeo", "start": 920, "end": 1380},
// 					{"lane": 2, "id": "Joseon", "start": 1390, "end": 1890},
// 					{"lane": 2, "id": "Korean Empire", "start": 1900, "end": 1945}]
// 			timeBegin = 0,
// 			timeEnd = 2000;

function generateTimeline(lanes, items, timeBegin, timeEnd) {
    var laneLength = lanes.length;

    var m = [20, 15, 15, 120], //top right bottom left
			w = 960 - m[1] - m[3],
			h = 500 - m[0] - m[2],
			miniHeight = laneLength * 12 + 50,
			mainHeight = h - miniHeight - 50;

    //scales
    var x = d3.scale.linear()
            .domain([timeBegin, timeEnd])
            .range([0, w]);
    var x1 = d3.scale.linear()
            .range([0, w]);
    var y1 = d3.scale.linear()
            .domain([0, laneLength])
            .range([0, mainHeight]);
    var y2 = d3.scale.linear()
            .domain([0, laneLength])
            .range([0, miniHeight]);

    d3.select("body > svg").remove();
    var chart = d3.select("body")
                .append("svg")
                .attr("width", w + m[1] + m[3])
                .attr("height", h + m[0] + m[2])
                .attr("class", "chart");
    
    chart.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", w)
        .attr("height", mainHeight);

    var main = chart.append("g")
                .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
                .attr("width", w)
                .attr("height", mainHeight)
                .attr("class", "main");

    var mini = chart.append("g")
                .attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
                .attr("width", w)
                .attr("height", miniHeight)
                .attr("class", "mini");
    
    //main lanes and texts
    main.append("g").selectAll(".laneLines")
        .data(items)
        .enter().append("line")
        .attr("x1", m[1])
        .attr("y1", function(d) {return y1(d.lane);})
        .attr("x2", w)
        .attr("y2", function(d) {return y1(d.lane);})
        .attr("stroke", "lightgray")

    main.append("g").selectAll(".laneText")
        .data(lanes)
        .enter().append("text")
        .text(function(d) {return d;})
        .attr("x", -m[1])
        .attr("y", function(d, i) {return y1(i + .5);})
        .attr("dy", ".5ex")
        .attr("text-anchor", "end")
        .attr("class", "laneText");
    
    //mini lanes and texts
    mini.append("g").selectAll(".laneLines")
        .data(items)
        .enter().append("line")
        .attr("x1", m[1])
        .attr("y1", function(d) {return y2(d.lane);})
        .attr("x2", w)
        .attr("y2", function(d) {return y2(d.lane);})
        .attr("stroke", "lightgray");

    mini.append("g").selectAll(".laneText")
        .data(lanes)
        .enter().append("text")
        .text(function(d) {return d;})
        .attr("x", -m[1])
        .attr("y", function(d, i) {return y2(i + .5);})
        .attr("dy", ".5ex")
        .attr("text-anchor", "end")
        .attr("class", "laneText");

    var itemRects = main.append("g")
                        .attr("clip-path", "url(#clip)");
    
    //mini item rects
    mini.append("g").selectAll("miniItems")
        .data(items)
        .enter().append("rect")
        .attr("class", function(d) {return "miniItem" + d.lane;})
        .attr("x", function(d) {return x(d.start);})
        .attr("y", function(d) {return y2(d.lane + .5) - 5;})
        .attr("width", function(d) {return x(d.end - d.start);})
        .attr("height", 10);

    //mini labels
    mini.append("g").selectAll(".miniLabels")
        .data(items)
        .enter().append("text")
        .text(function(d) {return d.id;})
        .attr("x", function(d) {return x(d.start);})
        .attr("y", function(d) {return y2(d.lane + .5);})
        .attr("dy", ".5ex");

    //brush
    var brush = d3.svg.brush()
                        .x(x)
                        .on("brush", display);

    mini.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", 1)
        .attr("height", miniHeight - 1);

    display();
    
    function display() {
        var rects, labels,
            minExtent = brush.extent()[0],
            maxExtent = brush.extent()[1],
            visItems = items.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});

        mini.select(".brush")
            .call(brush.extent([minExtent, maxExtent]));

        x1.domain([minExtent, maxExtent]);

        //update main item rects
        rects = itemRects.selectAll("rect")
                .data(visItems, function(d) { return d.id; })
            .attr("x", function(d) {return x1(d.start);})
            .attr("width", function(d) {return x1(d.end) - x1(d.start);});
        
        rects.enter().append("rect")
            .attr("class", function(d) {return "miniItem" + d.lane;})
            .attr("x", function(d) {return x1(d.start);})
            .attr("y", function(d) {return y1(d.lane) + 10;})
            .attr("width", function(d) {return x1(d.end) - x1(d.start);})
            .attr("height", function(d) {return .8 * y1(1);});

        rects.exit().remove();

        //update the item labels
        labels = itemRects.selectAll("text")
            .data(visItems, function (d) { return d.id; })
            .attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});

        labels.enter().append("text")
            .text(function(d) {return d.id;})
            .attr("x", function(d) {return x1(Math.max(d.start, minExtent));})
            .attr("y", function(d) {return y1(d.lane + .5);})
            .attr("text-anchor", "start");

        labels.exit().remove();

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
let lanes = ["adapterCall", "storeIngest","storeBroadcast"];
let laneMap = {
    "adapterCall": 0,
    "storeIngest": 1,
    "storeBroadcast": 2
};
let items = [];
// function formatTime(time) {
//     let hours = time.getHours();
//     let minutes = time.getMinutes();
//     let seconds = time.getSeconds();
//     return 3600*hours + 60*minutes + seconds;
// }

function getId(request) {
    if (request.method == 'adapterCall') {
        return request.name;
    } else if (request.method == 'storeIngest') {
        return (request.args.key == '') ? 'aura' : request.args.key;
    } else if (request.method == 'storeBroadcast') {
        return 'b';
    }
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    alert('got message');
    // items = [{"lane": 0, "id": "Qin", "start": 5, "end": 205}]
    alert(request.action);
    if (request.tabId == tabId && (request.action == 'giveSource' || request.action == 'broadcast')) {
        alert(JSON.stringify(request));
        let newItem = {
            "lane": laneMap[request.method], 
            "id": getId(request), 
            "start": request.startTime,
             "end": request.endTime
            };
        items.push(newItem);
        console.log('items');
        console.log(items);
        console.log(items[0].start);
        console.log(items[items.length - 1].end);

        generateTimeline(lanes, items, items[0].start, items[items.length - 1].end);
        
        // method_history.push(request.method);
        // // alert(request.method);
        // if (request.method != 'storeBroadcast') {
        //     let new_recs = formatResponse(request);
        //     let treeData = makeTreeJSON('root', new_recs);

        //     graph_data.push(treeData);
        //     step_data.push(step_data[step_data.length - 1] + 1);

        //     var date = new Date();
        //     var hours = date.getHours();
        //     // var days = date.getDay(); 
        //     var minutes = date.getMinutes();
        //     var seconds = date.getSeconds();

        //     string_data.push(hours + ":" + minutes + ":" + seconds);
        //     prevData = currData;
        //     currData = treeData;
        //     // generateTree(treeData, new_recs);
        //     // generateJSON(prevData, currData);
        //     ingested = request.args; // key, request, response. key+request empty if Aura.
        //     ingest_data.push(ingested);

        //     slider.rangeSlider(step_data, string_data, graph_data, ingest_data, method_history, generateJSON);
        //     // slider.stepSlider(step_data, string_data, graph_data, ingest_data, generateJSON);
        //     // console.log(step_data);
        //     // console.log(string_data);
        //     // console.log(graph_data);
        // }
    }

});

//
chrome.runtime.sendMessage({ action: 'getSource' }, function (response) {
    alert('getSource devtools');
    alert(response.tabId);
    console.log(response);
    tabId = response.tabId;


    
    // let new_recs = formatResponse(response);
    // console.log('new recs');
    // console.log(new_recs);
    // let treeData = makeTreeJSON('root', new_recs);
    // console.log(treeData);
    // currData = treeData;
    // step_data.push(0);
    // graph_data.push(treeData);

    // var date = new Date();
    // var hours = date.getHours();
    // var minutes = date.getMinutes();
    // var seconds = date.getSeconds();

    // string_data.push(hours + ":" + minutes + ":" + seconds);
    // // generateTree(treeData, new_recs);
    // ingest_data.push(['initialCall', { baseUri: 'initialCall', basePath: '' }, {}]);

    // method_history.push(response.method);

    // slider.rangeSlider(step_data, string_data, graph_data, ingest_data, method_history, generateJSON);
    // slider.stepSlider(step_data, string_data, graph_data, ingest_data, generateJSON);
});

function generateJSON(data, data2) {
    // alert(JSON.stringify(data));
    // alert(JSON.stringify(data2));
    // console.log('data');
    // console.log(data);
    // console.log(data2);

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