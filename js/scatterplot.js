
/* Scatterplot
*/
Scatterplot = function(_parentElement, _data, _config){
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;
    this.displayData = Object.values(_data);

    this.initVis();
};


/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */
Scatterplot.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 200, bottom: 60, left: 60 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.transitionDuration = 800;

    vis.determineAxis();
    // Scales and axes
    // x-axis == GDP
    vis.x = d3.scaleLinear()
        .domain([0, vis.xUpper])
        .range([0, vis.width]);

    // y-axis == Under 5 Mortality RAte
    vis.y = d3.scaleLinear()
        .domain([0, vis.yUpper])
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

    // Call axis functions
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    // graph title
    vis.svg.append("text").attr("class", "title")
        .attr("x", 300)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px");

    // x-axis label
    vis.svg.append('text')
        .attr('x', vis.width / 2)
        .attr('y', vis.height + vis.margin.bottom/1.5)
        .attr('text-anchor', 'middle')
        .attr("fill", "black")
        .text('Per Capita Gross Domestic Product');

    // y-axis label
    vis.svg.append("text")
        .text("Under 5 Mortality Rate")
        .attr("fill", "black")
        .attr("x", -vis.height/1.5)
        .attr("y", - vis.margin.left/2)
        .attr("transform", "rotate(-90)");

    // Color Scheme and legend for regions of the world
    vis.colorPalette = d3.scaleOrdinal(d3.schemeTableau10);
    vis.colorPalette.domain(["Europe", "Asia", "Latin America and the Caribbean","N. America", "Africa", "Oceania" ]);

    vis.legendGroup = vis.svg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(" + (vis.width) + ", 0)");

    vis.legendSequential = d3.legendColor()
        .shapeWidth(5)
        .shapeHeight(15)
        .orient("vertical")
        .scale(vis.colorPalette);

    // add legend
    vis.legendGroup.call(vis.legendSequential);

    // scale function for population circles
    vis.populationScale = d3.scaleSqrt()
        .domain(d3.extent(vis.displayData, function(d) {return d.population_2017;}))
        .range([4, 30]);

    // add legend for population sizes
    vis.addLegend();

    // create tooltip using d3 library
    vis.tooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d){
            return "Country: " + d.country +
                "</br>  GDP Per Capita: " + d[vis.x_param] +
                "</br>  Under 5 Mortality Rate: " + d[vis.y_param] ; });
    vis.svg.call(vis.tooltip);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/*
 * Data wrangling
 */
Scatterplot.prototype.wrangleData = function(){
    var vis = this;

    // get parameter for scatterplot
    // start out with year 2000
    vis.my_param = "2000";
    vis.x_param = "GDP_capita_PPP_" + vis.my_param;
    vis.y_param = "u5mr_" + vis.my_param;

    vis.svg.select('.title')
        .text("Under 5 Mortality Rate vs Per Capita GDP of Countries in " + vis.my_param);

    // sort by descending population so that all of the nodes show up and don't cover each other
    vis.displayData = vis.displayData.sort(function(a,b){
        return b.population_2017 - a.population_2017;
    });

    d3.select('#scatterplot-play-button').on("click", function(){
        vis.arrayIndex = 0;
        vis.animateScatterplot(vis.arrayIndex);
        // this.disabled = true;
        $('#scatterplot-play-button').prop("disabled", true);
        setTimeout( function(){$('#scatterplot-play-button').removeAttr("disabled")}, 20000);
        this.value = "Replay";
    });

    //slider for exploring the years
    d3.select("#slider").on("change", function() {
        vis.my_param = this.value;
        vis.x_param = "GDP_capita_PPP_" + vis.my_param;
        vis.y_param = "u5mr_" + vis.my_param;
        vis.svg.select('.title')
            .text("Under 5 Mortality Rate vs Per Capita GDP of Countries in " + vis.my_param);

        document.getElementById('scatterplot-year').innerText = "Year: " + vis.my_param;
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
};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */
Scatterplot.prototype.updateVis = function(){
    var vis = this;

    var temp = vis.svg.selectAll(".countries")
        .data(vis.displayData, function(d){return d.id;});

    temp.enter()
        .append("circle")
        .attr("class", "countries")
        .merge(temp)
        // color circle by region of the world
        .attr("fill", function(d){
            return vis.colorPalette(d.region);
        })
        // add tooltip whenever mouse hovers over
        .on("mouseover", vis.tooltip.show)
        .on("mouseout", vis.tooltip.hide)
        // radius proportional to country's population in 2017
        .attr("r", function(d){ return vis.populationScale(d.population_2017);})
        .transition()
        .duration(vis.transitionDuration)
        .attr("cx", function(d){ return vis.x(d[vis.x_param]); })
        .attr("cy", function(d){ return vis.y(d[vis.y_param]); });

    temp.exit().remove();
};

/*
 * function for determining upper limits of x and y axis
 */
Scatterplot.prototype.determineAxis = function (){
    var vis = this;

    vis.years = ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009",
        "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017"];

    // Max values for x and y axis
    vis.xUpper = 0;
    vis.yUpper = 0;

    vis.years.forEach(function(year){
        vis.my_param = year;
        vis.x_param = "GDP_capita_PPP_" + vis.my_param;
        vis.y_param = "u5mr_" + vis.my_param;

        vis.xUpper = Math.max(vis.xUpper, d3.max(vis.displayData, function(d) {return d[vis.x_param]; }));
        vis.yUpper = Math.max(vis.yUpper, d3.max(vis.displayData, function(d) {return d[vis.y_param]; }));
    });


};


/*
 * Function for animating scatterplot
 */
Scatterplot.prototype.animateScatterplot = function(my_index){
    var vis = this;

    setTimeout(function(){
        vis.my_param = vis.years[my_index];
        vis.x_param = "GDP_capita_PPP_" + vis.my_param;
        vis.y_param = "u5mr_" + vis.my_param;
        vis.svg.select('.title')
            .text("Under 5 Mortality Rate vs Per Capita GDP of Countries in " + vis.my_param);
        document.getElementById('scatterplot-year').innerText = "Year: " + vis.my_param;
        vis.displayData.forEach(function(d){
            if (isNaN(d[vis.x_param])){
                d[vis.x_param] = 0;
            }
            if (isNaN(d[vis.y_param])){
                d[vis.y_param] = 0;
            }
        });

        // update slider as we animate
        $('#slider').val(vis.my_param);
        $('#slider').trigger('change');

        vis.updateVis();

        if (my_index < vis.years.length - 1){
            vis.animateScatterplot(my_index + 1);
        }

    }, 1000);

};

// Source: https://www.d3-graph-gallery.com/graph/bubble_legend.html
// Also used in choroplethBubble.js file as well
Scatterplot.prototype.addLegend = function () {
    var vis = this;
    var valuesToShow = [1000, 100000, 1000000]
    var xCircle = vis.width + 20;
    var xLabel = vis.width + 60;
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
