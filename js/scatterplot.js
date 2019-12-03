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

    vis.margin = { top: 30, right: 60, bottom: 60, left: 60 };

    vis.width = 750 - vis.margin.left - vis.margin.right,
        vis.height = 550 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.transitionDuration = 800;

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


    vis.colorPalette = d3.scaleOrdinal(d3.schemeCategory10);
    vis.colorPalette.domain(["Europe", "Asia", "Latin America and the Caribbean","N. America", "Africa", "Oceania" ]);

    vis.legendGroup = vis.svg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(" + (vis.width - vis.margin.right * 2) + ", 30)");

    vis.legendSequential = d3.legendColor()
        .shapeWidth(5)
        .shapeHeight(15)
        .orient("vertical")
        .scale(vis.colorPalette);

    // scale function for population circles
    vis.populationScale = d3.scaleSqrt()
        .domain(d3.extent(vis.displayData, function(d) {return d.population_2017;}))
        .range([4, 30]);

    vis.addLegend();

    // (Filter, aggregate, modify data)
    vis.wrangleData();



}


/*
 * Data wrangling
 */

Scatterplot.prototype.wrangleData = function(){
    var vis = this;

    // get parameter for scatterplot
    vis.my_param = d3.select("#scatterplot-year").property("value");
    vis.x_param = "GDP_capita_PPP_" + vis.my_param;
    vis.y_param = "u5mr_" + vis.my_param;

    vis.svg.select('.title')
        .text("Under 5 Mortality Rate vs GDP of Countries in " + vis.my_param);

    // sort by descending population so that all of the nodes show up and don't cover each other
    vis.displayData = vis.displayData.sort(function(a,b){
        return b.population_2017 - a.population_2017;
    });

    d3.select("#scatterplot-year").on("change", function() {
        vis.my_param = d3.select("#scatterplot-year").property("value");
        vis.x_param = "GDP_capita_PPP_" + vis.my_param;
        vis.y_param = "u5mr_" + vis.my_param;
        vis.svg.select('.title')
            .text("Under 5 Mortality Rate vs GDP of Countries in " + vis.my_param);

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
        .attr("r", function(d){ return vis.populationScale(d.population_2017);})
        .attr("stroke", "black")
        .transition()
        .duration(vis.transitionDuration)
        .attr("cx", function(d){ return vis.x(d[vis.x_param]); })
        .attr("cy", function(d){ return vis.y(d[vis.y_param]); });

    temp.exit().remove();

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").transition(vis.transitionDuration).call(vis.xAxis);
    vis.svg.select(".y-axis").transition(vis.transitionDuration).call(vis.yAxis);


    vis.legendGroup.call(vis.legendSequential);

}


// Source: https://www.d3-graph-gallery.com/graph/bubble_legend.html
// Also used in choroplethBubble.js file as well
Scatterplot.prototype.addLegend = function () {
    var vis = this;
    var valuesToShow = [1000, 100000, 1000000]
    var xCircle = vis.width - vis.margin.right;
    var xLabel = vis.width;
    var yCircle = vis.margin.bottom * 4;

    vis.svg.selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("circle")
        .attr("class", "bubble-legend")
        .attr("cx", xCircle)
        .attr("cy", function(d){ return yCircle - vis.populationScale(d) } )
        .attr("r", function(d){ return vis.populationScale(d) })
        .style("fill", "none")
        .attr("stroke", "black")
        .attr("opacity", 0.0)
        .transition()
        .duration(vis.transitionDuration)
        .attr("opacity", 1.0);

// Add legend: segments
    vis.svg.selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("line")
        .attr("class", "bubble-legend")
        .attr('x1', function(d){ return xCircle + vis.populationScale(d) } )
        .attr('x2', xLabel)
        .attr('y1', function(d){ return yCircle - vis.populationScale(d) } )
        .attr('y2', function(d){ return yCircle - vis.populationScale(d) } )
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))
        .attr("opacity", 0.0)
        .transition()
        .duration(vis.transitionDuration)
        .attr("opacity", 1.0);

// Add legend: labels
    vis.svg.selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("text")
        .attr("class", "bubble-legend")
        .attr('x', xLabel)
        .attr('y', function(d){ return yCircle - vis.populationScale(d) } )
        .text( function(d){ return d * 1000 } )
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
        .attr("opacity", 0.0)
        .transition()
        .duration(vis.transitionDuration)
        .attr("opacity", 1.0);

    vis.svg.append("text")
        .attr("class", "bubble-legend")
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
        .attr('x', xCircle - 35)
        .attr('y', yCircle + 15)
        .text("Population (2017)")
        .attr("opacity", 0.0)
        .transition()
        .duration(vis.transitionDuration)
        .attr("opacity", 1.0);
};
