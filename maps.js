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
  var height = 520;
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

  //ADDS SCALES AS GLOBALS Here

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

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

      // perform some preprocessing of my data
      var bubdata = getBubblesData(bubblesdata);
      var mymap = getMapData(mapdata, chorodata);
      var caradata = getCaravanData(caravandata);

      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data(mymap.features);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width); //+ margin.left + margin.right);
      svg.attr('height', height); //+ margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .style('transform', 'translate(-190px)');

      setupVis(bubdata, mymap, caradata);

      setupSections();
    });
  };


  /** Drawing tooltip functions!
  */

  function drawTooltip(d){
    var xPosition = d3.event.pageX;
    var yPosition = d3.event.pageY;

    d3.select("#tooltip")
      .classed("hidden",false)
      .style("left", xPosition + "px")
      .style("top", yPosition + "px")
      .text(d.properties.name + ': ' + (d.properties.value*100) + '%');
  };

  function mouseout() {
  d3.select("#tooltip").classed("hidden", true);
  d3.select(this).classed("highlight",false)
  };


  /** DRAWING LINES FUNCTIONS
  * tweenDash and transition both draw the lines for the caravan map
  */

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


  /** DATA FUNCTIONS: preprocessing of my data
   * getBubblesData - creates an array within each object that has lat and long
   * getCaravanData - creates an array within each object that has lat and long
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
            console.log(dataState, jsonState, dataValue);
            break;
          }
        }
      }
      return mapdata;
    };

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
   */
  var setupVis = function (bubdata, mymap, caradata) {

    // first transparent map
    var map1 = g.append("g")
      .selectAll(".map1")
      .data(mymap.features);
    map1
      .attr("class", ".map1")
      .enter().append("path")
      .attr("d", path)
      .merge(map1)
      .attr("fill", "transparent")
      .style("stroke", "#333")
      .style("stroke-width", ".5px");
    map1.select('.map1').style('opacity', 0);

    // second caravan map
    var map2 = g.append("g")
      .selectAll(".map2")
      .data(mymap.features);
    map2
      .attr("class", ".map2")
      .enter().append("path")
      .attr("d", path)
      .merge(map2)
      .attr("fill", "transparent")
      .style("stroke", "#333")
      .style("stroke-width", ".5px");
    map2.select('.map2').style('opacity', 0);

    var line = d3.line()
    .x(function(d) { return projection([d.locations[0][0], d.locations[0][1]])[0]; })
    .y(function(d) { return projection([d.locations[0][0], d.locations[0][1]])[1]; })
    .curve(d3.curveCardinal.tension(0));

    g.append("path")
      .data([caradata])
      .attr("class", "line")
      .style("stroke", '#df65b0')
      .style("fill", "none")
      .style("stroke-width", "1.5px")
      .attr("d", line)
      .attr('opacity', 0);

    transition(d3.selectAll('path'));


    // create bubbles graph
    var map3 = g.append('g')
      .selectAll(".map3")
      .data(mymap.features);
    map3
      .attr('class', '.map3')
      .enter().append("path")
      .merge(map3)
      .attr("d", path)
      .attr("fill", "transparent")
      .style("stroke", "#333")
      .style("stroke-width", ".5px")
      .attr("opacity", 0);

    var state = 0

    var max = d3.max(bubdata, function(d) { return d.locations[state][2]; } );
    var scale = d3.scaleLinear()
      .domain([0, max])
      .range([5, 20]);

    g.selectAll('circle')
      .data(bubdata)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', function(d) {
        return projection([d.locations[state][0], d.locations[state][1]])[0];
      })
      .attr('cy', function(d) {
        return projection([d.locations[state][0], d.locations[state][1]])[1];
      })
      .attr('r', 2)
      .attr('fill', '#c51b8a')
      .attr('opacity', 0);

    d3.select("#option").select("input")
      .on('click', d => {
        state += 1;
        g.selectAll('.circle')
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
          //.style('opacity', 0)
          .style('fill-opacity', 0.5)
          .style('fill', '#fde0dd')
          .style('stroke', '#c51b8a')
      });

    // create choropleth
    var colorScheme = d3.schemePurples[4];
            colorScheme.unshift("#eee");
    var colorScale = d3.scaleThreshold()
                .domain([0, 0.12, 0.24, 0.36, 0.48, 0.6])
                .range(colorScheme);
            // Legend
    var g2 = g.append("g")
            .attr("class", "legendThreshold")
            .attr("transform", "translate(20,20)");
        g2.append("text")
            .attr("class", "caption")
            .attr("x", 0)
            .attr("y", -6)
            .text("% of Migrants who Self-Reported Experiencing Danger in Each State")
            .attr('opacity', 0);

    var labels = ['0-12%', '12-24%', '24-36%', '36-48%', '48-60%'];
    var legend = d3.legendColor()
            .labels(function (d) { return labels[d.i]; })
            .shapePadding(4)
            .scale(colorScale)
          g.select(".legendThreshold")
            .call(legend)
            .attr('opacity', 0);

    var map4 = g.append('g')
      .selectAll(".map4")
      .data(mymap.features);
    map4
      .attr('class', '.map4')
      .enter().append("path")
      .attr("d", path)
      .merge(map4)
      .classed("area", true)
      .on('mouseover', function(d) {
        d3.select(this).classed("highlight",true);
          drawTooltip(d);})
      .on('mouseout',mouseout)
      .attr("fill", function(d) {
        return colorScale(d.properties.value);
        })
      .style("stroke", "#333")
      .style("stroke-width", ".5px")
      .attr('opacity', 0);

    // final map
    g.append('g')
      .selectAll("path")
      .data(mymap.features)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", "transparent")
      .style("stroke", "#333")
      .style("stroke-width", ".5px")
      .style('opacity', 0);

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
    activateFunctions[0] = showMap;
    activateFunctions[1] = showCaravan;
    activateFunctions[2] = showBubbles;
    activateFunctions[3] = showChoropleth;
    activateFunctions[4] = showMapFinal;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 5; i++) {
      updateFunctions[i] = function () {};
    }
//    updateFunctions[7] = updateCough;
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

  /**
   * showMap: shows first, empty map of Mexico
   *
   */
  function showMap() {
    g.selectAll('.map1')
      .transition()
      .attr('opacity', 1.0);
  };

  /**
   * showCaravan - shows caravan
   *
   * hides: initial map
   * shows: caravan map
   * shows: line
   *
   */
  function showCaravan() {

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.map2')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.line')
      .transition()
      .attr('opacity', 1.0);
  };

  /**
   * showGrid - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  function showBubbles() {
    g.selectAll('.map1')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.map2')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.line')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.map3')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.circle')
      .transition()
      .attr('opacity', 1.0);
    };

  /**
   * highlightGrid - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted
   *  filler words. also ensures squares
   *  are moved back to their place in the grid
   */
  function showChoropleth() {

    g.selectAll('.map3')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.legendThreshold')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.text')
      .transition()
      .attr('opacity', 1.0);

    g.selectAll('.map4')
      .transition()
      .attr('opacity', 1.0);
  }

  /**
   * showBar - barchart
   *
   * hides: square grid
   * hides: histogram
   * shows: barchart
   *
   */
  function showMapFinal() {
    // ensure bar axis is set
    console.log('final map');
  }


  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * updateCough - increase/decrease
   * cough text and color
   *
   * @param progress - 0.0 - 1.0 -
   *  how far user has scrolled in section
   */
  function updateCough(progress) {
    g.selectAll('.cough')
      .transition()
      .duration(0)
      .attr('opacity', progress);

    g.selectAll('.hist')
      .transition('cough')
      .duration(0)
      .style('fill', function (d) {
        return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
      });
  }

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

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
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

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
};

var url = 'https://gist.githubusercontent.com/ponentesincausa/46d1d9a94ca04a56f93d/raw/a05f4e2b42cf981e31ef9f6f9ee151a060a38c25/mexico.json';
// load data and display
d3.queue()
    .defer(d3.csv, "d3data/gooeydata.csv")
    .defer(d3.csv, "d3data/violence.csv")
    .defer(d3.csv, "d3data/Migrant_Caravan.csv")
    .defer(d3.json, url)
    .awaitAll(function (err, results) {
      display(results)
    });
