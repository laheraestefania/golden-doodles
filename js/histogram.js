
/*
 * CountVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

Histogram = function(_parentElement, _data, _eventHandler ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.MyEventHandler = _eventHandler;
    // console.log("hist data");
    // console.log(this.data);
    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

Histogram.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 50, right: 50, bottom: 50, left: 100 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
    // vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.height = 250 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        // .attr("width", vis.width + vis.margin.left + vis.margin.right)
        // .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (vis.width + vis.margin.left + vis.margin.right) + " "
            + (vis.height + vis.margin.top + vis.margin.bottom))
        .classed("svg-content", true)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


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

    // Initialize brushing component
    vis.currentBrushRegion = null;

    vis.brush = d3.brushX()
        .extent([[0,0],[vis.width, vis.height]])
        .on("brush", function(){
            // User just selected a specific region
            console.log("brushing");
            vis.currentBrushRegion = d3.event.selection;
            vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);

            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.MyEventHandler).trigger("selectionChanged", vis.currentBrushRegion);
        });

    // Append brush component here
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush");
        // .call(vis.brush);

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width])
        // .domain([0, 350]);
        .domain([0, d3.max(vis.data, function(d) {
            return d[vis.selectedValue];
        })]);

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
    vis.title = vis.svg.selectAll(".histogram-title")
        .data([1]);

    vis.title.enter().append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("class", "histogram-title")
        .merge(vis.title)
        .transition()
        .duration(500)
        .text(function(d) {
            if (vis.selectedValue == "Sugar_sweetened_beverages_2016") {
                return "Sugar Intake Via Sweetened Beverages";
            } else if (vis.selectedValue == "Red_meat_2016") {
                return "Red Meat Consumption";
            } else if (vis.selectedValue == "Salt_2016") {
                return "Salt Consumption";
            } else if (vis.selectedValue == "Calcium_2016") {
                return "Calcium Consumption";
            } else if (vis.selectedValue == "Vegetables_2016") {
                return "Vegetable Consumption";
            } else if (vis.selectedValue == "Fruit_2016") {
                return "Fruit Consumption";
            } else if (vis.selectedValue == "Whole_grain_2016") {
                return "Whole Grain Consumption";
            }
        });

    vis.title.exit().remove();

    // Axis title
    vis.xTitle = vis.svg.selectAll(".histogramX-title")
        .data([1]);

    vis.xTitle.enter().append("text")
        .attr("x", vis.width / 2)
        .attr("y", vis.height + 40)
        .attr("font-size", "10px")
        .attr("class", "histogramX-title")
        .merge(vis.xTitle)
        .transition()
        .duration(500)
        .text(function(d) {
            if (vis.selectedValue == "Sugar_sweetened_beverages_2016") {
                return "Grams of Sugar";
            } else if (vis.selectedValue == "Red_meat_2016") {
                return "Grams of Red Meat";
            } else if (vis.selectedValue == "Salt_2016") {
                return "Grams of Salt";
            } else if (vis.selectedValue == "Calcium_2016") {
                return "Grams of Calcium";
            } else if (vis.selectedValue == "Vegetables_2016") {
                return "Grams of Vegetables";
            } else if (vis.selectedValue == "Fruit_2016") {
                return "Grams of Fruit";
            } else if (vis.selectedValue == "Whole_grain_2016") {
                return "Grams of Whole Grains";
            }
        });

    vis.xTitle.exit().remove();

    vis.svg.append("text")
        .text("Number of Countries")
        .attr("transform", "rotate(270)")
        .attr("font-size", "10px")
        .attr("x", -100)
        .attr("y", -30);

    //Code from: https://www.d3-graph-gallery.com/graph/pie_basic.html

    /// Code from the example given in the instructions: http://bl.ocks.org/davegotz/bd54b56723c154d25eedde6504d30ad7
    var tool_tip = d3.tip()
        .attr("class", "d3-tip-histogram")
        .offset([-8,0])
        .html(function(d) {
            return "Countries: " +
            d.map(function(d) {
                return " " + d.country + " ";
            });
        });
    vis.svg.call(tool_tip);

    //I got help with d3.histogram on this website :  https://www.d3-graph-gallery.com/graph/histogram_basic.html

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) {
            return d[vis.selectedValue];
        })   // I need to give the vector of value
        .domain(vis.x.domain())  // then the domain of the graphic
        .thresholds(vis.x.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(vis.data, function(d) {
        return d[vis.selectedValue];
    });

    // append the bar rectangles to the svg element
    vis.bars = vis.svg.selectAll("rect")
        .data(bins);

        vis.bars.enter()
        .append("rect")
        .attr("x", 1)
        .on('mouseover', tool_tip.show )
        .on('mouseout', tool_tip.hide)
        .merge(vis.bars)
        .transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + vis.x(d.x0) + "," + vis.y(d.length) + ")"; })
        .attr("width", function(d) { return vis.x(d.x1) - vis.x(d.x0) -1 ; })
        .attr("height", function(d) {
            // console.log(d.length);
            return vis.height - vis.y(d.length);
        })
        // .style("fill", "#de2d26")
        .style("fill", accentColor);

    vis.bars.exit().remove();

    // Call brush component here
    vis.brushGroup.call(vis.brush, vis.currentBrushRegion);


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

};
