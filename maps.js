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

  var colorScheme = d3.schemePurples[5];
          colorScheme.unshift("#eee");

  var colorScale = d3.scaleThreshold()
              .domain([0, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60])
              .range(colorScheme);

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
      svg = d3.select(this).append('svg');
      // @v4 use merge to combine enter and existing selection

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
    var xPosition = d3.event.clientX;
    var yPosition = d3.event.clientY;

    d3.select("#tooltip")
      .classed("hidden",false)
      .style("left", (xPosition-350)+"px")
      .style("top", (yPosition)+"px")
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

  function transitionfxn(selection) {
    selection.each(function(){
      d3.select(this).transition()
      .duration(6000)
      .attrTween("stroke-dasharray", tweenDash);
       })


    };

/*
d3.selectAll(".city_dots").data(city_data).enter()
  .append("circle").attr("class","city_dot")
  .attr("cx").attr("cy").attr("r",0)
  .transition().delay(function(d,i){ return i * 2000 }).duration(1000).attr("r",)
*/

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

    // title
    var imgs = g.append('image')
      .attr("class", "image")
      .attr("xlink:href", "d3data/photo.jpg")
      .attr('x', 200)
      .attr('y', -100)
      .attr('width', 500)
      .attr('height', 500);
      //.attr("transform", "rotate("+-90+")");

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


    var max = d3.max(bubdata, function(d) { return d.locations[1][2]; } );
    var scale = d3.scaleLinear()
      .domain([0, max])
      .range([5, 20]);

    // bubbles graph

    var state = 0

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

//  bubbles graph expansion

    // create choropleth
    // Legend
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

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 6; i++) {
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

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });
  };

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

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 1.0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });
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

  //  g.selectAll('.line')
  //    .transition()
  //    .attr('opacity', 1.0);

    g.selectAll('.circle')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.circle2')
      .transition()
      .attr('opacity', 0);

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 1.0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });
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

    g.selectAll('.map1')
      .transition()
      .attr('opacity', 1.0)
      .attr("fill", function(d) {
        return '#cbc9e2';
      });

    var projection = d3.geoMercator()
        .scale(1100)
        .center([-102.34034978813841, 24.012062015793]);

    var scale = d3.scaleLinear()
      .domain([0, 2500])
      .range([5, 20]);

    g.selectAll('.circle')
      .transition().duration(1000)
      .attr('opacity', 1.0)
      .transition().delay(500).duration(2000)
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
   * showBar - barchart
   *
   * hides: square grid
   * hides: histogram
   * shows: barchart
   *
   */
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
