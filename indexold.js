// this is to build the Mexico map
const url = 'https://gist.githubusercontent.com/ponentesincausa/46d1d9a94ca04a56f93d/raw/a05f4e2b42cf981e31ef9f6f9ee151a060a38c25/mexico.json';

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1100)
    .center([-102.34034978813841, 24.012062015793]);

var path = d3.geoPath().projection(projection);

var svg = d3.select("#cities_graph").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json(url, function(error, mx) {
  svg.selectAll("path")
    .data(mx.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", "transparent")
    .style("stroke", "#333")
    .style("stroke-width", ".5px")
    .attr("class", "muns");
});

// now I'm building the dots of frequency of visits in a city

// WORKS, ITERATING THROUGH COLUMNS
var columns = [['mex_port_long', 'mex_port_lat', 'sum'],
['city_long', 'city_lat', 'sum']]

d3.csv('d3data/gooeydata.csv', function(error, usa) {
  let state = 0;
  const newData = usa.map(row => {
    return {
      ...row,
      locations: columns.map(column => {
        return [Number(row[column[0]]), Number(row[column[1]]), Number(row[column[2]])];
      })
    };
  });

  var max = d3.max(newData, function(d) { return d.locations[state][2]; } );
  var scale = d3.scaleLinear()
    .domain([0, max])
    .range([5, 20]);

  svg.selectAll('circle')
    .data(newData)
    .enter()
    .append('circle')
    .attr('class', 'mexport')
    .attr('cx', function(d) {
      return projection([d.locations[state][0], d.locations[state][1]])[0];
    })
    .attr('cy', function(d) {
      return projection([d.locations[state][0], d.locations[state][1]])[1];
    })
    .attr('r', 2)
    .attr('fill', '#c51b8a');

  d3.select("#option").select("input")
    .on('click', d => {
      state += 1;
      console.log(state);
      svg.selectAll('.mexport')
        .transition().duration(1000)
        .attr('cx', function(d) {
          return projection([d.locations[state][0], d.locations[state][1]])[0];
        })
        .attr('cy', function(d) {
          return projection([d.locations[state][0], d.locations[state][1]])[1];
        })
        .attr('r', function(d) {
          return scale(d.locations[state][2]);
        })
        .style('opacity', 1.0)
        .style('fill-opacity', 0.5)
        .style('fill', '#fde0dd')
        .style('stroke', '#c51b8a')
    })
});

//now I'm building the caravan path as a comparison case


var svg2 = d3.select('#caravan_graph')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

var g1 = svg2.append('g');

d3.json(url, function(error, mx) {
    g1.selectAll("path")
      .data(mx.features)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", "transparent")
      .style("stroke", "#333")
      .style("stroke-width", ".5px")
      .attr("class", "muns");
    });

var cols = [['city_long', 'city_lat']]

d3.csv('d3data/Migrant_Caravan.csv', function(error, ups) {
  let states = 0;
    const newsData = ups.map(row => {
      return {
        ...row,
      locations: cols.map(col => {
        return [Number(row[col[0]]), Number(row[col[1]])];
          })
        };
      });

    var line = d3.line()
    .x(function(d) { return projection([d.locations[states][0], d.locations[states][1]])[0]; })
    .y(function(d) { return projection([d.locations[states][0], d.locations[states][1]])[1]; })
    .curve(d3.curveCardinal.tension(0));

    svg2.append("path")
      .data([newsData])
      .attr("class", "line")
      .style("stroke", '#df65b0')
      .style("fill", "none")
      .style("stroke-width", "1.5px")
      .attr("d", line);

    transition(d3.selectAll('path'));

    function tweenDash() {
   			var l = this.getTotalLength(),
   				i = d3.interpolateString("0," + l, l + "," + l);
   			return function (t) { return i(t); };
   		};

    function transition(selection) {
   		selection.each(function(){
        d3.select(this).transition()
   			.duration(12000)
   			.attrTween("stroke-dasharray", tweenDash);
         })
   		};

});


// THIS CREATES THE CHLOROPETH OF VIOLENCE

var svg3 = d3.select("#chloropeth").append("svg")
    .attr("width", width)
    .attr("height", height);

var colorScheme = d3.schemePurples[4];
        colorScheme.unshift("#eee");
var colorScale = d3.scaleThreshold()
            .domain([0, 0.12, 0.24, 0.36, 0.48, 0.6])
            .range(colorScheme);
        // Legend
var g = svg3.append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(20,20)");
    g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -6)
        .text("% of Migrants who Self-Reported Experiencing Danger in Each State");
var labels = ['0-12%', '12-24%', '24-36%', '36-48%', '48-60%'];
var legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
      svg3.select(".legendThreshold")
        .call(legend);

d3.csv("d3data/violence.csv", function(data) {
  d3.json(url, function(error, mx) {
    for (var i = 0; i < data.length; i++) {
      var dataState = data[i].State;
      var dataValue = parseFloat(data[i].Percentage);
      for (var j = 0; j < mx.features.length; j++) {
        var jsonState = mx.features[j].properties.name;
          if (dataState == jsonState) {
            mx.features[j].properties.value = dataValue;
            console.log(dataState, jsonState, dataValue);

            break;
          }
        }
      }



    svg3.selectAll("path")
      .data(mx.features)
      .enter().append("path")
      .attr("d", path)
      .classed("area",true)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight",true);
          drawTooltip(d);})
      .on('mouseout',mouseout)
      .attr("fill", function(d) {
        return colorScale(d.properties.value);
        })
      .style("stroke", "#333")
      .style("stroke-width", ".5px")
      .attr("class", "muns");
  });
});

function drawTooltip(d){
		var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;

		d3.select("#tooltip")
			.classed("hidden",false)
			.style("left", xPosition + "px")
			.style("top", yPosition + "px")
			.text(d.properties.name + ': ' + (d.properties.value*100) + '%');
}

function mouseout() {
	d3.select("#tooltip").classed("hidden", true);
	d3.select(this).classed("highlight",false)
}
