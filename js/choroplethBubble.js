/*
 * Choropleth Bubble hybrid
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

function constructHtmlText(d) {
    let s = d["country"];
    s += "<br>Region: " + d["region"] + "<br>Subregion: " + d["subregion"];
    if (!isNaN(d["feature"])) {
        s += "<br>" + d["featureName"] + ": " + d["feature"];
    } else {
        s += "<br>" + d["featureName"] + ": No data";
    }
    return s;
}

ChoroplethBubble = function(_parentElement, _data, topology, feature){
    var vis = this;
    vis.parentElement = _parentElement;
    vis.parentElt = d3.select("#" + vis.parentElement);
    vis.data = _data;
    vis.displayData = [];
    vis.world = topojson.feature(topology, topology.objects.countries).features;
    vis.feature = feature;
    vis.mapMode = true;
    $('#map-radio-button').prop('checked', true);
    d3.selectAll(".bubble-legend-group").remove();
    // $('#population-radio-button').attr('checked', '');
    vis.padding = 1.5; // separation between same-color circles
    vis.clusterPadding = 30; // separation between different-color circles
    vis.maxRadius = 40;

    // total number of nodes
    vis.n = vis.data.length;

    // default cluster by region
    vis.clusterCat = "region";

    // total number of clusters - default is by region
    vis.m = numbering[vis.clusterCat]["num"];
    // vis.color = d3.scaleSequential(d3.interpolateBlues);
    vis.color = d3.scaleSequential(sequentialInterpolator);
    vis.clusters = new Array(vis.m);


    vis.radiusScale = d3.scaleSqrt()
        .domain(d3.extent(Object.values(vis.data), function(d) { return +d["population_2017"];} ))
        .range([2, vis.maxRadius]);

    $("#bubble-radio-div").hide();

    $('input[type=radio][name=bubble-scope]').on('change', function() {
        switch ($(this).val()) {
            case 'region':
                console.log("region");
                vis.m = numRegions;
                vis.clusters = new Array(vis.m);
                vis.clusterCat = "region";
                vis.wrangleData();
                break;
            case 'subregion':
                console.log("subregion");
                vis.m = numSubRegions;
                vis.clusters = new Array(vis.m);
                vis.clusterCat = "subregion";
                vis.wrangleData();
                break;
        }
    });

    $("#choro-bubble-title").html(metadata[feature]);

    vis.initVis();
};

ChoroplethBubble.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("class", "hybrid-svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // min of col-7 is 430 pixels
    let centerLong = 200;
    let centerLat = 40;
    let projectionScale = 80;
    if (vis.width > 700) {
        console.log("bigger than 700");
        centerLong = 50;
        projectionScale = 110;
    } else if (vis.width > 600) {
        centerLong = 100;
        projectionScale = 95;
    } else if (vis.width > 500) {
        centerLong = 150;
        projectionScale = 85;
    }

    // Projection-settings for mercator
    vis.projection = d3.geoMercator()
        // .center([180, 60])
        .center([centerLong, centerLat])
        // .scale(vis.width/ Math.PI / 2 - 5)
        .scale(projectionScale)
        .rotate([0, 0]);

    // D3 geo path generator (maps geodata to SVG paths)
    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [vis.width, vis.height]])
        .on('zoom', function () {
            vis.svg.attr('transform', d3.event.transform);
        });

    vis.color = d3.scaleSequential(d3.interpolateBlues)
        .domain([
        0,
        d3.max(Object.values(vis.data), function (d) {return d[vis.feature]})
    ]);

    vis.legendSvg = d3.select("#" + vis.parentElement + "-legend").append("svg")
        .attr("width", d3.max([$("#" + vis.parentElement + "-legend").width(), 150]))
        .attr("height", vis.height);

    vis.legendGroup = vis.legendSvg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(0, 100)");

    vis.legendSequential = d3.legendColor()
        .shapeWidth(5)
        .shapeHeight(15)
        .cells(10)
        .ascending(true)
        .orient("vertical")
        .scale(vis.color);

    vis.legendGroup.append("rect")
        .attr("x", 0)
        .attr("y", 180)
        .attr("height",15)
        .attr("width", 5)
        .attr("fill", noDataColor);

    vis.legendGroup.append("text")
        .attr("x", 10)
        .attr("y", 190)
        .attr("class", "label")
        .text("No Data");

    vis.legendGroup.call(vis.legendSequential);

    vis.addLegend();

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-2, 0])
        .html(function (d) {
            if (vis.mapMode) {
                let id = d["id"];
                if (vis.data[id]) {
                    let s = vis.data[id]["country"]
                        + "<br>Region: " + vis.data[id]["region"]
                        + "<br>Subregion: " + vis.data[id]["subregion"]
                        + "<br>"+ metadata[vis.feature] + " : ";
                    if (vis.displayData[id]) {
                        s+= vis.displayData[id];
                    }
                    return s;
                } else {
                    return "No Data";
                }
            } else {
                return constructHtmlText(d);
            }

        });

    vis.svg.call(vis.tool_tip);

    vis.nodes = Object.keys(vis.data).map((key) => {
        obj = vis.data[key];
        // scale radius to fit on the screen
        let scaledRadius  = this.radiusScale(+obj["population_2017"]),
            forcedCluster = numbering[vis.clusterCat]["labels"][obj[vis.clusterCat]];

        // add cluster id and radius to array
        nodeObj = {
            cluster : forcedCluster,
            r : scaledRadius,
            feature : obj[vis.feature],
            featureName : metadata[vis.feature],
            region : obj["region"],
            subregion : obj["subregion"],
            country: obj["country"]
        };

        if (!vis.clusters[forcedCluster] || (scaledRadius > vis.clusters[forcedCluster].r)) {
            vis.clusters[forcedCluster] = nodeObj;
        }
        return nodeObj;
    });


    $('input[type=radio][name=bubble-map-radio]').on('change', function() {
        switch ($(this).val()) {
            case 'map':
                vis.mapMode = true;
                vis.wrangleData();
                break;
            case 'population':
                vis.mapMode = false;
                vis.svg.selectAll("path")
                    .transition()
                    .duration(transitionDuration)
                    .attr("opacity", 0.0)
                    .remove();
                d3.select(".hybrid-svg").on(".zoom", null);
                vis.svg.on(".zoom", null);

                $("#bubble-radio-div").fadeIn();

                vis.bubbleLegendGroup.transition().duration(transitionDuration).attr("opacity", 1.0);
                d3.selectAll(".bubble-legend").transition().duration(transitionDuration).attr("opacity", 1.0);

                setTimeout(function () {
                    vis.svg.attr("transform", "translate(" + vis.width* 4/7 + "," + vis.height/2 + ")");
                // }, transitionDuration);

                vis.circles = vis.svg.append('g')
                    .attr("class", "circles-group")
                    .datum(vis.nodes)
                    .selectAll('.node')
                    .data(d => d)
                    .enter().append('circle')
                    .attr('r', (d) => d.r)
                    .attr("class", "node")
                    .attr('fill', function (d) {
                        if (!isNaN(d.feature)) {
                            return vis.color(d.feature)
                        } else {
                            return noDataColor;
                        }

                    })
                    .attr('stroke', 'black')
                    .attr('stroke-width', 0.5)
                    .call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended))
                    // add tooltips to each circle
                    .on("mouseover", vis.tool_tip.show)
                    .on("mouseout", vis.tool_tip.hide);

                // create the clustering/collision force simulation
                vis.simulation = d3.forceSimulation(vis.nodes)
                    .velocityDecay(0.2) // 0.2
                    .force("x", d3.forceX().strength(.0005))
                    .force("y", d3.forceY().strength(.0005))
                    .force("collide", collide)
                    .force("cluster", clustering)
                    .on("tick", ticked);

                function ticked() {
                    vis.circles
                        .attr('cx', (d) => d.x)
                        .attr('cy', (d) => d.y);
                }

                function dragstarted(d) {
                    // was 0.3
                    // controls how loose when dragging
                    if (!d3.event.active) vis.simulation.alphaTarget(0.6).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }

                function dragged(d) {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                }

                function dragended(d) {
                    if (!d3.event.active) vis.simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }

                    // These are implementations of the custom forces.
                function clustering(alpha) {
                    vis.nodes.forEach(function(d) {
                        var cluster = vis.clusters[d.cluster];
                        if (cluster === d) return;
                        var x = d.x - cluster.x,
                            y = d.y - cluster.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.r + cluster.r;
                        if (l !== r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            cluster.x += x;
                            cluster.y += y;
                        }
                    });
                }

                function collide(alpha) {
                    var quadtree = d3.quadtree()
                        .x((d) => d.x)
                        .y((d) => d.y)
                        .addAll(vis.nodes);

                    vis.nodes.forEach(function(d) {
                        var r = d.r + vis.maxRadius + Math.max(vis.padding, vis.clusterPadding),
                            nx1 = d.x - r,
                            nx2 = d.x + r,
                            ny1 = d.y - r,
                            ny2 = d.y + r;
                        quadtree.visit(function(quad, x1, y1, x2, y2) {

                            if (quad.data && (quad.data !== d)) {
                                var x = d.x - quad.data.x,
                                    y = d.y - quad.data.y,
                                    l = Math.sqrt(x * x + y * y),
                                    r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? vis.padding : vis.clusterPadding);
                                if (l < r) {
                                    l = (l - r) / l * alpha;
                                    d.x -= x *= l;
                                    d.y -= y *= l;
                                    quad.data.x += x;
                                    quad.data.y += y;
                                }
                            }
                            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                        });
                    });
                }
                vis.wrangleData();
                }, transitionDuration);
                break;
        }
    });

    vis.wrangleData();
};

ChoroplethBubble.prototype.wrangleData = function () {
    let vis = this;
    if (vis.mapMode) {
        this.displayData = {};
        for (let id in vis.data) {
            if (!isNaN(vis.data[id][vis.feature])) {
                this.displayData[id] = vis.data[id][vis.feature];
            }
        }
    } else {
        vis.nodes.forEach(function (node) {
            node.cluster = numbering[vis.clusterCat]["labels"][node[vis.clusterCat]];
            if (!vis.clusters[node.cluster] || (node.r > vis.clusters[node.cluster].r)) {
                vis.clusters[node.cluster] = node;
            }
        });
    }

    vis.updateVis();
};

ChoroplethBubble.prototype.updateVis = function () {
    let vis = this;

    if (vis.mapMode) {
        // Remove all bubble stuff
        vis.svg.selectAll("circle").transition().duration(transitionDuration).attr("opacity", 0.0).remove();
        vis.bubbleLegendGroup
            .transition()
            .duration(transitionDuration)
            .attr("opacity", 0.0);

        $("#bubble-radio-div").fadeOut();

        vis.svg.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add map
        d3.select(".hybrid-svg").call(vis.zoom);

        // Render the world atlas by using the path generator
        vis.svg.selectAll("path")
            .data(vis.world)
            .enter().append("path")
            .attr("class", "country-path")
            .attr("d", vis.path)
            .attr("fill", function (d) {
                let id = d["id"];
                if (isNaN(vis.displayData[id])){
                    return noDataColor;
                } else {
                    return vis.color(vis.displayData[id]);
                }
            })
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.25)
            .on("mouseover", function(d) {
                d3.selectAll(".country-path").attr("opacity", "0.75");
                d3.select(this).attr("opacity", "1");
                vis.tool_tip.show(d);
            })
            .on("mouseout", function(d) {
                d3.selectAll(".country-path").attr("opacity", "1.0");
                vis.tool_tip.hide(d);
            })
            .attr("opacity", 0.0)
            .transition()
            .duration(transitionDuration)
            .attr("opacity", 1.0);
    } else {


        // nodes
        vis.svg.selectAll('.node')
            .data(vis.nodes)
            .attr('r', (d) => d.r)
            .attr("class", "node")
            .attr('fill', function (d) {
                if (!isNaN(d.feature)) {
                    return vis.color(d.feature)
                } else {
                    return noDataColor;
                }

            })
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            // add tooltips to each circle
            .on("mouseover", vis.tool_tip.show)
            .on("mouseout", vis.tool_tip.hide);

        // create the clustering/collision force simulation
        vis.simulation = d3.forceSimulation(vis.nodes)
            .velocityDecay(0.2) // 0.2
            .force("x", d3.forceX().strength(.0005))
            .force("y", d3.forceY().strength(.0005))
            .force("collide", collide)
            .force("cluster", clustering)
            .on("tick", ticked);

        function ticked() {
            vis.circles
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y);
        }

        function dragstarted(d) {
            // was 0.3
            // controls how loose when dragging
            if (!d3.event.active) vis.simulation.alphaTarget(0.6).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) vis.simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // These are implementations of the custom forces.
        function clustering(alpha) {
            vis.nodes.forEach(function(d) {
                var cluster = vis.clusters[d.cluster];
                if (cluster === d) return;
                var x = d.x - cluster.x,
                    y = d.y - cluster.y,
                    l = Math.sqrt(x * x + y * y),
                    r = d.r + cluster.r;
                if (l !== r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster.x += x;
                    cluster.y += y;
                }
            });
        }

        function collide(alpha) {
            var quadtree = d3.quadtree()
                .x((d) => d.x)
                .y((d) => d.y)
                .addAll(vis.nodes);

            vis.nodes.forEach(function(d) {
                var r = d.r + vis.maxRadius + Math.max(vis.padding, vis.clusterPadding),
                    nx1 = d.x - r,
                    nx2 = d.x + r,
                    ny1 = d.y - r,
                    ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {

                    if (quad.data && (quad.data !== d)) {
                        var x = d.x - quad.data.x,
                            y = d.y - quad.data.y,
                            l = Math.sqrt(x * x + y * y),
                            r = d.r + quad.data.r + (d.cluster === quad.data.cluster ? vis.padding : vis.clusterPadding);
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.data.x += x;
                            quad.data.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            });
        }

    }
};


// Source: https://www.d3-graph-gallery.com/graph/bubble_legend.html
ChoroplethBubble.prototype.addLegend = function () {
    var vis = this;
// Add legend: circles
    var valuesToShow = [1000, 100000, 1000000]
    // var xCircle = 230
    // var xLabel = 380
    // var yCircle = 330
    // var xCircle = vis.width - 50;
    // var xLabel = vis.width;
    // var yCircle = vis.height;
    var xCircle = 40;
    var xLabel = 80;
    var yCircle = vis.height - 100;

    vis.bubbleLegendGroup = vis.legendSvg.append("g")
        .attr("class", "bubble-legend-group");

    vis.legendCircles = vis.bubbleLegendGroup.selectAll(".bubble-legend-circle")
        .data(valuesToShow);

    vis.legendCircles.enter().append("circle")
        .merge(vis.legendCircles)
        .attr("class", "bubble-legend-circle bubble-legend")
        .attr("cx", xCircle)
        .attr("cy", function(d){ return yCircle - vis.radiusScale(d) } )
        .attr("r", function(d){ return vis.radiusScale(d) })
        .style("fill", "none")
        .attr("stroke", "black")
        .attr("opacity", 0.0)

// Add legend: segments
    vis.bubbleLegendLine = vis.bubbleLegendGroup
        .selectAll(".bubble-legend-line")
        .data(valuesToShow);

    vis.bubbleLegendLine.enter()
        .append("line")
        .merge(vis.bubbleLegendLine)
        .attr("class", "bubble-legend-line bubble-legend")
        .attr('x1', function(d){ return xCircle + vis.radiusScale(d) } )
        .attr('x2', xLabel)
        .attr('y1', function(d){ return yCircle - vis.radiusScale(d) } )
        .attr('y2', function(d){ return yCircle - vis.radiusScale(d) } )
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))
        .attr("opacity", 0.0)

// Add legend: labels
    vis.bubbleLegendText = vis.bubbleLegendGroup
        .selectAll(".bubble-legend-text")
        .data(valuesToShow)

    vis.bubbleLegendText.enter()
        .append("text")
        .merge(vis.bubbleLegendText)
        .attr("class", "bubble-legend-text bubble-legend")
        .attr('x', xLabel)
        .attr('y', function(d){ return yCircle - vis.radiusScale(d) } )
        .text( function(d){ return d * 1000 } )
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
        .attr("opacity", 0.0)

    vis.bubbleLegendGroup
        .append("text")
        .attr("class", "bubble-legend-population bubble-legend")
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
        .attr('x', xCircle - 35)
        .attr('y', yCircle + 15)
        .text("Population (2017)")
        .attr("opacity", 0.0)
};