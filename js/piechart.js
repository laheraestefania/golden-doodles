//Code help from: https://www.d3-graph-gallery.com/graph/pie_basic.html and our D3 book


PieChart = function(_parentElement, _data, _eventHandler ){
    this.parentElement = _parentElement;
    this.data = _data;
    // this.MyEventHandler = _eventHandler;

    this.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

PieChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 100, right: 0, bottom: 200, left: 100 };

    vis.width = $("#" + vis.parentElement).width();
    vis.height = $("#" + vis.parentElement).height();

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.filteredData = vis.data;

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};

/** Data wrangling */
PieChart.prototype.wrangleData = function(){
    var vis = this;

    var organizedData = [0, 0];

    vis.filteredData.forEach(function(d) {
        // console.log(d);
        if (d.plan == "Yes") {
            organizedData[0] ++;
        } else if (d.plan == "No") {
            organizedData[1] ++;
        }
    });

    vis.displayData = organizedData;

    // Update the visualization
    vis.updateVis();
};


PieChart.prototype.updateVis = function(){
    var vis = this;

    // set the color scale
    vis.color = d3.scaleOrdinal()
        .domain(vis.displayData)
        .range(["#fee0d2", "#fc9272"]);

    //I got help with implementing the legend with https://d3-legend.susielu.com/#color-ordinal

    // svgChart.append("g")
    //     .attr("class", "legendOrdinal")
    //     .attr("transform", "translate(300,260)");
    //
    // var legendOrdinal = d3.legendColor()
    //     .scale(vis.color);
    //
    // svgChart.select(".legendOrdinal")
    //     .call(legendOrdinal);

    // Compute the position of each group on the pie:
    vis.pie = d3.pie()
        .value(function(d) {
            // console.log(d);
            return d
        });

    vis.w = 200;
    vis.h = 200;
    vis.outerRadius = vis.w / 3;
    vis.innerRadius = 0;
    vis.arc = d3.arc()
        .innerRadius(vis.innerRadius)
        .outerRadius(vis.outerRadius);

    vis.pieData = vis.pie(vis.displayData);

    vis.pies = vis.svg.selectAll("path")
        .data(vis.pieData);

    vis.pies
        .enter()
        .append('path')
        .merge(vis.pies)
        .transition()
        .duration(500)
        .attrTween('d', arcTween)
        .attr('fill', function (d, i) {
            return vis.color(i);
        })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1);

        vis.pies.append("text")
        .attr("transform", function(d) {
            return "translate(" + vis.arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .text(function(d, i) {
            // console.log(d);
            if (i == 0) {
                return "Yes";
            } else if (i == 1) {
                return "No";
            }
        });

    vis.pies
        .exit()
        .remove();


    function arcTween(a) {
        const i = d3.interpolate(this._current, a);
        this._current = i(1);
        return (t) => vis.arc(i(t));
    }

    //Set up groups
    // vis.arcs = vis.svg.selectAll("g.arc")
    //     .data(vis.pieData)
    //     .enter()
    //     .append("g")
    //     .attr("class", "arc")
    //     .attr("transform", "translate(" + vis.outerRadius + ", " + vis.outerRadius + ")");
    //
    // //Draw arc paths
    // vis.arcs.append("path")
    //     .merge(vis.arcs)
    //     .transition()
    //     .duration(800)
    //     .attr("fill", function(d, i) {
    //         return vis.color(i);
    //     })
    //     .attr("d", vis.arc);
    //
    //
//     vis.pies.append("text")
//         .attr("transform", function(d) {
//             return "translate(" + vis.pies.centroid(d) + ")";
//         })
//         .attr("text-anchor", "middle")
//         .text(function(d, i) {
//             if (i == 0) {
//                 return "Yes";
//             } else if (i == 1) {
//                 return "No";
//             }
//         });
};

PieChart.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    var vis = this;

    vis.filteredData = vis.data.filter(function(d){
        return (d.Sugar_sweetened_beverages_2016 >= selectionStart && d.Sugar_sweetened_beverages_2016 <= selectionEnd);
    });

    // console.log(vis.filteredData);

    vis.wrangleData();
};


