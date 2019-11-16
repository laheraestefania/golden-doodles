/* Scatterplot - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data				-- the dataset
* * @param _config		    -- variable from the dataset (e.g. 'food and vegetable availability') and title for each bar chart

*/


Scatterplot = function(_parentElement, _data, _config){
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;
    this.displayData = _data;

    this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

Scatterplot.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 50, bottom: 60, left: 150 };

    vis.width = 500 - vis.margin.left - vis.margin.right,
        vis.height = 300 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // // Scales and axes
    // vis.x = d3.scaleLinear()
    //     .range([0, vis.width]);
    //
    // vis.y = d3.scaleBand()
    //     .range([0, vis.height]);
    //
    // vis.yAxis = d3.axisLeft()
    //     .scale(vis.y);
    //
    // vis.svg.append("g")
    //     .attr("class", "y-axis axis");
    //
    // vis.svg.append("g").attr("class", "label");
    //
    // vis.svg.append("text").attr("class", "title");
    //
    // // * TO-DO *


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

Scatterplot.prototype.wrangleData = function(){
    var vis = this;

    // // * TO-DO *

    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

Scatterplot.prototype.updateVis = function(){
    var vis = this;

    // * TO-DO *



}


