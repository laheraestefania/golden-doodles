
/*
 * CountVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

Histogram = function(_parentElement, _data, _eventHandler ){
    this.parentElement = _parentElement;
    this.data = _data;
    // this.MyEventHandler = _eventHandler;

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

Histogram.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // SVG clipping path
    // ***TO-DO***


    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);


    // Set domains
    var minMaxY= [0, d3.max(vis.data.map(function(d){ return d.count; }))];
    vis.y.domain(minMaxY);

    var minMaxX = d3.extent(vis.data.map(function(d){ return d.time; }));
    vis.x.domain(minMaxX);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Axis title
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Votes");


    // var bars = vis.svg.selectAll(".bar")
    //     .data(this.displayData);
    //
    // bars.enter().append("rect")
    //     .attr("class", "bar")
    //
    //     .merge(bars)
    //     .transition()
    //     .attr("width", vis.x.bandwidth())
    //     .attr("height", function(d){
    //         return vis.height - vis.y(d);
    //     })
    //     .attr("x", function(d, index){
    //         return vis.x(index);
    //     })
    //     .attr("y", function(d){
    //         return vis.y(d);
    //     })

    // bars.exit().remove();


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

    // console.log(vis.currentBrushRegion);

    // Append brush component here
    // *** TO-DO ***
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush")
        .call(vis.brush);


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/** Data wrangling */

Histogram.prototype.wrangleData = function(){
    var vis = this;

    this.displayData = this.data;

    // Update the visualization
    vis.updateVis();
}


Histogram.prototype.updateVis = function(){
    var vis = this;

    // Call brush component here
    vis.brushGroup.call(vis.brush, vis.currentBrushRegion);

    // Call the area function and update the path
    // D3 uses each data point and passes it to the area function.
    // The area function translates the data into positions on the path in the SVG.
    // vis.timePath
    //     .datum(vis.displayData)
    //     .attr("d", vis.area)
    //     .attr("clip-path", "url(#clip)");


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};

Histogram.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    var vis = this;


    vis.wrangleData();
}
