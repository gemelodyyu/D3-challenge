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
    d3.csv("assets/data/data.csv").then(function(newsData) {
  
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
  
        // create scales
        var xScale = d3.scaleLinear()
          .domain(d3.extent(medalData, d => d.date))
          .range([0, width]);
  
        var yScale = d3.scaleLinear()
          .domain([0, d3.max(medalData, d => d.medals)])
          .range([height, 0]);
  
        // create axes
        var xAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%d-%b"));
        var yAxis = d3.axisLeft(yLinearScale).ticks(6);
  
        // append axes
        chartGroup.append("g")
          .attr("transform", `translate(0, ${height})`)
          .call(xAxis);
  
        chartGroup.append("g")
          .call(yAxis);
  
        // line generator
        var line = d3.line()
          .x(d => xTimeScale(d.date))
          .y(d => yLinearScale(d.medals));
  
        // append line
        chartGroup.append("path")
          .data([medalData])
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", "red");
  
        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
          .data(medalData)
          .enter()
          .append("circle")
          .attr("cx", d => xTimeScale(d.date))
          .attr("cy", d => yLinearScale(d.medals))
          .attr("r", "10")
          .attr("fill", "gold")
          .attr("stroke-width", "1")
          .attr("stroke", "black");
  
        // Date formatter to display dates nicely
        var dateFormatter = d3.timeFormat("%d-%b");
  
        // Step 1: Initialize Tooltip
        var toolTip = d3.tip()
          .attr("class", "tooltip")
          .offset([80, -60])
          .html(function(d) {
            return (`<strong>${dateFormatter(d.date)}<strong><hr>${d.medals}
            medal(s) won`);
          });
  
        // Step 2: Create the tooltip in chartGroup.
        chartGroup.call(toolTip);
  
        // Step 3: Create "mouseover" event listener to display tooltip
        circlesGroup.on("mouseover", function(d) {
          toolTip.show(d, this);
        })
        // Step 4: Create "mouseout" event listener to hide tooltip
          .on("mouseout", function(d) {
            toolTip.hide(d);
          });
      }).catch(function(error) {
        console.log(error);
      });
  }
  
  // When the browser loads, makeResponsive() is called.
  makeResponsive();
  
  // When the browser window is resized, makeResponsive() is called.
  d3.select(window).on("resize", makeResponsive);
  