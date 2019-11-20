
/*
 * CountVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

Histogram = function(_parentElement, _data, _eventHandler ){
    this.parentElement = _parentElement;
    this.data = _data;
    // this.MyEventHandler = _eventHandler;

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

Histogram.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 0, bottom: 200, left: 140 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
    // vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 700 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // SVG clipping path
    // ***TO-DO***


    // Scales and axes
    // vis.x = d3.scaleLinear()
    //     .range([0, 400])
    //     .domain(d3.extent(vis.data.map(function(d){ return d.Sugar_sweetened_beverages_2016; })));

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, 150]);

    // vis.xAxis = d3.axisBottom()
    //     .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    // vis.svg.append("g")
    //     .attr("class", "x-axis axis")
    //     .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Axis title
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Sugar Intake Via Sweetened Beverages");

    // Axis title
    vis.svg.append("text")
        .attr("x", 300)
        .attr("y", 520)
        .text("Number of Countries Per Grams of Sugar");

    vis.displayData = this.data.map(function(d, i) {
        return d.Sugar_sweetened_beverages_2016;
    });

    var firstFifth = 0;
    var secondFifth = 0;
    var thirdFifth = 0;
    var fourthFifth = 0;
    var fifthFifth = 0;

    vis.displayData.forEach(function(d,i) {

        if (d <= 70 && d >= 0) {
            firstFifth++ ;
        } else if (d <= 140 && d >= 71) {
            secondFifth++;
        } else if (d <= 210 && d >= 141) {
            thirdFifth++;
        } else if (d <= 280 && d >= 211) {
            fourthFifth++;
        } else if (d <= 350 && d >= 281) {
            fifthFifth++;
        }

    });

    vis.countsForBars = [firstFifth, secondFifth, thirdFifth, fourthFifth, fifthFifth];


    vis.bar = vis.svg.selectAll("rect")
        .data(vis.countsForBars);

        vis.bar.enter()
        .append("rect")
        .attr("fill", "red")
        .attr("class", "bar")
        .attr("width", 70)
        .attr("height", function(d, index) {
            return vis.height - vis.y(d);
        })
        .attr("x", function(d, index){
            return 20 + (index * 120) ;
        })
        .attr("y", function(d, i){
            return vis.y(d);
        });


    //Info regarding the building labels
    vis.bar.enter().append("text")
        .text(function(d, i) {
            console.log(d);
            if (i == 0) {
                return "0 - 70";
            } else if (i == 1) {
                return "71 - 140";
            } else if (i == 2) {
                return "141 - 210";
            } else if (i == 3) {
                return "211 - 280";
            } else if (i == 4) {
                return "281 - 350";
            }
        })
            .attr("class", "bar-label")
            .attr("x", function(d, i) {
                return 25 + (i * 120);
            })
            .attr("y", 500);



    // Initialize brushing component
    // *** TO-DO ***
    vis.currentBrushRegion = null;

    vis.brush = d3.brushX()
        .extent([[0,0],[vis.width, vis.height]])
        .on("brush", function(){
            // User just selected a specific region
            vis.currentBrushRegion = d3.event.selection;
            vis.currentBrushRegion = vis.currentBrushRegion.map(vis.x.invert);

            // 3. Trigger the event 'selectionChanged' of our event handler
            $(vis.MyEventHandler).trigger("selectionChanged", vis.currentBrushRegion);
        });

    // console.log(vis.currentBrushRegion);

    // Append brush component here
    // *** TO-DO ***
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush")
        .call(vis.brush);


    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/** Data wrangling */

Histogram.prototype.wrangleData = function(){
    var vis = this;

    // Update the visualization
    vis.updateVis();
};


Histogram.prototype.updateVis = function(){
    var vis = this;

    // Call brush component here
    vis.brushGroup.call(vis.brush, vis.currentBrushRegion);


    // Call axis functions with the new domain
    // vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};

Histogram.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    var vis = this;


    vis.wrangleData();
};
