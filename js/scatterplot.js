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
        .style("font-size", "16px");

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

    // get parameter for scatterplot
    var my_param = d3.select("#scatterplot-year").property("value");
    vis.x_param = "GDP_capita_PPP_" + my_param;
    // console.log("x param", vis.x_param);
    vis.y_param = "u5mr_" + my_param;

    vis.svg.select('.title')
        .text("Under 5 Mortality Rate vs GDP of Countries in " + my_param);

    // console.log("y param", vis.y_param);
    d3.select("#scatterplot-year").on("change", function() {
        my_param = d3.select("#scatterplot-year").property("value");
        // console.log(my_param);
        vis.x_param = "GDP_capita_PPP_" + my_param;
        vis.y_param = "u5mr_" + my_param;
        vis.svg.select('.title')
            .text("Under 5 Mortality Rate vs GDP of Countries in " + my_param);

        vis.displayData.forEach(function(d){

            if (isNaN(d[vis.x_param])){
                d[vis.x_param] = 0;
            }
            if (isNaN(d[vis.y_param])){
                d[vis.y_param] = 0;
            }
        });
        vis.updateVis();
    });

    vis.displayData.forEach(function(d){

        if (isNaN(d[vis.x_param])){
            d[vis.x_param] = 0;
        }
        if (isNaN(d[vis.y_param])){
            d[vis.y_param] = 0;
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


    vis.x.domain([0, d3.max(vis.displayData, function(d) {return d[vis.x_param]; })]);
    vis.y.domain([0, d3.max(vis.displayData, function(d) {return d[vis.y_param]; })]);

    // create tooltip using d3 library
    vis.tooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d){
            return "Country: " + d.country +
                "</br>  GDP Per Capita: " + d[vis.x_param] +
                "</br>  Under 5 Mortality Rate: " + d[vis.y_param] ; });
    vis.svg.call(vis.tooltip);

    vis.colorPalette = d3.scaleOrdinal(d3.schemeCategory10);
    vis.colorPalette.domain(["Europe", "Asia", "Latin America and the Caribbean","N. America", "Africa", "Oceania" ]);

    var temp = vis.svg.selectAll(".countries")
        .data(vis.displayData, function(d){return d.id;});

    temp.enter()
        .append("circle")
        .attr("class", "countries")
        .merge(temp)
        .attr("fill", function(d){
            return vis.colorPalette(d.region);
        })
        // add tooltip whenever mouse hovers over
        .on("mouseover", vis.tooltip.show)
        .on("mouseout", vis.tooltip.hide)
        .attr("r", 5)
        .transition()
        .duration(800)
        .attr("cx", function(d){ return vis.x(d[vis.x_param]); })
        .attr("cy", function(d){ return vis.y(d[vis.y_param]); });

    temp.exit().remove();

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").transition(800).call(vis.xAxis);
    vis.svg.select(".y-axis").transition(800).call(vis.yAxis);


}


