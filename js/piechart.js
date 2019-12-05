//Code help from: https://www.d3-graph-gallery.com/graph/pie_basic.html and our D3 book


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

    // vis.width = $("#" + vis.parentElement).width();
    // vis.height = $("#" + vis.parentElement).height();
    //
    // vis.radius = Math.min(vis.width, vis.height) / 2.5;

    // adjusting this so the pie charts are all the same size because right now they are all different
    vis.width = $("#" + vis.parentElement).width();
    vis.height = vis.width / 2;

    vis.radius = vis.height / 2;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .append("g")
        .attr("transform", `translate(${vis.width / 2}, ${vis.height / 2})`);

    vis.filteredData = vis.data;

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};

/** Data wrangling */
PieChart.prototype.wrangleData = function(){
    var vis = this;

    var organizedData = [0, 0];

    // console.log(vis.filteredData);

    vis.filteredData.forEach(function(d) {
        // console.log(d);
        if (d.plan == "Yes") {
            organizedData[0] ++;
        } else if (d.plan == "No") {
            organizedData[1] ++;
        }
    });

    vis.displayData = organizedData;

    // console.log(organizedData);

    // Update the visualization
    vis.updateVis();
};


PieChart.prototype.updateVis = function(){
    var vis = this;

    // set the color scale
    vis.color = d3.scaleOrdinal()
        .domain(vis.displayData)
        .range(["#fee0d2", "#fc9272"]);

    // Compute the position of each group on the pie:
    vis.pie = d3.pie()
        .value(function(d) {
            return d
        });

    vis.arc = d3.arc()
        .innerRadius(0)
        .outerRadius(vis.radius);

    vis.pieData = vis.pie(vis.displayData);

    vis.pies = vis.svg.selectAll("path")
        .data(vis.pieData);

    vis.pies
        .enter()
        .append('path')
        .merge(vis.pies)
        .transition()
        .duration(500)
        .attrTween('d', arcTween)
        .attr('fill', function (d, i) {
            return vis.color(i);
        })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 1);

    vis.pies
        .exit()
        .remove();


    function arcTween(a) {
        const i = d3.interpolate(this._current, a);
        this._current = i(1);
        return (t) => vis.arc(i(t));
    }

    //I got help with implementing the legend with https://d3-legend.susielu.com/#color-ordinal

    // set the color scale
    vis.colorLegend = d3.scaleOrdinal()
        .domain(["No","Yes"])
        .range(["#fee0d2", "#fc9272"]);

    vis.svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(90,-100)");

    var legendOrdinal = d3.legendColor()
        .scale(vis.colorLegend);

    vis.svg.select(".legendOrdinal")
        .call(legendOrdinal);
};

PieChart.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    var vis = this;

    vis.selectedValue = (d3.select("#selected-feature").property("value"));

    vis.filteredData = vis.data.filter(function(d){
        return (d[vis.selectedValue] >= selectionStart && d[vis.selectedValue] <= selectionEnd);

    });

    vis.wrangleData();
};


