

// I need to read in survey data with latin encodings and topojson data

Promise.all([
  d3.csv('data/encodedmex.csv'),
  d3.csv('data/encodeusa.csv'),
  d3.json('build/mx_tj.json')
]).then(data => myVis(data));

function myVis(data) {
  const [depmex, depusa, muni] = data;
  console.log(muni);

  const width = 960;
  const height = 600;
  const margin = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10};

  const svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


  const projection = d3.geoMercator();

  const geoGenerator = d3.geoPath(projection);

  const states = topojson.feature(muni, muni.objects.states),
      municipalities = topojson.feature(muni, muni.objects.municipalities);

  projection.fitSize([960, 600], states);

  svg.selectAll('.state')
    .data(municipalities)
    .enter()
    .append('path')
      .attr('class', 'state')
      .attr('stroke', 'black')
      .attr('d', d => geoGenerator(d));

};



/*

g.selectAll('path')
  .data(states)
  .enter()
  .append('path')
    .attr('class', 'state')
    .attr('stroke', 'black')
    .attr('d', geoGenerator);


// finally we construct our rendered states
  svg.selectAll('.state')
    .data(stateShapes.features)
    .enter()
    .append('path')
      .attr('class', 'state')
      .attr('stroke', 'black')
      .attr('fill', d => colorScale(stateNameToPop[d.properties.State]))
      .attr('d', d => geoGenerator(d));




var x = d3.scaleLinear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([0, height])
    .range([height, 0]);

var width = 960,
    height = 500;

var projection = d3.geoMercator()
    .scale(1200)
    .center([-102.34034978813841, 24.012062015793]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

d3.json("build/mx_tj.json", function(error, mx) {
  svg.selectAll("path")
    .data(topojson.object(mx, mx.objects.municipalities).geometries)
    .enter().append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", "transparent")
    .style("stroke", "#333")
    .style("stroke-width", ".2px")
    .attr("class", "muns");

  g.selectAll("path")
    .data(topojson.object(mx, mx.objects.states).geometries)
    .enter().append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", "transparent")
    .style("stroke", "#333");
});
*/
