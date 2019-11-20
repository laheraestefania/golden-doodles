/*
 * Choropleth - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

Choropleth = function(_parentElement, _data, topology, feature){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling
    this.world = topojson.feature(topology, topology.objects.countries).features;
    this.feature = feature;
    this.initVis();

    console.log(_data);
};

/*
 * Initialize area chart with brushing component
 */

Choropleth.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

    vis.width = 900 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("class", "choro-svg")
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

    vis.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [vis.width, vis.height]])
        .on('zoom', function () {
            vis.svg.attr('transform', d3.event.transform);
        });

    d3.select(".choro-svg").call(vis.zoom);

    vis.color = d3.scaleSequential(d3.interpolateBlues);

    vis.legendGroup = d3.select(".choro-svg").append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(" + (vis.width) + ", 30)");

    vis.legendSequential = d3.legendColor()
        .shapeWidth(5)
        .shapeHeight(15)
        .cells(10)
        .ascending(true)
        .orient("vertical");

    vis.legendGroup.append("rect")
        .attr("x", 0)
        .attr("y", 180)
        .attr("height",15)
        .attr("width", 5)
        .attr("fill", noDataColor);

    vis.legendGroup.append("text")
        .attr("x", 10)
        .attr("y", 190)
        .attr("class", "label")
        .text("No Data");

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-2, 0])
        .html(function(d) {
            let id = d["id"];
            if (vis.data[id]) {
                let s = vis.data[id]["country"] + "<br>"+ vis.feature + " : ";
                if (vis.displayData[id]) {
                    s+= vis.displayData[id];
                }
                return s;
            } else {
                return "No Data";
            }
        });

    vis.svg.call(vis.tool_tip);

    d3.select(".choro-svg").append("text")
        .attr("class", "title-text")
        .attr("transform", "translate(" + (vis.width / 4) + ", 15)")
        .attr("fill", "#000000")
        .text(metadata[vis.feature]);

    vis.wrangleData();
};

Choropleth.prototype.wrangleData = function () {
    let vis = this;
    this.displayData = {};
    for (let id in vis.data) {
       if (!isNaN(vis.data[id][vis.feature])) {
           this.displayData[id] = vis.data[id][vis.feature];
       }
    }
    vis.updateVis();
};

Choropleth.prototype.updateVis = function () {
    let vis = this;
    vis.color.domain([
        0,
        d3.max(Object.values(vis.displayData))
    ]);
    // Render the world atlas by using the path generator
    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("class", "country-path")
        .attr("d", vis.path)
        .attr("fill", function (d) {
            let id = d["id"];
            if (isNaN(vis.displayData[id])){
                return noDataColor;
            } else {
                return vis.color(vis.displayData[id]);
            }
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.25)
        .on("mouseover", function(d) {
            d3.selectAll(".country-path").attr("opacity", "0.75");
            d3.select(this).attr("opacity", "1");
            vis.tool_tip.show(d);
        })
        .on("mouseout", function(d) {
            d3.selectAll(".country-path").attr("opacity", "1.0");
            vis.tool_tip.hide(d);
        });

    vis.legendSequential.scale(vis.color);
    vis.legendGroup.call(vis.legendSequential);
};