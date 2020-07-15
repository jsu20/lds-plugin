// Simple
var data = [0, 0.005, 0.01, 0.015, 0.02, 0.025];

// var sliderSimple = d3
// .sliderBottom()
// .min(d3.min(data))
// .max(d3.max(data))
// .width(300)
// .tickFormat(d3.format('.2%'))
// .ticks(5)
// .default(0.015)
// .on('onchange', val => {
//     d3.select('p#value-simple').text(d3.format('.2%')(val));
// });

// var gSimple = d3
// .select('div#slider-simple')
// .append('svg')
// .attr('width', 500)
// .attr('height', 100)
// .append('g')
// .attr('transform', 'translate(30,30)');

// gSimple.call(sliderSimple);

// d3.select('p#value-simple').text(d3.format('.2%')(sliderSimple.value()));

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
    rangeSlider: function(step_data, string_data, graph_data, ingest_data, format_function) {
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
            .width(300)
            .tickFormat(val => string_data[val]) // string_data stores string data to put in slider ticks
            .ticks(step_data.length - 1)
            .default([step_data[0], step_data[0]])
            .step(1)
            .fill('#2196f3')
            .on('onchange', val => {
                format_function(graph_data[val[0]], graph_data[val[1]]);
                d3.select('p#value-range').text(val.join('-'));
            });

        var gRange = d3
            .select('div#slider-range')
            .append('svg')
            .attr('width', 500)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');

        gRange.call(sliderRange);
        
        d3.select('p#value-range').text(
            sliderRange
            .value()
            .join('-')
        );
        // graph_data = [1, 2, 3];
        // console.log(sliderStep.value());
        // console.log(graph_data[sliderStep.value()])
        // d3.select('p#value-step').text(JSON.stringify(graph_data[sliderStep.value()])); 
    }
}