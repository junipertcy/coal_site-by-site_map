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

    let conc_unit = "濃度 (ppb)";
    if (state._pollutant === "pm25") {
        conc_unit = "濃度 (μg/m³)";
    }
    let legendSequential = d3.legendColor()
        .shapeWidth(30)
        .cells(4)
        .orient("vertical")
        .scale(sequentialScale)
        .title(conc_unit);

    svg.select(".legendSequential")
        .call(legendSequential);
    svg.style('right', '1vw');
}