
/*
 * LineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

LineChart = function(_parentElement, _data, _groupingData, gender="Female", condition="Obesity"){
    var vis = this;

    vis.timeFormat = d3.timeFormat("'%y");
    vis.parseDate = d3.timeParse("%Y");
    vis.parentElement = _parentElement;
    vis.alldata = _data;
    // vis.data = {};
    // _data.forEach(function (d) {
    //     var countryName = d["country"];
    //     delete d["country"];
    //     let l = [];
    //     Object.keys(d).forEach(function (key) {
    //         l.push({"key": key, "value": d[key]})
    //     });
    //     vis.data[countryName] = l;
    // });

    vis.groupingData = {};
    Object.keys(_groupingData).forEach(function (countryName) {
        let region = _groupingData[countryName].region.replace(/ /g, "_");
        let subregion = _groupingData[countryName].subregion.replace(/ /g, "_");
        vis.groupingData[countryName] = {"region": region, "subregion": subregion}
    });

    // vis.years = Object.keys(_data[0]).map(vis.parseDate);
    //
    // console.log(vis.years);
    // console.log("years");

    vis.value = d3.select("#attribute").property("value");

    vis.initVis();
};

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

LineChart.prototype.initVis = function(){
    var vis = this;
    vis.margin = { top: 30, right: 10, bottom: 30, left: 30 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .classed("svg-content", true);

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(vis.timeFormat);

    // Represents percent in current applications
    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, 100]);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.linePath = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(vis.parseDate(d.key)); })
        .y(function(d) { return vis.y(d.value);});

    // Create brush. -5 in order to force it above the top peak.
    // vis.brush = d3.brushX()
    //     .extent([[0, -5], [vis.width, vis.height]])
    //     .on("brush", brushed);

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .call(vis.yAxis)
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .attr("fill", "black")
        .text("%");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis)
        .append("text")
        .attr("x", vis.width / 2)
        .attr("y", 25)
        .attr("text-anchor", "center")
        .attr("fill", "black")
        .text("Year");

    // tool tip
    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-2, 0])
        .html(function(key) {
            return key;
            // let id = d["id"];
            // if (vis.data[id]) {
            //     let s = vis.data[id]["country"] + "<br>"+ metadata[vis.feature] + " : ";
            //     if (vis.displayData[id]) {
            //         s+= vis.displayData[id];
            //     }
            //     return s;
            // } else {
            //     return "No Data";
            // }
        });

    vis.svg.call(vis.tool_tip);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/*
 * Data wrangling
 */

LineChart.prototype.wrangleData = function(){
    var vis = this;

    vis.data = {};

    console.log(vis.value);
    switch(vis.value) {
        case "country_class":
            vis.alldata = femaleDiabetes;
            gender = "Female";
            condition = "Diabetes";
            break;
        case "adult_fem_diabetes_track":
            vis.alldata = femaleDiabetes;
            gender = "Female";
            condition = "Diabetes";
            break;
        case "adult_mal_diabetes_track":
            vis.alldata = maleDiabetes;
            gender = "Male";
            condition = "Diabetes";
            break;
        case "adult_fem_obesity_track":
            vis.alldata = femaleObesity;
            gender = "Female";
            condition = "Obesity";
            break;
        case "adult_mal_obesity_track":
            vis.alldata = maleObesity;
            gender = "Male";
            condition = "Obesity";
            break;
        default:
            console.log("not recognized");
    }

    vis.title = gender + ", " + condition + " (%)";

    // Add title
    vis.svg.append("text")
        .attr("class", "area-title")
        .attr("x", vis.width / 2)
        .attr("y", -20)
        .attr("font-size", 12)
        .text(vis.title);

    vis.years = Object.keys(vis.alldata[0]).map(vis.parseDate);
    console.log("alldata")
    console.log(vis.alldata);
    vis.alldata.forEach(function (d) {
        console.log("d is ")
        console.log(d);
        var countryName = d["country"];
        let l = [];
        // go through each year, create list of (key=year, value) pairs
        Object.keys(d).forEach(function (key) {
            if (key !== "country") {
                l.push({"key": key, "value": d[key]})
            }
        });
        vis.data[countryName] = l;
    });

    vis.displayData = {};

    vis.displayData = vis.data;

    console.log(vis.displayData);
    // Update the visualization
    vis.updateVis();
};


/*
 * The drawing function
 */

LineChart.prototype.updateVis = function(){
    var vis = this;
    vis.x.domain(d3.extent(vis.years));
    vis.svg.select(".x-axis").transition().duration(transitionDuration).call(vis.xAxis);
    // Draw path
    // each key is a country
    Object.keys(vis.displayData).forEach(function (key) {
        vis.svg.append("path")
            .datum(vis.displayData[key])
            .attr("stroke", lightBlue)
            .attr("stroke-opacity", 0.3)
            .attr("stroke-width", 2)
            .attr("fill", "rgba(255,255,255,0)")
            .attr("class", function (d) {
                console.log("d is ")
                console.log(d);
                console.log("key is " + key);
                // d.key = key;
                return key.replace(/ /g, "_") + " linepath";
                // let region = vis.groupingData[key]["region"];
                // let subregion = vis.groupingData[key]["subregion"];
                // return key.replace(" ", "_") + " " + region + " " + subregion;
            })
            .on("mouseover", function() {
                vis.tool_tip.show(key);
            })
            .on("mouseout", function() {
                vis.tool_tip.hide(key);
            })
            .attr("d", vis.linePath);
    })

}

