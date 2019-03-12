

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1100)
    .center([-102.34034978813841, 24.012062015793]);

var svg2 = d3.select('#caravan_graph')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

var g1 = svg2.append('g');

d3.json("build/mx_tj.json", function(error, mx) {
        g1.selectAll("path")
          .data(topojson.object(mx, mx.objects.states).geometries)
          .enter().append("path")
          .attr("d", d3.geoPath().projection(projection))
          .attr("fill", "transparent")
          .style("stroke", "#333")
          .style("stroke-width", ".2px")
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
        .curve(d3.curveCardinal.tension(1));

svg2.append("path")
          .data([newsData])
          .attr("class", "line")
          .style("stroke", '#c51b8a')
          .style("fill", "none")
          .style("stroke-width", "3px")
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
       			.duration(15000)
       			.attrTween("stroke-dasharray", tweenDash);
             })
       		};

    });
