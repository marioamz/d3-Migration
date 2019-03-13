//



var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1100)
    .center([-102.34034978813841, 24.012062015793]);

var path = d3.geoPath().projection(projection);

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
        .text("% Experienced Danger");
var labels = ['0-12%', '12-24%', '24-36%', '36-48%', '48-60%'];
var legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
      svg3.select(".legendThreshold")
        .call(legend);


const url = 'https://gist.githubusercontent.com/ponentesincausa/46d1d9a94ca04a56f93d/raw/a05f4e2b42cf981e31ef9f6f9ee151a060a38c25/mexico.json';

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
        // d.total = d.properties.value;
        console.log(d.properties.value);
        //return '#fde0dd';
        return colorScale(d.properties.value);
        })
      .style("stroke", "#333")
      .style("stroke-width", ".2px")
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
			.text(d.properties.name, d.properties.value);
}

function mouseout() {
	d3.select("#tooltip").classed("hidden", true);
	d3.select(this).classed("highlight",false)
}


/* THIS IS THE CODE FOR CREATING MULTIPLE ITERATIONS OF THE SAME GRAPH
d3.json("build/mx_tj.json", function(error, mx) {
    const join = g1.selectAll("path")
      .data(topojson.object(mx, mx.objects.states).geometries);
    join
      .enter().append("path")
      .attr("d", path)
      .merge(join)
      .attr("fill", "transparent")
      .style("stroke", "#333")
      .style("stroke-width", ".2px")
      .attr("class", "muns");
    });
*/
