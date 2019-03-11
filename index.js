

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1100)
    .center([-102.34034978813841, 24.012062015793]);

var svg2 = d3.select('#caravan_graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

d3.json("build/mx_tj.json", function(error, mx) {
    svg2.selectAll("path")
      .data(topojson.object(mx, mx.objects.states).geometries)
      .enter().append("path")
      .attr("d", d3.geoPath().projection(projection))
      .attr("fill", "transparent")
      .style("stroke", "#333")
      .style("stroke-width", ".2px")
      .attr("class", "muns");
    });

d3.csv('d3data/Migrant_Caravan.csv', function(error, caravan) {
    svg2.selectAll('circle')
      .data(caravan)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return projection([d.city_long, d.city_lat])[0];
      })
      .attr('cy', function(d) {
        return projection([d.city_long, d.city_lat])[1];
      })
      .attr('r', 2)
      .style('fill', '#fde0dd')
      .style('stroke', '#c51b8a');
    });
