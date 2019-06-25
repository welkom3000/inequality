function drawLine(dataset) {

    let lineW = 600;
    let lineH = 400;

    let marginHere = {
        left: 40,
        right: 20,
        top: 40,
        bottom: 40
    };

    let width = lineW - marginHere.left - marginHere.right;
    let height = lineH - marginHere.top - marginHere.bottom;


    let currentCountry;
    let currentCountryName;



    let percentiles = ["p0p10", "p10p20", "p20p30", "p30p40", "p40p50", "p50p60", "p60p70", "p70p80", "p80p90", "p90p100"];

    drawLine.update = update;

    // Used help from https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0/

    let dataHere = dataset;
    let currentData;

    let svg = d3v5.select("#lineChart").attr("width", lineW).attr("height", lineH);

    // Scale for x.
    let xScale = d3v5.scaleLinear()
        .range([0, width]);

    // Function for x axis.
    let xAxis = g => g
        .attr("transform", "translate(" + marginHere.left + "," + (- marginHere.top + lineH) + ")")
        .call(d3v5.axisBottom(xScale)
            .tickFormat(d3v5.format("d"))
        );
    // Element for x.
    svg.append("g")
        .attr("class", "x-axis")
        .append("text")
        .attr("x", width)
        .attr("y", 32)
        .style("text-anchor", "end")
        .style("fill", "black")
        .text("year");



    // Scale for y.
    let yScale = d3v5.scaleLinear().range([height, 0]);

    // Function for y.
    let yAxis = g => g
        .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
        .call(d3v5.axisLeft(yScale));

    // Element for y label.
    svg.append("g")
        .attr("class", "y-axis")
        .append("text")


        .attr("y", -32)
        .style("text-anchor", "end")

        .attr("transform", "rotate(-90)")
        .style("fill", "black")
        .text("share of income");


    // Define the line for the graph.
    let valueLine = d3v5.line()
        .x(function(d) {
            return xScale(d.Year);
        })
        .y(function(d) {
            // Multiply by 100 for percentages.
            return yScale(100 *d.Value);
        });


    let title = svg.append("text")
        .attr("x",  marginHere.left)
        .attr("y", marginHere.top - 8)
        .attr("class", "title")
        .style("text-anchor", "begin")
        .style("fill", "black");


    // // Draw the legend with help from https://stackoverflow.com/questions/38954316/adding-legends-to-d3-js-line-charts.
    // let legendBoxSize = 10;
    // let legendBoxDistance = 16;
    //
    // let legend_keys = ["Females", "Total", "Males"]
    //
    // let lineLegend = svg.selectAll(".lineLegend").data(legend_keys)
    //     .enter().append("g")
    //     .attr("class", "lineLegend")
    //     .attr("transform", "translate(" + (margin.left + lineW * .8) + "," + (lineH * .8) + ")");
    //
    // lineLegend.append("text").text(d => d)
    //     .attr("class", "legendText")
    //     .attr("x", legendBoxDistance)
    //     .attr("y", function(d, i) {
    //         return i * legendBoxDistance;
    //     });
    //
    // lineLegend.append("rect")
    //     .attr("class", d => d + "Legend")
    //     .attr("width", legendBoxSize).attr("height", legendBoxSize)
    //     .attr("y", function(d, i) {
    //         return i * legendBoxDistance - (legendBoxSize);
    //     });

    let tooltip = d3v5.select("#tooltip");

    let tooltipLine = svg.append('line');


    let tooltipBox = svg.append('rect')
        .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0)
        .on('mousemove', drawTooltip)
        .on('mouseout', removeTooltip);


    function removeTooltip() {

        if (tooltip) tooltip.style('visibility', 'hidden');
        if (tooltipLine) tooltipLine.attr('stroke', 'none');
    }

    function drawTooltip() {

        let year = Math.round(xScale.invert(d3v5.mouse(tooltipBox.node())[0]));


        let yearData = currentData.filter(d => d.Year == year && d.Percentile != "p99p100")


        tooltipLine.attr('stroke', 'black')
            .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
            .attr('x1', xScale(year))
            .attr('x2', xScale(year))
            .attr('y1', 0)
            .attr('y2', height);


        tooltip
            .html(function() {
                let string = "<b>" + year + "</b>";
                for (i = yearData.length - 1; i >= 0; i--){
                    string += "<br>" + i * 10 + " to " + (i + 1) * 10 + " %: " + Math.round(yearData[i].Value * 10000) / 100;
                }
                return string;
            })
            .style("visibility", "visible")
            .style('display', 'block')
            .style('left', d3v5.event.pageX + 20 + "px")
            .style('top', d3v5.event.pageY - 100 + "px")
    }




    function update(country, speed) {


        currentCountry = country;

        let t = d3v5.transition().duration(speed);

        currentData = dataHere.filter(d => d.Variable == "income share" && d.ISO == currentCountry)


        // Multiply by 100 for percentages.
        let maxValue = 100 * d3v5.max(currentData, d => d.Value);

        let scaleFactor = 1.1;
        yScale.domain([0, maxValue * scaleFactor]);



        let yearMax = d3v5.max(currentData, d => d.Year);
        let yearMin = d3v5.min(currentData, d => d.Year);


        xScale.domain([yearMin, yearMax])

        // Lines.
        for (i = 0; i < percentiles.length; i++) {

            let lines = svg.selectAll(".line" + percentiles[i]).data([currentData.filter(d => d.Percentile == percentiles[i])]);

            lines.exit().remove();

            lines.enter().append("path")
                .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
                .attr("class", "line" + percentiles[i])
                .merge(lines)
                .transition(t)
                .attr("d", valueLine);
        }



        svg.selectAll(".y-axis").transition(t).call(yAxis);
        svg.selectAll(".x-axis").transition(t).call(xAxis);



        title.transition(t).text("Income shares over time in " + currentData[0].Country);



        // Dots.
        for (i = 0; i < percentiles.length; i++) {

            let dots = svg.selectAll(".dot" + percentiles[i]).data(currentData.filter(d => d.Percentile == percentiles[i]));

            dots.exit().remove();

            dots.enter().append("circle") // Uses the enter().append() method
                .attr("class", "dot" + percentiles[i]) // Assign a class for styling
                .attr("transform", "translate(" + marginHere.left + "," + marginHere.top + ")")
                .merge(dots)
                .transition(t)
                .attr("cx", function(d) {
                    return xScale(d.Year)
                })
                .attr("cy", function(d) {
                    return yScale(100 * d.Value)
                })
                .attr("r", 1);

        }

        // This makes it so the lines will not prevent the tooltip from being drawn.
        tooltipBox.raise();

    }
}
