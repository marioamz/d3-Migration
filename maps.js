/* inspired by: https://vallandingham.me/scroller.html */

/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function () {

  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 500;
  var margin = { top: 0, left: 20, bottom: 40, right: 10 };

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // projections and path
  var projection = d3.geoMercator()
      .scale(1100)
      .center([-102.34034978813841, 24.012062015793]);

  var path = d3.geoPath().projection(projection);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // color scheme for the choropleth
  var colorScheme = d3.schemePurples[5];
          colorScheme.unshift("#eee");

  var colorScale = d3.scaleThreshold()
              .domain([0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60])
              .range(colorScheme);

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (data) {

      // separate out my data
      var bubblesdata = data[0];
      var chorodata = data[1];
      var caravandata = data[2];
      var mapdata = data[3];
      var caracities = data[4]

      // perform some preprocessing of my data
      var bubdata = getBubblesData(bubblesdata);
      var mymap = getMapData(mapdata, chorodata);
      var caradata = getCaravanData(caravandata);
      var carcities = getCaravanData(caracities)

      // create svg and give it a width and height
      svg = d3.select(this).append('svg');
      // @v4 use merge to combine enter and existing selection

      svg.attr('width', width); //+ margin.left + margin.right);
      svg.attr('height', height); //+ margin.top + margin.bottom);

      svg.append('g');

      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .style('transform', 'translate(-190px)');

      setupVis(bubdata, mymap, caradata, carcities);

      setupSections();
    });
  };


  /** Drawing tooltip functions!*/

  // Deletes tooltip from graphs that aren't bubble graphs
  function drawBubbletip2(d) {
    var xBubble = d3.event.clientX;
    var yBubble = d3.event.clientY;

    d3.select('#tooltip')
      .classed('hidden', true);
  };

  // Draws tooltip for bubble graphs
  function drawBubbletip(d) {
    var xBubble = d3.event.clientX;
    var yBubble = d3.event.clientY;

    d3.select('#tooltip')
      .classed('hidden', false)
      .style('left', (xBubble-350) + 'px')
      .style('top', (yBubble) + 'px')
      .text(d.locations[1][2] + ' migrants named ' + d.index + ' as part of their route');
  };

  // removes tooltip from graphs that aren't choropleth
  function drawTooltip2(d){
    var xPosition = d3.event.clientX;
    var yPosition = d3.event.clientY;

    d3.select("#tooltip")
      .classed("hidden",true);
  };

  // creates tooltip for choropleth
  // inspired by: http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
  function drawTooltip(d){
    var xPosition = d3.event.clientX;
    var yPosition = d3.event.clientY;
    var f = d3.format(".1f");

    d3.select("#tooltip")
      .classed("hidden",false)
      .style("left", (xPosition-350)+"px")
      .style("top", (yPosition)+"px")
      .text(d.properties.name + ': ' + (f(d.properties.value*100)) + '%');
  };

  // mouses out of tooltip, same inspiration as above.
  function mouseout() {
  d3.select("#tooltip").classed("hidden", true);
  d3.select(this).classed("highlight",false)
  };


  /** DRAWING LINES FUNCTIONS
  * tweenDash and transition both draw the lines for the caravan map*/
  // inspired by https://bl.ocks.org/mbostock/5649592
  function tweenDash() {
      var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
      return function (t) { return i(t); };
    };

  function transitionfxn(selection) {
    selection.each(function(){
      d3.select(this).transition()
      .duration(6000)
      .attrTween("stroke-dasharray", tweenDash);
       })
    };

  /** DATA FUNCTIONS: preprocessing of my data
   * getMapData - adds value of danger from choropleth data to the geojson map,
   this creates the data we can use to create an initial map, which we can then
   update with all the other data, and then tap into choro to make the choropleth.
   */
  function getMapData (mapdata, chorodata) {
    for (var i = 0; i < chorodata.length; i++) {
      var dataState = chorodata[i].State;
      var dataValue = parseFloat(chorodata[i].Percentage);
      for (var j = 0; j < mapdata.features.length; j++) {
        var jsonState = mapdata.features[j].properties.name;
          if (dataState == jsonState) {
            mapdata.features[j].properties.value = dataValue;
            break;
          }
        }
      }
      return mapdata;
    };

  //getBubblesData - creates an array within each object that has lat and long
  function getBubblesData (bubblesdata) {
    var columns = [['mex_port_long', 'mex_port_lat', 'sum'],
    ['city_long', 'city_lat', 'sum']];

    var newData = bubblesdata.map(row => {
      return {
        ...row,
        locations: columns.map(column => {
          return [Number(row[column[0]]), Number(row[column[1]]), Number(row[column[2]])];
        })
      };
    });
    return newData;
   };

   //getCaravanData - creates an array within each object that has lat and long
   function getCaravanData (caravandata) {
     var cols = [['city_long', 'city_lat']];

     var newsData = caravandata.map(row => {
       return {
         ...row,
       locations: cols.map(col => {
         return [Number(row[col[0]]), Number(row[col[1]])];
           })
         };
       });
      return newsData;
   };

  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param bubdata - stops data
   * @param caradata - the caravan
     @param mapdata - the map and choro
     @param carcities - cities to show in caravan route
   */
  var setupVis = function (bubdata, mymap, caradata, carcities) {

    // show the image
    var imgs = g.append('image')
      .attr("class", "image")
      .attr("xlink:href", "d3data/photo.jpg")
      .attr('x', 200)
      .attr('y', -100)
      .attr('width', 500)
      .attr('height', 500);

    // first transparent map
    var map1 = g.append("g")
      .attr('height', 300)
      .attr('width', 300)
      .selectAll(".map1")
      .data(mymap.features);

    map1
      .enter().append("path")
      .attr("class", "map1")
      .attr("d", path)
      .attr("fill", "#cbc9e2")
      .merge(map1)
      .style("stroke", "#333")
      .style("stroke-width", ".5px");

    // caravan line
    var line = d3.line()
    .x(function(d) { return projection([d.locations[0][0], d.locations[0][1]])[0]; })
    .y(function(d) { return projection([d.locations[0][0], d.locations[0][1]])[1]; })
    .curve(d3.curveCardinal.tension(1));

    g.append("path")
      .data([caradata])
      .attr("class", "line")
      .style("stroke", '#CC00FF')
      .style("fill", "none")
      .style("stroke-width", "3.5px")
      .attr("d", line)
      .attr('opacity', 1);

  // cities to show in caravan map
  var g4 = g.append("g");
  g4.selectAll("text")
      .data(carcities)
      .enter()
      .append("text")
      .attr('class', 'city_name')
      .attr("x", function(d) {
        return projection([d.locations[0][0], d.locations[0][1]])[0];
      })
      .attr("y", function(d) {
        return projection([d.locations[0][0], d.locations[0][1]])[1];
      })
      .attr("font-size","12px")
      .attr("font-weight", 'bold')
      .text(function(d) {return d.Location; })
      .attr('fill', 'none')
      .attr('opacity', 0);

    // bubbles graph
    g.selectAll('circle')
      .data(bubdata)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', function(d) {
        return projection([d.locations[0][0], d.locations[0][1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.locations[0][0], d.locations[0][1]])[1];
      })
      .attr('r', 3)
      .attr('fill', '#54278f')
      .attr('opacity', 0);

    // create choropleth legend
    var g2 = g.append("g")
            .attr("class", "legendThreshold")
            .attr("transform", "translate(600,20)")
            .attr('opacity', 0);

        g2.append("text")
            .attr("class", "caption")
            .attr("x", 0)
            .attr("y", -6)
            .text("% Reporting Danger")

    var labels = ['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50-60%'];
    var legend = d3.legendColor()
            .labels(function (d) { return labels[d.i]; })
            .shapePadding(4)
            .scale(colorScale)
          g.select(".legendThreshold")
            .call(legend)
            .attr('opacity', 0);
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showImage;
    activateFunctions[1] = showMap;
    activateFunctions[2] = showCaravan;
    activateFunctions[3] = showBubbles;
    activateFunctions[4] = showChoropleth;
    activateFunctions[5] = showMapFinal;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  // shows the image with which the story opens
  // turns everything else to opaque
  function showImage() {

    g.selectAll('.image')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.legendThreshold')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.text')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle2')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.line')
       .attr('opacity', 0);

   g.selectAll('.city_name')
      .transition().delay(function(d,i){ return i * 0 }).duration(0)
      .attr('opacity', 0);

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });
  };

  // shows first empty map
  // everything else turns opaque
  function showMap() {

    g.selectAll('.image')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.legendThreshold')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.text')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle2')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.line')
       .attr('opacity', 0);

   g.selectAll('.city_name')
      .transition().delay(function(d,i){ return i * 0 }).duration(0)
      .attr('opacity', 0);

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 1.0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });
  };

  // shows the caravan line and caravan cities with transition and delay
  // everything else opaque
  function showCaravan() {

    g.selectAll('.image')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.legendThreshold')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.text')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.line')
      .attr('opacity', 1.0);

    transitionfxn(d3.selectAll(".line"));

    g.selectAll('.city_name')
       .transition().delay(function(d,i){ return i * 500 }).duration(1000)
       .attr('fill', '#551A8B')
       .attr('opacity', 1.0);

    g.selectAll('.circle')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle2')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle')
      .classed('area', false)
      .classed('highlight', false)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight", false);
          drawBubbletip2(d);})
      .on('mouseout',mouseout)
      .classed('hidden', true);

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 1.0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });
  };

  // shows bubbles sized by sqrt scale with transition
  // calls tooltip, everything else opaque
  function showBubbles() {

    g.selectAll('.image')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.legendThreshold')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.text')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.line')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.city_name')
       .transition().delay(function(d,i){ return i * 0 }).duration(0)
       .attr('opacity', 0);

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 1.0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });

    var projection = d3.geoMercator()
        .scale(1100)
        .center([-102.34034978813841, 24.012062015793]);

    var scale = d3.scaleSqrt()
      .domain([0, 3000])
      .range([2, 20]);

    g.selectAll('.circle')
      .transition().duration(1000)
      .attr('opacity', 1.0)
      .transition().delay(100).duration(2000)
      .attr('cx', function(d) {
        return projection([d.locations[1][0], d.locations[1][1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.locations[1][0], d.locations[1][1]])[1];
      })
      .attr('r', function(d) {
        return scale(d.locations[1][2]);
      })
      .style('fill-opacity', 0.5)
      .style('fill', '#9e9ac8')
      .style('stroke', '#54278f');

    g.selectAll('.circle2')
      .transition()
      .duration(1000)
      .attr('opacity', 1);

    g.selectAll('.circle')
      .classed('area', true)
      .classed('highlight', false)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight", false);
          drawBubbletip(d);})
      .on('mouseout',mouseout)
      .classed('hidden', false);

    g.selectAll('.map1')
      .classed('area', false)
      .classed('highlight', false)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight", false);
          drawTooltip2(d);})
      .on('mouseout',mouseout)
      .classed('hidden', true);
    };

  // shows choropleth and tooltip
  // everything else opaque
  function showChoropleth() {

    g.selectAll('.image')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle2')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.legendThreshold')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.text')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.line')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.city_name')
       .transition().delay(function(d,i){ return i * 0 }).duration(0)
       .attr('opacity', 0);

    g.selectAll('.circle')
      .classed('area', false)
      .classed('highlight', false)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight", false);
          drawBubbletip2(d);})
      .on('mouseout',mouseout)
      .classed('hidden', true);

    g.selectAll('.map1')
      .classed("area", true)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight", true);
          drawTooltip(d);})
      .on('mouseout',mouseout)
      .attr("fill", function(d) {
        return d.properties ? colorScale(d.properties.value) : 'red';
    });
};

  // shows the final map: a choropleth plus caravan line with tooltip
  // everything else opaque
  function showMapFinal() {

    g.selectAll('.image')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.legendThreshold')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.text')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.highlight')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.line')
      .attr('opacity', 1.0);

    g.selectAll('.circle2')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.city_name')
       .transition().delay(function(d,i){ return i * 0 }).duration(0)
       .attr('opacity', 0);

    transitionfxn(d3.selectAll(".line"));

    g.selectAll('.map1')
      .classed("area", true)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight", true);
          drawTooltip(d);})
      .on('mouseout',mouseout)
      .attr("fill", function(d) {
        return d.properties ? colorScale(d.properties.value) : 'red';
    });
};

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };
  // return chart function
  return chart;
};

/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });
};

var url = 'https://gist.githubusercontent.com/ponentesincausa/46d1d9a94ca04a56f93d/raw/a05f4e2b42cf981e31ef9f6f9ee151a060a38c25/mexico.json';
// load data and display
d3.queue()
    .defer(d3.csv, "d3data/gooeydata.csv")
    .defer(d3.csv, "d3data/violence.csv")
    .defer(d3.csv, "d3data/Migrant_Caravan.csv")
    .defer(d3.json, url)
    .defer(d3.csv, "d3data/caravancities.csv")
    .awaitAll(function (err, results) {
      display(results)
    });
