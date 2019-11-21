
var margin = {top: 10, right: 0, bottom: 10, left: 200};

var width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var area = d3.select("#tree")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var legend = d3.select("#tree-legend")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;

// Define tree
var treemap = d3.tree()
    .size([height, width]);

// Data cleaning
// use other data
d3.csv("data/cleaned_nutrition_data.csv", function(error, csv) {

    alldata = csv;
    value = d3.select("#attribute").property("value");
    // nestdata = d3.nest()
    //     .key(function(d) { return d.region})
    //     .key(function(d) { return d.subregion})
    //     .key(function(d) { return d.country})
    //     .entries(alldata);

    nestdata = d3.nest()
        .key(function(d) { return d.region})
        .key(function(d) { return d.subregion})
        .key(function(d) { return d.country})
        .entries(alldata);

    var malnutritioncounter = 0,
        femalediabetes = 0;

for (let j = 0; j < nestdata.length; j++) {
    for (let k = 0; k < nestdata[j].values.length; k++) {
        for (let l = 0; l < nestdata[j].values[k].values.length; l++) {
            nestdata[j].values[k].values[l].data = nestdata[j].values[k].values[l].values;
            nestdata[j].values[k].values[l].values = null;
            if (nestdata[j].values[k].values[l].data[0].adult_fem_diabetes_track === "On course") {
                femalediabetes++;
            }
        }
        // nestdata[j].values[k].adult_fem_diabetes_track = femalediabetes;
        femalediabetes = 0;

        //     nestdata[j].data.adult_fem_diabetes_track += femalediabetes;
        }
    }

console.log(nestdata);

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

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = d.depth * 180});

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

    // var legendgroup = legend.selectAll('g.legend')
    //     .append("g")
    //     .attr("class", "legend");
    //     // .attr("transform", function() {
    //     //     if (value === "country_class") {
    //
    //         // }
    //
    // if (value === "country_class") {
    //     for (n = 0; n < 4; n++) {
    //         legendgroup.append("circle")
    //             .attr("r", 5)
    //     }
    // }

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
            })


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


