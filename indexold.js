// this is to build the Mexico map

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1100)
    .center([-102.34034978813841, 24.012062015793]);

var svg = d3.select("#cities_graph").append("svg")
    .attr("width", width)
    .attr("height", height);

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
        .style('fill', '#fde0dd')
        .style('stroke', '#c51b8a')
    })
});

//now I'm building the caravan path as a comparison case

/*
function drawLine(path, duration=2000) {
  var totalLength = path.node().getTotalLength();
  path
    .style('opacity',1)
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
      .ease(d3.easeCubic)
      .duration(duration)
      .attr("stroke-dashoffset", 0);
};
*/

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


// THIS CREATES THE CHLOROPETH OF VIOLENCE

var svg3 = d3.select('#chloropeth')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

var color = d3.scaleQuantize()
  .domain([0, 0.6])
  .range(['#f1eef6', '#d7b5d8', '#df65b0', '#dd1c77', '#980043']);


d3.csv("d3data/violence.csv", function(data) {
  d3.json("build/mx_tj.json", function(json) {
    for (var i = 0; i < data.length; i++) {
      var dataState = data[i].State;
      var dataValue = parseFloat(data[i].Percentage);
      console.log(dataValue);
      for (var j = 0; j < json.objects.states.geometries.length; j++) {
        var jsonState = json.objects.states.geometries[j].properties.NOM_ENT;
        if (dataState == jsonState) {
          json.objects.states.geometries[j].properties.value = dataValue;
          break;
        }
      }
    }

      svg3.selectAll("path")
      .data(topojson.object(json, json.objects.states).geometries)
      .enter().append("path")
      .attr("d", d3.geoPath().projection(projection))
      .style('fill', function(d) {
        var value = d.properties.value;
        console.log('value');
        if (value) {
          return color(value);
        } else {
          return '#ccc';
        }
      });
    });
});
