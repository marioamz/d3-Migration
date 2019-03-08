// this is to build the Mexico map

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1100)
    .center([-102.34034978813841, 24.012062015793]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//var g = svg.append("g");

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

// WORKS, ITERATING THROUGH COLUMNS
var columns = [['mex_port_long', 'mex_port_lat'],
['city_long', 'city_lat']]

d3.csv('d3data/gooeydata.csv', function(error, usa) {
  let state = 0;
  const newData = usa.map(row => {
    return {
      ...row,
      locations: columns.map(column => {
        return [Number(row[column[0]]), Number(row[column[1]])];
      })
    };
  });

  console.log(newData)

  svg.selectAll('circle')
    .data(newData)
    .enter()
    .append('circle')
    .attr('class', 'mexport')
    .attr('cx', function(d) {
      return projection([d.locations[state][0], d.locations[state][1]])[0];
      // return projection([d[columns[i][0]], d[columns[i][1]]])[0];
    })
    .attr('cy', function(d) {
      return projection([d.locations[state][0], d.locations[state][1]])[1];
    })
    .attr('r', 2);

  d3.select("#option").select("input")
    .on('click', d => {
      state += 1;
      console.log(state);

      svg.selectAll('.mexport')
        .transition().duration(1000)
        .attr('cx', function(d) {
          return projection([d.locations[state][0], d.locations[state][1]])[0];
        // return projection([d[columns[i][0]], d[columns[i][1]]])[0];
        })
        .attr('cy', function(d) {
          return projection([d.locations[state][0], d.locations[state][1]])[1];
        });

    })
    .text('asddsadsa')
  // for(var i=0; i < columns.length; i++) {
  // }
});
