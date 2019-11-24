/* Scatterplot - Object constructor function
* @param _parentElement 	-- the HTML element in which to draw the visualization
* @param _data				-- the dataset
* * @param _config		    -- variable from the dataset (e.g. 'food and vegetable availability') and title for each bar chart

*/


Scatterplot = function(_parentElement, _data, _config){
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;
    this.displayData = Object.values(_data);

    this.initVis();
}


/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

Scatterplot.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 30, right: 30, bottom: 60, left: 60 };

    vis.width = 750 - vis.margin.left - vis.margin.right,
        vis.height = 550 - vis.margin.top - vis.margin.bottom;

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

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // graph title
    vis.svg.append("text").attr("class", "title")
        .attr("x", 300)
        .attr("y", vis.margin.top/4)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Under 5 Mortality Rate vs GDP of Countries (2013)");

    // x-axis label
    vis.svg.append('text')
        .attr('x', vis.width / 2)
        .attr('y', vis.height + vis.margin.bottom/1.5)
        .attr('text-anchor', 'middle')
        .attr("fill", "black")
        .text('Gross Domestic Product');

    // // y-axis label
    vis.svg.append("text")
        .text("Under 5 Mortality Rate")
        .attr("fill", "black")
        .attr("x", -vis.height/1.5)
        .attr("y", - vis.margin.left/2)
        .attr("transform", "rotate(-90)");

    // // * TO-DO *
    console.log("Original data", vis.data);
    console.log(vis.displayData);
    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

Scatterplot.prototype.wrangleData = function(){
    var vis = this;

    // // * TO-DO *
    // vis.displayData = {};

    // // Create a sequence from 0 - 14 (priorities: 1-15; array length: 15), initialize values to (0,0)
    // var fruitVegVersusGDP = d3.range(0, 15).map(function(){
    //     return [0, 0];
    // });
    //
    // for (let id in vis.data) {
    //     if (!isNaN(vis.data[id][vis.feature])) {
    //         this.displayData[id] = vis.data[id][vis.feature];
    //     }
    // }
    vis.displayData.forEach(function(d){

        if (isNaN(d.GDP_capita_PPP_2013)){
            d.GDP_capita_PPP_2013 = 0;
        }
        if (isNaN(d.u5mr_2013)){
            d.u5mr_2013 = 0;
        }
    });

    // Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

Scatterplot.prototype.updateVis = function(){
    var vis = this;

    vis.x.domain([0, d3.max(vis.displayData, function(d) {return d.GDP_capita_PPP_2013; })]);
    vis.y.domain([0, d3.max(vis.displayData, function(d) {return d.u5mr_2013; })]);

    // create tooltip using d3 library
    vis.tooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d){
            return "Country: " + d.country +
                "</br>  GDP Per Capita: " + d.GDP_capita_PPP_2013 +
                "</br>  Under 5 Mortality Rate: " + d.u5mr_2013 ; });
    vis.svg.call(vis.tooltip);

    vis.colorPalette = d3.scaleOrdinal(d3.schemeCategory10);
    vis.colorPalette.domain(["Europe", "Asia", "Latin America and the Caribbean","N. America", "Africa", "Oceania" ]);

    vis.svg.selectAll("circle")
        .data(vis.displayData)
        .enter()
        .append("circle")
        .attr("fill", function(d){
            return vis.colorPalette(d.region);
        })
        // add tooltip whenever mouse hovers over
        .on("mouseover", vis.tooltip.show)
        .on("mouseout", vis.tooltip.hide)
        .attr("stroke", "black")
        .attr("cx", function(d){ return vis.x(d.GDP_capita_PPP_2013); })
        .attr("cy", function(d){ return vis.y(d.u5mr_2013); })
        .attr("r", 2);

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);


}


