
/*
 * CountVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

Histogram = function(_parentElement, _data, _eventHandler ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.MyEventHandler = _eventHandler;

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

Histogram.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 50, right: 0, bottom: 50, left: 140 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
    // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Initialize brushing component
    // *** TO-DO ***
    vis.currentBrushRegion = null;

    vis.brush = d3.brushX()
        .extent([[0,0],[vis.width, vis.height]])
        .on("brush", function(){
            // User just selected a specific region
            vis.currentBrushRegion = d3.event.selection;
            vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);

            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.MyEventHandler).trigger("selectionChanged", vis.currentBrushRegion);
        });

    // Append brush component here
    // *** TO-DO ***
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush")
        .call(vis.brush);

    d3.select("#ranking-type").on("change", vis.updateVis());

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/** Data wrangling */

Histogram.prototype.wrangleData = function(){
    var vis = this;

    // Update the visualization
    vis.updateVis();
};


Histogram.prototype.updateVis = function(){
    var vis = this;

    vis.selectedValue = (d3.select("#selected-feature").property("value"));
    console.log(vis.selectedValue);

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, 700])
        .domain([0, 350]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, 45]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Axis title
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Sugar Intake Via Sweetened Beverages");

    // Axis title
    vis.svg.append("text")
        .attr("x", 300)
        .attr("y", 235)
        .text("Grams of Sugar");

    vis.svg.append("text")
        .text("Number of Countries")
        .attr("transform", "rotate(270)")
        .attr("x", -200)
        .attr("y", -50);

    //Code from: https://www.d3-graph-gallery.com/graph/pie_basic.html

    // // set the color scale
    // var color = d3.scaleOrdinal()
    //     .domain(vis.data)
    //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

    //I got help with d3.histogram on this website :  https://www.d3-graph-gallery.com/graph/histogram_basic.html

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d.Sugar_sweetened_beverages_2016; })   // I need to give the vector of value
        .domain(vis.x.domain())  // then the domain of the graphic
        .thresholds(vis.x.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(vis.data, function(d) {
        return d.Sugar_sweetened_beverages_2016;
    });

    // append the bar rectangles to the svg element
    vis.svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")"; })
        .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0) -1 ; })
        .attr("height", function(d) {
            // console.log(d.length);
            return vis.height - vis.y(d.length);
        })
        .style("fill", "#de2d26");

    // Call brush component here
    vis.brushGroup.call(vis.brush, vis.currentBrushRegion);


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};
