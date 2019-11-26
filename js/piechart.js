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

    vis.margin = { top: 20, right: 0, bottom: 200, left: 20 };

    vis.width = 200 - vis.margin.left - vis.margin.right,
        // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 200 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    //Code help from: https://www.d3-graph-gallery.com/graph/pie_basic.html and our D3 book

    // console.log(vis.data);

    // console.log(organizedData);


    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/** Data wrangling */

PieChart.prototype.wrangleData = function(){
    var vis = this;

    vis.organizedData = [0, 0];

    vis.data.forEach(function(d) {
        // console.log(d);
        if (d.plan == "Yes") {
            vis.organizedData[0] ++;
        } else if (d.plan == "No") {
            vis.organizedData[1] ++;
        }
    });

    vis.displayData = vis.organizedData;

    // console.log(vis.organizedData);

    // Update the visualization
    vis.updateVis();
};


PieChart.prototype.updateVis = function(){
    var vis = this;

    // console.log(vis.organizedData);

    // set the color scale
    vis.color = d3.scaleOrdinal()
        .domain(vis.organizedData)
        .range(["#fee0d2", "#fc9272"]);

    // Compute the position of each group on the pie:
    vis.pie = d3.pie();

    vis.w = 200;
    vis.h = 200;
    vis.outerRadius = vis.w / 3;
    vis.innerRadius = 0;
    vis.arc = d3.arc()
        .innerRadius(vis.innerRadius)
        .outerRadius(vis.outerRadius);

    console.log(vis.pie(vis.organizedData));

    console.log(vis.svg.selectAll("g.arc"));

    //Set up groups
    vis.arcs = vis.svg.selectAll("g.arc")
        .data(vis.pie(vis.organizedData))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + vis.outerRadius + ", " + vis.outerRadius + ")");

    //Draw arc paths
    vis.arcs.append("path")
        .merge(vis.arcs)
        .transition()
        .duration(800)
        .attr("fill", function(d, i) {
            return vis.color(i);
        })
        .attr("d", vis.arc);


    vis.arcs.append("text")
        .attr("transform", function(d) {
            return "translate(" + vis.arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d, i) {
            if (i == 0) {
                return "Yes";
            } else if (i == 1) {
                return "No";
            }
        });
};

PieChart.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    var vis = this;

    vis.filteredData = vis.data.filter(function(d){
        return (d.Sugar_sweetened_beverages_2016 >= selectionStart && d.Sugar_sweetened_beverages_2016 <= selectionEnd);
    });

    // console.log(vis.filteredData);

    vis.wrangleData();
};


