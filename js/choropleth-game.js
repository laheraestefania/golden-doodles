/*
 * ChoroplethGame - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

ChoroplethGame = function(_parentElement, _data, topology, feature){
    this.parentElement = _parentElement;
    this.data = _data;
    this.world = topojson.feature(topology, topology.objects.countries).features;
    this.feature = feature;
    this.mostCount = 0;
    this.leastCount = 0;
    this.mostColor = "rgb(18,49,103)";
    this.leastColor = "rgb(227,237,247)";
    this.state = "most";
    // store the "answers" -which consume the most and least
    this.most = new Set();
    this.least = new Set();
    this.guessedMost = new Set();
    this.guessedLeast = new Set();
    this.correct = new Set();
    this.guessLimit = 4;

    this.initVis();
};

/*
 * Initialize area chart with brushing component
 */

ChoroplethGame.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.parentElt = d3.select("#" + vis.parentElement);
    vis.svg = vis.parentElt.append("svg")
        .attr("class", "game-svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Projection-settings for mercator
    vis.projection = d3.geoMercator()
        .center([50, 60])                 // Where to center the map in degrees
        .rotate([0, 0])                // Map-rotation
        .scale((vis.width - 10) / 2 / Math.PI);

    // D3 geo path generator (maps geodata to SVG paths)
    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [vis.width, vis.height]])
        .on('zoom', function () {
            vis.svg.attr('transform', d3.event.transform);
        });

    vis.parentElt.select(".game-svg").call(vis.zoom);
    // vis.svg.call(vis.zoom);

    vis.legendGroup = vis.parentElt.select("svg").append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(" + (vis.width - 80) + ", 10)");

    vis.legendSequential = d3.legendColor()
        .shapeWidth(15)
        .shapeHeight(15)
        .cells(2)
        .ascending(true)
        .orient("vertical")
        .scale(d3.scaleOrdinal()
            .domain(["most", "least"])
            .range(["rgb(18,49,103)", "rgb(227,237,247)"]));

    vis.legendGroup.call(vis.legendSequential);

    $("#map-game-title").html(`<h3>${metadata[vis.feature]} </h3>`);

    $("#map-game-instructions").hide()
        .html("Can you guess which " + vis.guessLimit + " countries consume the MOST?")
        .fadeIn("slow");

    // Render the world atlas by using the path generator
    vis.paths = vis.svg.selectAll(".country-path-game")
        .data(vis.world);

    vis.paths.enter().append("path")
        .attr("class", "country-path-game")
        .attr("d", vis.path)
        .attr("fill", noDataColor)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.25)
        .on("mouseover", function(d) {
            vis.parentElt.selectAll(".country-path-game").attr("opacity", "0.75");
            d3.select(this).attr("opacity", "1.0");
        })
        .on("mouseout", function(d) {
            vis.parentElt.selectAll(".country-path-game").attr("opacity", "1.0");
        })
        .on("click", function (d) {
            if (vis.state === "most") {
                if (d3.select(this).attr("fill") === noDataColor && vis.mostCount < vis.guessLimit) {
                    d3.select(this).attr("fill", vis.mostColor);
                    vis.mostCount += 1;
                    vis.guessedMost.add(d["id"]);
                    // console.log("added to vis.guessedMost " + vis.data[d["id"]]["country"]);
                    if (vis.mostCount === vis.guessLimit) {
                        vis.state = "least";
                        $("#map-game-instructions").fadeOut("slow", function () {
                            $(this).html("Can you guess which " + vis.guessLimit + " countries consume the LEAST?")
                        }).fadeIn("slow");
                    }
                } else if (d3.select(this).attr("fill") === vis.mostColor) {
                    vis.mostCount -= 1;
                    vis.guessedMost.delete(d["id"]);
                    d3.select(this).attr("fill", noDataColor);
                }
                // Otherwise, do nothing
            } else if (vis.state === "least") { // mode === "least
                if (d3.select(this).attr("fill") === noDataColor && vis.leastCount < vis.guessLimit) {
                    d3.select(this).attr("fill", vis.leastColor);
                    vis.leastCount += 1;
                    vis.guessedLeast.add(d["id"]);
                    // console.log("added to vis.guessedLeast " + vis.data[d["id"]]["country"]);
                    if (vis.leastCount === vis.guessLimit) {
                        vis.state = "";
                        console.log("guesses");
                        console.log(vis.guessedMost);
                        console.log(vis.guessedLeast);
                        // vis.wrangleData();
                        setTimeout(function () {
                            vis.wrangleData();
                        }, 1000);
                    }
                } else if (d3.select(this).attr("fill") === vis.leastColor) {
                    vis.leastCount -= 1;
                    vis.guessedLeast.delete(d["id"]);
                    d3.select(this).attr("fill", noDataColor);
                }
            }
        });
};

ChoroplethGame.prototype.wrangleData = function () {
    let vis = this;
    console.log("wrangling");

    let sorted = [];
    for (let id in vis.data) {
        if (!isNaN(vis.data[id][vis.feature])) {
            sorted.push({"id": id, "val" : vis.data[id][vis.feature]})
        }
    }
    sorted.sort(function (a, b) {return a.val - b.val});
    sorted.slice(-vis.guessLimit).forEach(function (obj) {
        vis.most.add(+obj["id"]);
    });
    sorted.slice(0, vis.guessLimit).forEach(function (obj) {
        vis.least.add(+obj["id"]);
    });

    vis.showResults();
};

ChoroplethGame.prototype.showResults = function () {
    let vis = this;
    console.log("most and least");

    console.log(vis.most);
    console.log(vis.least);

    vis.svg.selectAll(".country-path-game")
        .attr("fill",function (d) {
            let id = d["id"];
            if (vis.most.has(id) || vis.least.has(id)) {
                if ((vis.guessedMost.has(id) && vis.most.has(id)) || (vis.guessedLeast.has(id) && vis.least.has(id))) {
                    vis.correct.add(id);
                }
                if (vis.most.has(id)) {
                    return vis.mostColor;
                } else {
                    return vis.leastColor;
                }
            } else {
                return noDataColor;
            }
        });

    $("#map-game-instructions").fadeOut("slow", function () {
        let htmlText = "Results! <br>You guessed <strong>" + vis.correct.size + " out of "
            + (2 * vis.guessLimit) + "</strong>. <br> The countries that consume the MOST are: <ol>";
       vis.most.forEach(function (id) {
            htmlText += "<li> " + vis.data[id]["country"] + "</li>"
        });
        htmlText += "</ol> <br> The countries that consume the LEAST are: <ol>";
        vis.least.forEach(function (id) {
            htmlText += "<li> " + vis.data[id]["country"] + "</li>"
        });
        $(this).html(htmlText + "</ol>");
        $(this).fadeIn("slow");
    });



};