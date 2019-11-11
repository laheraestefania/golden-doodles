/*
 * Choropleth - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

Choropleth = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    // console.log(this.data);

    this.initVis();
};

/*
 * Initialize area chart with brushing component
 */

Choropleth.prototype.initVis = function() {
    var vis = this; // read about the this

    vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Projection-settings for mercator
    vis.projection = d3.geoMercator()
        .center([90, 50])                 // Where to center the map in degrees
        .scale(110)                       // Zoom-level
        .rotate([0, 0]);                   // Map-rotation


// Projection-settings for orthographic (alternative)

    // var projection = d3.geoOrthographic()
    //     .scale(280)
    //     .translate([width / 2, height / 2])
    //     .clipAngle(90)
    //     .rotate([-25.0, -38.0, -0.2])
    //     .precision(.1);


    // D3 geo path generator (maps geodata to SVG paths)
    vis.path = d3.geoPath()
        .projection(vis.projection);

    // var color = d3.scaleSequential(d3.interpolateBlues)
    //     .domain([0,
    //         d3.max(vis.data, function (d) {return d["Sugar-sweetened beverages_2016"]})]);


// Use queue.js to read the datasets
    queue()
        .defer(d3.json, "data/world-110m.json")
        .await(function (error, topology) {
            if (!error) {
                vis.world = topojson.feature(topology, topology.objects.countries).features;
                vis.updateVis();
            }
        });
};

Choropleth.prototype.updateVis = function () {
    var vis = this;
    // Render the world atlas by using the path generator
    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d", vis.path);
};

