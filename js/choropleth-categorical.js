/*
 * Choropleth - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

ChoroplethCategorical = function(_parentElement, _data, topology, feature){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = []; // see data wrangling
    this.world = topojson.feature(topology, topology.objects.countries).features;
    this.feature = feature;
    this.initVis();
};

/*
 * Initialize area chart with brushing component
 */

var catColorScale = {"country_class": ["#999999", "#a3cd61", "#f5bdbc", "#ed5f59", "#971c13"]};
var catColorDomain = {"country_class":[
        "No data",
        "None",
        "experiencing one form of malnutrition",
        "experiencing two forms of malnutrition",
        "experiencing three forms of malnutrition"]}

ChoroplethCategorical.prototype.initVis = function() {
    var vis = this; // read about the this

    vis.margin = {top: 0, right: 120, bottom: 30, left: 60};

    vis.width = 1000 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.parentElt = d3.select("#" + vis.parentElement);
    vis.svg = vis.parentElt.append("svg")
        .attr("class", "choro-cat-svg")
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

    vis.parentElt.select(".choro-cat-svg").call(vis.zoom);

    vis.color = d3.scaleOrdinal()
        .range(["#999999", "#a3cd61", "#f5bdbc", "#ed5f59", "#971c13"])
        .domain([
            "No data",
            "None",
            "experiencing one form of malnutrition",
            "experiencing two forms of malnutrition",
            "experiencing three forms of malnutrition"]);
        // .domain(catColorDomain[vis.feature])
        // .range(catColorScale[vis.feature]);

    vis.legendGroup = vis.parentElt.select(".choro-cat-svg").append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(" + (vis.width - 20) + ", 30)");

    vis.legendSequential = d3.legendColor()
        .shapeWidth(5)
        .shapeHeight(15)
        .orient("vertical")
        .scale(vis.color);

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-2, 0])
        .html(function(d) {
            let id = d["id"];
            if (vis.data[id]) {
                let s = vis.data[id]["country"] + "<br>Malnutrition status:";
                if (vis.displayData[id]) {
                    s+= vis.displayData[id];
                }
                if (vis.data[id]["burden_text"]) {
                    s += "<br>" + vis.data[id]["burden_text"];
                }
                return s;
            } else {
                return "No Data";
            }
        });

    vis.svg.call(vis.tool_tip);

    vis.parentElt.select(".choro-cat-svg").append("text")
        .attr("class", "title-text")
        .attr("transform", "translate(" + (vis.width / 3) + ", 15)")
        .attr("fill", "#000000")
        .attr("font-size", 20)
        .text("An Overview of Malnutrition");

    vis.wrangleData();
};

ChoroplethCategorical.prototype.wrangleData = function () {
    let vis = this;
    this.displayData = {};
    for (let id in vis.data) {
       // if (!isNaN(vis.data[id][vis.feature])) {
       //     this.displayData[id] = vis.data[id][vis.feature];
       // }
        this.displayData[id] = vis.data[id][vis.feature];
        if (this.displayData[id] === "") {
            this.displayData[id] = "None";
        }
    }

    // if (!isNaN(vis.data[208][vis.feature])) {
    //     // Color Greenland as Denmark
    //     this.displayData[304] = vis.data[208][vis.feature];
    // }
    // console.log(dataByCountry);
    // console.log(vis.displayData);
    vis.updateVis();
};

ChoroplethCategorical.prototype.updateVis = function () {
    let vis = this;

    // Render the world atlas by using the path generator
    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("class", "country-path")
        .attr("d", vis.path)
        .attr("fill", function (d) {
            let id = d["id"];
            if (vis.displayData[id]) {
                return vis.color(vis.displayData[id]);
            } else {
                return noDataColor;
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
    vis.legendGroup.call(vis.legendSequential);
};