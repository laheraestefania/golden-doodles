// https://bl.ocks.org/Thanaporn-sk/c7f74cb5051a0cdf6cf077a9db332dfb

const regionNumbers = {
    "Africa": 0,
    "Asia": 1,
    "Europe": 2,
    "Latin America and the Caribbean": 3,
    "N. America": 4,
    "Oceania": 5
};

const subRegionNumbers = {
    "Australia and New Zealand": 0,
    "Caribbean" : 1,
    "Central America": 2,
    "Central Asia": 3,
    "Eastern Africa" : 4,
    "Eastern Asia": 5,
    "Eastern Europe": 6,
    "Melanesia": 7,
    "Micronesia": 8,
    "Middle Africa": 9,
    "Northern Africa": 10,
    "Northern America": 11,
    "Northern Europe": 12,
    "Polynesia": 13,
    "South America": 14,
    "South-eastern Asia": 15,
    "Southern Africa": 16,
    "Southern Asia": 17,
    "Southern Europe": 18,
    "Western Africa": 19,
    "Western Asia": 20,
    "Western Europe": 21
};

const numRegions = 6, numSubRegions = 22;

const numbering = {
    "region": {"num": numRegions, "labels": regionNumbers},
    "subregion": {"num": numSubRegions, "labels": subRegionNumbers},
}

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


Bubble = function(_parentElement, _data, feature){
    this.parentElement = _parentElement;
    this.data = _data;
    // this.displayData = []; // see data wrangling
    this.feature = feature;

    this.margin = {top: 50, right: 50, bottom: 50, left: 50};

    this.width = 550 - this.margin.left - this.margin.right,
        this.height = 550 - this.margin.top - this.margin.bottom;


    this.padding = 1.5; // separation between same-color circles
    this.clusterPadding = 30; // separation between different-color circles
    this.maxRadius = 40;
    console.log("max rad " + this.maxRadius);

    // total number of nodes
    this.n = this.data.length;

    // default cluster by region
    this.clusterCat = "region";

    // total number of clusters - default is by region
    this.m = numbering[this.clusterCat]["num"];
    this.color = d3.scaleSequential(d3.interpolateBlues);
    this.clusters = new Array(this.m);


    this.radiusScale = d3.scaleSqrt()
        .domain(d3.extent(Object.values(this.data), function(d) { return +d["population_2017"];} ))
        .range([2, this.maxRadius]);

    this.initVis();
};


Bubble.prototype.initVis = function() {
    var vis = this;
    // SVG drawing area
    vis.parentElt = d3.select("#" + vis.parentElement);
    vis.svg = vis.parentElt.append("svg")
        .attr("class", "bubble-svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.width* 4/7 + "," + vis.height/2 + ")");

    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-2, 0])
        .html(function(d) {
            return constructHtmlText(d);
        });

    vis.svg.call(vis.tool_tip);

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

    vis.color.domain([
        0,
        d3.max(vis.nodes, function (d) {
            return +d["feature"]
        })
    ]);

    vis.legend = vis.parentElt.select("svg").append("g")
        .attr("class", "legendSize")
        .attr("transform", "translate("+ 50 + ", 50)");

    vis.addLegend()

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
    let simulation = d3.forceSimulation(vis.nodes)
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
        if (!d3.event.active) simulation.alphaTarget(0.6).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
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
};

Bubble.prototype.wrangleData = function() {
    var vis = this;
    vis.nodes.forEach(function (node) {
        node.cluster = numbering[vis.clusterCat]["labels"][node[vis.clusterCat]]
        if (!vis.clusters[node.cluster] || (node.r > vis.clusters[node.cluster].r)) {
            vis.clusters[node.cluster] = node;
        }
    })

    vis.updateVis();
};

Bubble.prototype.updateVis = function() {
    var vis = this;

    // append the circles to svg then style
    // add functions for interaction

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
    let simulation = d3.forceSimulation(vis.nodes)
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
        if (!d3.event.active) simulation.alphaTarget(0.6).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
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
};

// Source: https://www.d3-graph-gallery.com/graph/bubble_legend.html
Bubble.prototype.addLegend = function () {
    var vis = this;
// Add legend: circles
    var valuesToShow = [1000, 100000, 1000000]
    // var xCircle = 230
    // var xLabel = 380
    // var yCircle = 330
    var xCircle = vis.width - 5
    var xLabel = vis.width + 35
    var yCircle = vis.height + 70 // - vis.margin.bottom

    vis.parentElt.select("svg")
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("circle")
        .attr("cx", xCircle)
        .attr("cy", function(d){ return yCircle - vis.radiusScale(d) } )
        .attr("r", function(d){ return vis.radiusScale(d) })
        .style("fill", "none")
        .attr("stroke", "black")

// Add legend: segments
    vis.parentElt.select("svg")
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("line")
        .attr('x1', function(d){ return xCircle + vis.radiusScale(d) } )
        .attr('x2', xLabel)
        .attr('y1', function(d){ return yCircle - vis.radiusScale(d) } )
        .attr('y2', function(d){ return yCircle - vis.radiusScale(d) } )
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

// Add legend: labels
    vis.parentElt.select("svg")
        .selectAll("legend")
        .data(valuesToShow)
        .enter()
        .append("text")
        .attr('x', xLabel)
        .attr('y', function(d){ return yCircle - vis.radiusScale(d) } )
        .text( function(d){ return d * 1000 } )
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')

    vis.parentElt.select("svg")
        .append("text")
        .style("font-size", 10)
        .attr('alignment-baseline', 'middle')
        .attr('x', xCircle - 35)
        .attr('y', yCircle + 15)
        .text("Population (2017)")
};
