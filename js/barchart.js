/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 */

BarChart = function(_parentElement, _data, _title, _key){
    var vis = this;
    vis.parentElement = _parentElement;
    vis.key = _key;
    vis.data = _data.map(function (d) {
        let val = d[vis.key];
        if (val === "") {
            val = "None";
        }
        return {"country": d["country"], "country_class" : val};
    });
    vis.title = _title;
    vis.displayData = _data;


    vis.initVis();
};

/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BarChart.prototype.initVis = function(){
    var vis = this;
    vis.margin = { top: 50, right: 50, bottom: 50, left: 50 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        // .attr("width", vis.width + vis.margin.left + vis.margin.right)
        // .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (vis.width + vis.margin.left + vis.margin.right) + " "
            + (vis.height + vis.margin.top + vis.margin.bottom))
        .append("g")
        .classed("svg-content", true)
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-2, 0])
        .html(function(d) {
            if (d.value === 1) {
                return "1 country"
            } else {
                return d.value + " countries";
            }
        });

    vis.svg.call(vis.tool_tip);

    // Scales and axes
    vis.x = d3.scaleBand()
        .range([0, vis.width])
        .domain(catColorDomain[vis.key])
        .padding(0.1);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(function (label) {
            switch (label) {
                case "None":
                case "No data":
                    return label;
                case "experiencing one form of malnutrition":
                    return "1 form";
                case "experiencing two forms of malnutrition":
                    return "2 forms";
                case "experiencing three forms of malnutrition":
                    return "3 forms";
                default:
                    return "";
            }
        });

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.xAxisGroup = vis.svg.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .attr("class", "x-axis axis");

    // x label
    vis.xAxisGroup.append("text")
        .attr("x", vis.width / 2)
        .attr("y", 30)
        .attr("fill", "#000000")
        .text("Malnutrition Classification");

    // Add title
    // vis.svg.append("text")
    //     .attr("class", "bar-title")
    //     .attr("x", vis.width / 2 - 10)
    //     .attr("text-anchor", "center")
    //     .attr("y", - 30)
    //     .text(vis.title);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};



/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
    var vis = this;

    // vis.displayData = vis.data.map(function (d) {
    //     if (d[vis.key] === "") {
    //         d
    //     }
    // });

    // Group data by 'country_class'
    vis.nestedData = d3.nest()
        .key(function(d) {return d[vis.key]; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(vis.data);

    vis.y.domain([0, d3.max(vis.nestedData, function(d) {return d.value; })]);


    // Update the visualization
    vis.updateVis();
};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

BarChart.prototype.updateVis = function(){
    var vis = this;

    var bars = vis.svg.selectAll(".bar")
        .data(vis.nestedData);

    bars.exit().remove();

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .merge(bars)
        .attr("x", function(d){ return vis.x(d.key); })
        .attr("y", function(d){ return vis.y(d.value); })
        .attr("height", function(d){ return vis.height - vis.y(d.value); })
        .attr("width", vis.x.bandwidth())
        .attr("fill", function (d) {
            switch (d.key) {
                case "None":
                    return catColorScale[vis.key][1]
                case "No data":
                    return noDataColor;
                case "experiencing one form of malnutrition":
                    return catColorScale[vis.key][2];
                case "experiencing two forms of malnutrition":
                    return catColorScale[vis.key][3];
                case "experiencing three forms of malnutrition":
                    return catColorScale[vis.key][4];
                default:
                    return "blue";
            }
        })
        .on("mouseover", vis.tool_tip.show)
        .on("mouseout", vis.tool_tip.hide);


    // ---- DRAW AXIS ----


    vis.xAxisGroup.call(vis.xAxis);

    vis.yAxisGroup.call(vis.yAxis);

    vis.svg.select("text.axis-title").remove();

    vis.svg.append("text")
        .attr("class", "axis-title")
        .attr("x", -5)
        .attr("y", -15)
        .attr("dy", ".1em")
        .attr("font-size", "10px")
        .style("text-anchor", "end")
        .text("Countries");

    //
    // // Update the y-axis, don't show the domain path
    // vis.svg.select(".y-axis")
    //     .call(vis.yAxis);
};