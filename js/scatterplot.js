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

    vis.margin = { top: 40, right: 40, bottom: 60, left: 60 };

    vis.width = 700 - vis.margin.left - vis.margin.right,
        vis.height = 700 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    // x-axis == GDP
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    // y-axis == Fruit and Veg availability
    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("g").attr("class", "label");

    vis.svg.append("text").attr("class", "title");

    // // * TO-DO *

    console.log(vis.data);
    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

Scatterplot.prototype.wrangleData = function(){
    var vis = this;

    // // * TO-DO *
    vis.displayData = {};

    // Create a sequence from 0 - 14 (priorities: 1-15; array length: 15), initialize values to (0,0)
    var fruitVegVersusGDP = d3.range(0, 15).map(function(){
        return [0, 0];
    });

    for (let id in vis.data) {
        if (!isNaN(vis.data[id][vis.feature])) {
            this.displayData[id] = vis.data[id][vis.feature];
        }
    }

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


