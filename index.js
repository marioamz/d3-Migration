// this is to build the Mexico map

var x = d3.scaleLinear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, height])
    .range([height, 0]);

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1100)
    .center([-102.34034978813841, 24.012062015793]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

d3.json("build/mx_tj.json", function(error, mx) {
  svg.selectAll("path")
    .data(topojson.object(mx, mx.objects.states).geometries)
    .enter().append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", "transparent")
    .style("stroke", "#333")
    .style("stroke-width", ".2px")
    .attr("class", "muns");
});

// now I'm building dots for people deported from USA
/*
d3.csv('d3data/encodedusa.csv', function(error, usa) {
  console.log(usa);
  for(var i=0; i < usa.length; i++) {
    svg.selectAll('circle'+i)
    .data(usa)
    .enter()
    .append('circle')
    .attr('cx', function(d) {
      console.log(usa[i]['mex_port_lat']);
      return projection([d[usa[i]['mex_port_long']], d[usa[i]['mex_port_lat']]])[0];
    })
    .attr('cy', function(d) {
      return projection([d[usa[i]['mex_port_long']], d[usa[i]['mex_port_lat']]])[1];
    })
    .attr('r', 2)
    .style('fill', 'purple')
    .style('stroke', 'black');
}
});
*/

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var columns = [['mex_port_long', 'mex_port_lat', 'mex_port'], ['us_entry_long', 'us_entry_lat', 'us_entry'],
['firstcity_long', 'firstcity_lat', 'first_citynew'], ['secondcity_long', 'secondcity_lat', 'second_citynew'], ['longcity_long', 'longcity_lat', 'long_citynew']]

d3.csv('d3data/encodedusa.csv', function(error, usa) {
  console.log(usa);
  for(var i=0; i < columns.length; i++) {
    svg.selectAll('circle'+i)
    .data(usa)
    .enter()
    .append('circle')
    .attr('cx', function(d) {
      return projection([d[columns[i][0]], d[columns[i][1]]])[0];
    })
    .attr('cy', function(d) {
      return projection([d[columns[i][0]], d[columns[i][1]]])[1];
    })
    .attr('r', 2)
    .on("mouseover", function(e) {
      tooltip.transition()
      .duration(200)
      .style("opacity", .9);
      tooltip.html(e[columns[i][2]])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(e) {
      tooltip.transition()
      .duration(500)
      .style("opacity", 0);
    });
}
});


/*
d3.csv('d3data/encodedusa.csv', function(error, usa) {
  console.log(usa);
  svg.selectAll('circle')
  .data(usa)
  .enter()
  .append('circle')
  .attr('cx', function(d) {
    return projection([d.mex_port_long, d.mex_port_lat])[0];
  })
  .attr('cy', function(d) {
    return projection([d.mex_port_long, d.mex_port_lat])[1];
  })
  .attr('r', 2)
  .style('fill', 'purple')
  .style('stroke', 'black');
});


/*
svg.selectAll("circle")
          .data(data)
.enter() .append("circle") .attr("cx", function(d) {
return projection([d.lon, d.lat])[0]; })
.attr("cy", function(d) {
return projection([d.lon, d.lat])[1];
})
.attr("r", 5) .style("fill", "yellow") .style("stroke", "gray") .style("stroke-width", 0.25) .style("opacity", 0.75) .append("title") .text(function(d) {
//Simple tooltip
return d.place + ": Pop. " + formatAsThousands(d.population); }); */
