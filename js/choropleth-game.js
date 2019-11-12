/*
 * ChoroplethGame - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

ChoroplethGame = function(_parentElement, _data, topology, feature){
    this.parentElement = _parentElement;
    this.data = _data;
    console.log(this.data);
    this.displayData = []; // see data wrangling
    this.world = topojson.feature(topology, topology.objects.countries).features;
    this.feature = feature;
    this.initVis();
    this.mostCount = 0;
    this.leastCount = 0;
    this.state = "";
    // vis.most =
};

/*
 * Initialize area chart with brushing component
 */

ChoroplethGame.prototype.initVis = function() {
    var vis = this; // read about the this

    vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

    vis.width = 900 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Projection-settings for mercator
    vis.projection = d3.geoMercator()
        .center([50, 50])                 // Where to center the map in degrees
        .scale(110)                       // Zoom-level
        .rotate([0, 0]);                   // Map-rotation

    // D3 geo path generator (maps geodata to SVG paths)
    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.color = d3.scaleSequential(d3.interpolateBlues);

    vis.svg.append("text")
        .attr("class", "title-text")
        .attr("transform", "translate(" + (vis.width / 4) + ", 15)")
        .attr("fill", "#000000")
        .text("Can you guess the countries that consume the most and least?");

    // Render the world atlas by using the path generator
    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("class", "country-path")
        .attr("d", vis.path)
        .attr("fill", "#999999")
        .attr("stroke", "#ffffff")
        .on("mouseover", function(d) {
            d3.selectAll(".country-path").attr("opacity", "0.25");
            d3.select(this).attr("opacity", "1.0");
        })
        .on("mouseout", function(d) {
            d3.selectAll(".country-path").attr("opacity", "1.0");
        });

    vis.wrangleData();
};

ChoroplethGame.prototype.wrangleData = function () {
    let vis = this;
    this.displayData = {};
    for (let id in vis.data) {
        if (!isNaN(vis.data[id][vis.feature])) {
            this.displayData[id] = vis.data[id][vis.feature];
        }
    }

    if (!isNaN(vis.data[208][vis.feature])) {
        // Color Greenland as Denmark
        console.log("coloring Greenland");
        this.displayData[304] = vis.data[208][vis.feature];
    }

    console.log(vis.displayData);
    vis.updateVis();
};


ChoroplethGame.prototype.updateVis = function () {
    let vis = this;
};