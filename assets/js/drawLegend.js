function drawLegend(max) {
    d3.selectAll('svg').remove();
    d3.select('#mapControls').append('svg');
    let sequentialScale = d3.scaleSequential(d3.interpolateLab("#ec7014", "#662506"))
        .domain([0, max]);

    let svg = d3.select("svg")
        .style("background", "white")
        .style("opacity", 0.9)
        .style("border-radius", "10px")
        .style("border", "2px solid #999999");

    svg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(10,15)");

    let legendSequential = d3.legendColor()
        .shapeWidth(30)
        .cells(4)
        .orient("vertical")
        .scale(sequentialScale)
        .title("濃度 (ppb)");

    svg.select(".legendSequential")
        .call(legendSequential);
    svg.style('right', '1vw');
}