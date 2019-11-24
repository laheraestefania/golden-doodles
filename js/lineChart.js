
/*
 * LineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

LineChart = function(_parentElement, _data, _groupingData, gender="Female", condition="Obesity"){
    var vis = this;
    vis.timeFormat = d3.timeFormat("%Y");
    vis.parseDate = d3.timeParse("%Y");
    vis.parentElement = _parentElement;
    vis.data = {};
    _data.forEach(function (d) {
        var countryName = d["country"];
        delete d["country"];
        let l = [];
        Object.keys(d).forEach(function (key) {
            l.push({"key": key, "value": d[key]})
        });
        vis.data[countryName] = l;
    });

    vis.groupingData = {};
    Object.keys(_groupingData).forEach(function (countryName) {
        let region = _groupingData[countryName].region.replace(" ", "_");
        let subregion = _groupingData[countryName].subregion.replace(" ", "_");
        vis.groupingData[countryName] = {"region": region, "subregion": subregion}
    });

    vis.years = Object.keys(_data[0]).map(vis.parseDate);
    console.log(gender);
    console.log(condition);
    vis.title = gender + ", " + condition + " (%)";

    vis.initVis();
};

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

LineChart.prototype.initVis = function(){
    var vis = this;
    vis.margin = { top: 40, right: 20, bottom: 40, left: 30 };

    console.log($("#" + vis.parentElement).width());
    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 250 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .classed("svg-content", true);

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.years));

    // console.log(vis.x.domain());

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(d3.timeFormat("%Y"));

    // Represents percent in current applications
    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, 100]);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    // Add title
    vis.svg.append("text")
        .attr("class", "area-title")
        .attr("x", vis.width / 3)
        .attr("y", -20)
        .text(vis.title);

    vis.linePath = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(vis.parseDate(d.key)); })
        .y(function(d) { return vis.y(d.value);});

    // Create brush. -5 in order to force it above the top peak.
    // vis.brush = d3.brushX()
    //     .extent([[0, -5], [vis.width, vis.height]])
    //     .on("brush", brushed);

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .call(vis.yAxis)
        .append("text")
        .attr("x", 20)
        .attr("y", -10)
        .attr("fill", "black")
        .text("percent");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis)
        .append("text")
        .attr("x", vis.width / 2)
        .attr("y", 25)
        .attr("text-anchor", "center")
        .attr("fill", "black")
        .text("Year");

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/*
 * Data wrangling
 */

LineChart.prototype.wrangleData = function(){
    var vis = this;

    console.log(vis.groupingData);

    vis.displayData = {};
    // Object.keys(vis.data).forEach(function (country) {
    //     if (vis.groupingData[country]["subregion"] === "Southern_Asia") {
    //         vis.displayData[country] = vis.data[country];
    //     }
    // });
    vis.displayData = vis.data;
    console.log("display data");
    console.log(vis.displayData);
    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function
 */

LineChart.prototype.updateVis = function(){
    var vis = this;
    // Draw path
    Object.keys(vis.displayData).forEach(function (key) {
        vis.svg.append("path")
            .datum(vis.displayData[key])
            .attr("stroke", "rgba(152,171,190,0.45)")
            .attr("stroke-width", 2)
            .attr("fill", "rgba(255,255,255,0)")
            .attr("class", function () {
                let region = vis.groupingData[key]["region"];
                let subregion = vis.groupingData[key]["subregion"];
                return key + " " + region + " " + subregion;
            })
            .attr("d", vis.linePath);
    })


}
