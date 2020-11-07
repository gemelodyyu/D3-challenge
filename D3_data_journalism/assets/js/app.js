// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;
  
    var margin = {
      top: 50,
      bottom: 50,
      right: 50,
      left: 50
    };
  
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
  
    // Append SVG element
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth);
  
    // Append group element
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale and y-scale var upon click on axis label
    function xScale(newsData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
        .domain([d3.min(newsData, d => d[chosenXAxis]),
            d3.max(newsData, d => d[chosenXAxis])
        ])
        .range([0, width]);
    
        return xLinearScale;
    };

    function yScale(newsData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
        .domain([d3.min(newsData, d => d[chosenYAxis]),
            d3.max(newsData, d => d[chosenYAxis])
        ])
        .range([0, width]);
    
        return yLinearScale;
    };

    // function used for updating xAxis yAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
        return xAxis;
    };

    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
    
        yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
        return yAxis;
    };

    // function used for updating circles group with a transition to
    // new circles
    function renderXCircles(circlesXGroup, newXScale, chosenXAxis) {

        circlesXGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
        return circlesXGroup;
    }; 

    function renderYCircles(circlesYGroup, newYScale, chosenYAxis) {

        circlesYGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
        return circlesYGroup;
    };   


    // function used for updating text location
    function renderXText(circlesXGroup, newXScale, chosenXAxis) {

        circlesXGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
    
        return circlesXGroup;
    }; 
    function renderYText(circlesYGroup, newYScale, chosenYAxis) {

        circlesYGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis])+5)
    
        return circlesYGroup;
    };

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        var xlabel;
        var ylabel
    
        if (chosenXAxis === "poverty") {
        xlabel = "Poverty:";
        }
        else if (chosenXAxis === "age") {
        xlabel = "Age:";
        }
        else {
        xlabel = "Household income:";
        }; 

        if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare:";
        }
        else if (chosenYAxis === "Obesity") {
        ylabel = "Obesity:";
        }
        else {
        ylabel = "Smokes:";
        };         
    
        var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}`);
        });
    
        circlesGroup.call(toolTip);
    
        circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    
        return circlesGroup;
    };
  
    // Read CSV
    d3.csv("assets/data/data.csv").then(function(newsData, err) {
        if (err) throw err; 
        // parse data
        newsData.forEach(function(data) {
          data.poverty = +data.poverty;
          data.povertyMoe = +data.povertyMoe;
          data.age = +data.age;
          data.ageMoe = +data.ageMoe;
          data.income = +data.income;
          data.incomeMoe = +data.incomeMoe;
          data.healthcare = +data.healthcare;
          data.healthcareLow = +data.healthcareLow;
          data.healthcareHigh = +data.healthcareHigh;
          data.obesity = +data.obesity;
          data.obesityLow = +data.obesityLow;
          data.obesityHigh = +data.obesityHigh;
          data.smokes = +data.smokes;
          data.smokesLow = +data.smokesLow;
          data.smokesHigh = +data.smokesHigh;
        });
  
        // xLinearScale function above csv import
        var xLinearScale = xScale(newsData, chosenXAxis);
        var yLinearScale = yScale(newsData, chosenYAxis);
  
        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        
        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
        .data(newsData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("class", "stateCircle");
        // append text inside circles
        var circlesText = circlesGroup.append("text")
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis])+5) //to center the text in the circles
        .classed("stateText", true);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var PovertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var AgeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var IncomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    
    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

    var HealthLabel = ylabelsGroup.append("text")
      .attr("y", -40)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var ObeseLabel = ylabelsGroup.append("text")
      .attr("y", -80)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");
  
    var SmokesLabel = ylabelsGroup.append("text")
      .attr("y", -60)
      .attr("x", -(height/2))
      .attr("dy", "1em")
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(newsData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes xAxis classes to change bold text
                if (chosenXAxis === "poverty") {
                    PovertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    AgeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    IncomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
                else {
                    PovertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    AgeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                    IncomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                };

            }

        });

        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
                    // replaces chosenYAxis with value
                    chosenYAxis = value;

                    // functions here found above csv import
                    // updates y scale for new data
                    yLinearScale = yScale(newsData, chosenYAxis);

                    // updates x axis with transition
                    yAxis = renderAxes(yLinearScale, yAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                    // changes yAxis classes to change bold text
                    if (chosenYAxis === "poverty") {
                        HealthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                        ObeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        SmokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                    else if (chosenXAxis === "age") {
                        HealthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        ObeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                        SmokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    }
                    else {
                        HealthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        ObeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                        SmokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    }
                }
            });

      }).catch(function(error) {
        console.log(error);
      });
  }
  
  // When the browser loads, makeResponsive() is called.
  makeResponsive();
  
  // When the browser window is resized, makeResponsive() is called.
  d3.select(window).on("resize", makeResponsive);
  
  