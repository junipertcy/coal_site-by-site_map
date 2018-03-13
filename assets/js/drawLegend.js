function drawLegend(max) {
    d3.selectAll('svg').remove();
    d3.select('#panel').append('svg');
    let sequentialScale = d3.scaleSequential(d3.interpolateLab("#ec7014", "#662506"))
        .domain([0, max]);

    let svg = d3.select("svg")
        .style("background", "white")
        .style("opacity", 0.9)
        .style("border-radius", "25px")
        .style("border", "2px solid #73AD21");

    svg.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(20,20)");

    let legendSequential = d3.legendColor()
        .shapeWidth(30)
        .cells(4)
        .orient("vertical")
        .scale(sequentialScale)
        .title("濃度 (ppm)");

    svg.select(".legendSequential")
        .call(legendSequential);
    svg.style('left', '10px');
}