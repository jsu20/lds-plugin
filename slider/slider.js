function store_display(val, method_history) {
    let start = val[0];
    let end = val[1];
    let freq_cnts = {};
    freq_cnts['storeIngest'] = 0;
    freq_cnts['storeEvict'] = 0;
    freq_cnts['storeBroadcast'] = 0;

    for (let i = start+1; i <= end; i++) {
        freq_cnts[method_history[i]] += 1;
    }
    let prev = false;
    let displayText = "";
    console.log('freq');
    console.log(freq_cnts);
    methods = ['storeIngest', 'storeEvict', 'storeBroadcast'];
    for (let i in methods) {
        
        if (freq_cnts[methods[i]] > 0) {
            if (prev) {
                displayText += ", "
            }
            displayText += methods[i] + ": " + freq_cnts[methods[i]];
            prev = true;
        }

    }

    d3.select('p#store').text(
        displayText
    );
}

function store_request(val, ingest_data) {
    let req1 = ingest_data[val[0]][0];
    let req2 = ingest_data[val[1]][0];
    req1 = (req1 == '') ? 'Aura call' : req1;
    req2 = (req2 == '') ? 'Aura call' : req2;
    
    d3.select('p#request1').text(req1);
    d3.select('p#request2').text(req2);
}

var slider = {
    stepSlider: function(step_data, string_data, graph_data, ingest_data, format_function) {
// step_data = [0, 1, 2, 3, 4, 5, 6];
// string_data = ['a','b','c','d','e','f','g'];
// Step
        var sliderStep = d3
        .sliderBottom()
        .min(d3.min(step_data))
        .max(d3.max(step_data))
        .width(300)
        .tickFormat( val => string_data[val]) // string_data stores string data to put in slider ticks
        .ticks(step_data.length)
        .step(1)
        .default(1)
        .on('onchange', val => {
            if (val >= 1) {
                format_function(graph_data[val-1], graph_data[val]);
            }
            console.log('ingest data');
            console.log(ingest_data[val]);
            d3.select('p#value-step').text(JSON.stringify(ingest_data[val])); // gets updates val when new select ? 
        });
        d3.selectAll('svg#slider > *').remove();
        var gStep = d3
        //.select('div#slider-step')
        .select('svg#slider')
        //.append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

        gStep.call(sliderStep);
// graph_data = [1, 2, 3];
// console.log(sliderStep.value());
// console.log(graph_data[sliderStep.value()])
// d3.select('p#value-step').text(JSON.stringify(graph_data[sliderStep.value()])); 
    },
    rangeSlider: function(step_data, string_data, graph_data, ingest_data, method_history, format_function) {
        // step_data = [0, 1, 2, 3, 4, 5, 6];
        // string_data = ['a','b','c','d','e','f','g'];
        // Step
        
        // var sliderStep = d3
        // .sliderBottom()
        // .min(d3.min(step_data))
        // .max(d3.max(step_data))
        // .width(300)
        // .tickFormat( val => string_data[val]) // string_data stores string data to put in slider ticks
        // .ticks(step_data.length)
        // .step(1)
        // .default(1)
        // .on('onchange', val => {
        //     // if (val >= 1) {
        //     //     format_function(graph_data[val-1], graph_data[val]);
        //     // }
        //     // console.log('ingest data');
        //     // console.log(ingest_data[val]);
        //     if (step_data.length <= 1) {
        //         d3.select('p#value-range').text(sliderStep.value());
        //         format_function(graph_data[val], graph_data[val]);
        //     } else {
        //         format_function(graph_data[val[0]], graph_data[val[1]]);
        //         // d3.select('p#value-step').text(JSON.stringify(ingest_data[val])); // gets updates val when new select ? 
        //         d3.select('p#value-range').text(val.join('-'));
        //     }
        // });
        // d3.selectAll('svg#slider > *').remove();
        // var gStep = d3
        // //.select('div#slider-step')
        // .select('svg#slider')
        // //.append('svg')
        // .attr('width', 500)
        // .attr('height', 100)
        // .append('g')
        // .attr('transform', 'translate(30,30)');
        
        // gStep.call(sliderStep);
        // console.log(sliderStep.value());
        // if (step_data.length <= 1) {
        //     d3.select('p#value-range').text(sliderStep.value());
        // } else {
        //     d3.select('p#value-range').text(sliderStep.value().join('-'));
        // }






        // var data = [0];//, 0.015, 0.02, 0.025];
        
        var sliderRange = d3
            .sliderBottom()
            .min(d3.min(step_data))
            .max(d3.max(step_data))
            .width(step_data.length * 60)//(300)
            .tickFormat(val => string_data[val]) // string_data stores string data to put in slider ticks
            .ticks(step_data.length - 1)
            .default([step_data[0], step_data[0]])
            .step(1)
            .fill('#2196f3')
            .on('onchange', val => {
                format_function(graph_data[val[0]], graph_data[val[1]]);
                store_display(val, method_history);
                store_request(val, ingest_data)

                d3.select('p#value-range').text(val.join('-'));
            });
        
        d3.selectAll('svg#slider > *').remove();
        var gRange = d3
            //.select('div#slider-range')
            .select('svg#slider')
            //.append('svg')
            .attr('width', step_data.length * 100)//500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');
        
        gRange.call(sliderRange);
        
        d3.select('p#value-range').text(
            sliderRange
            .value()
            .join('-')
        );
        store_display(sliderRange.value(), method_history);
        store_request(sliderRange.value(), ingest_data)
        
        // graph_data = [1, 2, 3];
        // console.log(sliderStep.value());
        // console.log(graph_data[sliderStep.value()])
        // d3.select('p#value-step').text(JSON.stringify(graph_data[sliderStep.value()])); 
    }
}