
var margin = {top: 10, right: 20, bottom: 10, left: 50};

var width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var area = d3.select("#tree")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var legendlabels = [];

var i = 0,
    duration = 750,
    root;

// Define tree
var treemap = d3.tree()
    .size([height, width/2]);

// Data cleaning

queue()
    .defer(d3.csv, "data/cleaned_nutrition_data.csv")
    .defer(d3.csv, "data/subregional_data.csv")
    .await(function(error, csv, subregional) {

    alldata = csv;
    value = d3.select("#attribute").property("value");

    console.log(subregional[1][value]);

    if (value === "country_class") {
        legendlabels[0] = "experiencing one form of malnutrition";
        legendlabels[1] = "experiencing two forms of malnutrition";
        legendlabels[2] = "experiencing three forms of malnutrition";
        legendlabels[3] = "No data";
    } else {
        legendlabels[0] = "On course";
        legendlabels[1] = "No progress or worsening";
        legendlabels[2] = "No data";
    }

    nestdata = d3.nest()
        .key(function(d) { return d.region})
        .key(function(d) { return d.subregion})
        .key(function(d) { return d.country})
        .entries(alldata);

for (let j = 0; j < nestdata.length; j++) {
    for (let k = 0; k < nestdata[j].values.length; k++) {
        for (let l = 0; l < nestdata[j].values[k].values.length; l++) {
            nestdata[j].values[k].values[l].data = nestdata[j].values[k].values[l].values;
            nestdata[j].values[k].values[l].values = null;
            }
        }
}

    var root = d3.hierarchy({values: nestdata}, function(d) {return d.values;});

    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after second level
    root.children.forEach(collapse);

    root.parent = "World";

    update(root);

// Define function collapse
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null
        }
    }

// Define function update (template & inspiration from https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd)
    function update(source) {
        // Assigns the x and y position for the nodes
        var treeData = treemap(root);

        console.log(treeData);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 3 / 4 * 180});

        // Update the nodes...
        var node = area.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 7)
            .style("fill", function(d) {
                return d._children ? "#ccc" : "#fff";
            });

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                if(d.id === 1) {
                    return d.parent;
                } else {
                    return d.data.key;
                }
            });

        // UPDATE
        nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 7)
            .style("fill", function(d, i) {
                if (d.children) {
                    return "#fff";
                } else if (d.height === 0) {
                    switch(d.data.data[0][value]) {
                        case "experiencing one form of malnutrition": return "yellow";
                        case "experiencing two forms of malnutrition": return "orange";
                        case "experiencing three forms of malnutrition": return "red";
                        case "On course" :
                            return "#00ff00";
                        case "No progress or worsening":
                            return "#ff0000";
                        case "No data" :
                            return "#ccc";
                        case "No Data" : return "#ccc";
                        case "": return "#ccc";
                    }
                } else if (d.height === 1) {
                    switch(subregional[i][value]) {
                        case "experiencing one form of malnutrition": return "yellow";
                        case "experiencing two forms of malnutrition": return "orange";
                        case "experiencing three forms of malnutrition": return "red";
                        case "On course" :
                            return "#00ff00";
                        case "No progress or worsening":
                            return "#ff0000";
                        case "No data" :
                            return "#ccc";
                        case "No Data" : return "#ccc";
                        case "": return "#ccc";
                    }
                }
                 else {
                    return "#000";
                }
            })
            .attr('cursor', 'pointer');

        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
            .attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // Update the links
        var link = area.selectAll('path.link')
            .data(links, function(d) { return d.id; });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });

        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal(o, o)
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });

        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {

            pathline = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

            return pathline
        }

        // Toggle children on click.
        function click(d) {
                // if clicked node has children, collapse
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                // if not, extend
                d.children = d._children;
                if (d.height === 0) {
                    console.log(d.data.data[0][value]);
                }
                d._children = null;
            }
            update(d);
        }
    }

    legend = new treelegend("tree-legend", legendlabels);

    d3.select("#attribute").on("change", function() {
        value = d3.select("#attribute").property("value");
        // update(root);
        nodeUpdate.select('circle.node')
            .attr('r', 7)
            .style("fill", function(d) {
                if (d.children) {
                    return "#fff";
                } else if (d.height === 0) {
                    switch(d.data.data[0][value]) {
                        case "experiencing one form of malnutrition": return "yellow";
                        case "experiencing two forms of malnutrition": return "orange";
                        case "experiencing three forms of malnutrition": return "red";
                        case "On course" :
                            return "#00ff00";
                        case "No progress or worsening":
                            return "#ff0000";
                        case "No data" :
                            return "#ccc";
                        case "No Data" : return "#ccc";
                        case "": return "#ccc";
                    }
                } else {
                    return "#000";
                }
            });

        if (value === "country_class") {
            legendlabels[0] = "experiencing one form of malnutrition";
            legendlabels[1] = "experiencing two forms of malnutrition";
            legendlabels[2] = "experiencing three forms of malnutrition";
            legendlabels[3] = "No data";
        } else {
            legendlabels[0] = "On course";
            legendlabels[1] = "No progress or worsening";
            legendlabels[2] = "No data";
            legendlabels[3] = null;
        };

        legend.updateVis();

    });

    // function nodestyle(d) {
    //         switch(d.data.data[0][value]) {
    //             case "experiencing one form of malnutrition": return "yellow";
    //             case "experiencing two forms of malnutrition": return "orange";
    //             case "experiencing three forms of malnutrition": return "red";
    //             case "On course" :
    //                 return "#00ff00";
    //             case "No progress or worsening":
    //                 return "#ff0000";
    //             case "No data" :
    //                 return "#ccc";
    //             case "No Data" : return "#ccc";
    //             case "": return "#ccc";
    //         }
    // }

});

//TREE LEGEND

treelegend = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};

treelegend.prototype.initVis = function() {
    var vis = this;

    vis.legend = d3.select("#" + vis.parentElement)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 100)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    vis.wrangleData();
};

treelegend.prototype.wrangleData = function() {
    //
    var vis = this;

    vis.updateVis();
};

treelegend.prototype.updateVis = function() {
    var vis = this;

    var legendcircle = vis.legend.selectAll(".legendcircle")
        .data(this.data);

    legendcircle.enter().append("circle")
        .attr("class", "legendcircle")
        .merge(legendcircle)
        .attr("cx", 10)
        .attr("cy", function(d, i) {
            return i * 15;
        })
        .attr("r", 5)
        .attr("fill", function(d) {
            switch(d) {
                case "experiencing one form of malnutrition": return "yellow";
                case "experiencing two forms of malnutrition": return "orange";
                case "experiencing three forms of malnutrition": return "red";
                case "On course" :
                    return "#00ff00";
                case "No progress or worsening":
                    return "#ff0000";
                case "No data" :
                    return "#ccc";
                case null :
                    return "#fff";
            }
        });

    var legendlabels = vis.legend.selectAll(".legendlabels")
        .data(this.data);

    legendlabels.enter().append("text")
        .attr("class", "legendlabels")
        .merge(legendlabels)
        .attr("x", 20)
        .attr("y", function(d, i) {
            return (i * 15) + 3;
        })
        .text(function(d) {
            return d;
        })
        .attr("font-size", 8);

    legendcircle.exit().remove();
};

