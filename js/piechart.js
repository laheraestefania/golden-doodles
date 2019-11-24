PieChart = function(_parentElement, _data, _eventHandler ){
    this.parentElement = _parentElement;
    this.data = _data;
    // this.MyEventHandler = _eventHandler;

    this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

PieChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 0, bottom: 200, left: 140 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 700 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    //Code from: https://www.d3-graph-gallery.com/graph/pie_basic.html

    // set the color scale
    var color = d3.scaleOrdinal()
        .domain(vis.data)
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .value(function(d) {
            console.log(d.value.sugar_tax);
            return d.value.sugar_tax;
        });
    var data_ready = pie(d3.entries(vis.data, function(d) {
        console.log(d.value.sugar_tax);
        return d.value.sugar_tax
    }));

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    vis.svg.selectAll("pic-chart")
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(7)
        )
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/** Data wrangling */

PieChart.prototype.wrangleData = function(){
    var vis = this;

    // Update the visualization
    vis.updateVis();
};


PieChart.prototype.updateVis = function(){
    var vis = this;


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};

PieChart.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    var vis = this;


    vis.wrangleData();
};


