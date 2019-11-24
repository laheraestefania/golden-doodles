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

    vis.width = 600 - vis.margin.left - vis.margin.right,
        // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    //Code help from: https://www.d3-graph-gallery.com/graph/pie_basic.html and our D3 book

    var sugarTax = [0, 0];

    vis.sugarTaxChart = vis.data.forEach(function(d) {
        if (d.sugar_tax == "Yes") {
            sugarTax[0] ++;
        } else if (d.sugar_tax == "No") {
            sugarTax[1] ++;
        }
    });

    console.log(sugarTax);

    // set the color scale
    var color = d3.scaleOrdinal()
        .domain(sugarTax)
        .range(["#98abc5", "#8a89a6"]);

    // Compute the position of each group on the pie:
    var pie = d3.pie();

    var w = 300;
    var h = 300;
    var outerRadius = w / 2;
    var innerRadius = 0;
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    //Set up groups
    var arcs = vis.svg.selectAll("g.arc")
        .data(pie(sugarTax))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");

    //Draw arc paths
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);

    arcs.append("text")
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d, i) {
            if (i == 0) {
                return "Yes";
            } else if (i == 1) {
                return "No";
            }
        });

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

    console.log(vis.data);
};

// PieChart.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
//     var vis = this;
//
//
//     vis.wrangleData();
// };


