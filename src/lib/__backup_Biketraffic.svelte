<script>
  import { onMount, onDestroy } from "svelte";
  import * as d3 from "d3";
  import Vizheader from "./Vizheader.svelte";
  export let chartdataUrl = "";
  export let chartHeadline = "";
  export let chartIcon = "";
  export let chartInfoText = "";
  export let chartInfoHeadline = "";
  export let vizcolorDefault = "#C6ADE4";
  export let vizcolorCurrent = "#613399";

  let chartID = "bikechart";

  let headline = " Radfahrer";
  let subline = ", als letztes Jahr zu dieser Zeit.";
  let percentValue = 0;

  let svgWidth, svgHeight, width, height;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const margin = { top: 10, right: 10, bottom: 17, left: 40 };
  let data;
  let timeKey, currentKey, lastyearKey, lastCurrentValue, lastYearValue;

  function handleResize() {
    let svg = d3.select(".viz");
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    svgWidth = svg.node().getBoundingClientRect().width;
    svgHeight = svg.node().getBoundingClientRect().height;
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;
    svg.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

    svg.node().innerHTML = ""; // clean SVG and draw again.
    drawSVG(svg, data, timeKey, currentKey, lastyearKey, lastCurrentValue, lastYearValue);
  }

  function drawSVG(svg, data, timeKey, currentKey, lastyearKey, lastCurrentValue, lastYearValue) {
    // Go to fill the svg

    const tooltip = d3.select(".tooltip").style("opacity", 0);

    svgWidth = svg.node().getBoundingClientRect().width;
    svgHeight = svg.node().getBoundingClientRect().height;
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;
    const viz = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d[timeKey]))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[currentKey])])
      .nice()
      .range([height, 0]);

    // x-axis
    viz
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(9))
      .call((g) => g.selectAll(".tick line").remove())
      .call((g) => g.select(".domain").remove());

    // y-axis
    const yAxis = viz
      .append("g")
      .call(d3.axisLeft(y).ticks(4))
      .call((g) => g.selectAll(".tick line").remove())
      .call((g) => g.select(".domain").remove());

    yAxis.selectAll(".tick text").text((d) => d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));

    // Grid
    viz
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat(""))
      .selectAll(".tick line")
      .attr("stroke", "#e0e0e0");

    // Append the bars to the SVG
    viz
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("fill", (d, i) => (i === data.length - 1 ? vizcolorCurrent : vizcolorDefault))
      .attr("x", (d) => x(d[timeKey]))
      .attr("y", (d) => y(d[currentKey]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d[currentKey]));

    // Add vertical line for mouseover
    const verticalLine = svg
      .append("line")
      .attr("class", "vertical-line")
      .attr("y1", margin.top)
      .attr("y2", svgHeight)
      .attr("stroke", "#e3e3e3")
      .attr("stroke-width", 1)
      .attr("opacity", 0);

    const lineCircle = svg
      .append("circle")
      .attr("class", "circle")
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", "#E3E3E3")
      .attr("stroke-width", 3)
      .attr("opacity", 1);

    //Append invisible big bars for tooltip
    viz
      .append("g")
      .attr("class", "tooltip-area")
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "tooltipbar")
      .attr("fill", "#ffffff")
      .attr("x", (d) => x(d[timeKey]))
      .attr("y", 0)
      .attr("width", x.bandwidth())
      .attr("height", height)
      .attr("style", "opacity:0")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.style("left", event.pageX + "px").style("top", event.pageY + "px");
        tooltip.html(
          `${d[timeKey]}<br/><span style="color:#717171">${d[currentKey]}</span><br/><span style="color:` +
            vizcolorCurrent +
            `">${d[lastyearKey]}</span>`,
        );
        const [mouseX] = d3.pointer(event, this);
        const yvalue = getYValue(mouseX);

        verticalLine
          .attr("x1", mouseX + 20)
          .attr("x2", mouseX + 20)
          .style("pointer-events", "none")
          .attr("opacity", 1);
        lineCircle
          .attr("cx", mouseX + x.bandwidth() / 2 + 5)
          .attr("cy", yvalue + margin.bottom / 2)
          .attr("opacity", 1);
      })
      .on("mousemove touchmove", function (event, d) {
        tooltip.style("left", event.pageX + 30 + "px").style("top", event.pageY + "px");
        const [mouseX] = d3.pointer(event, this);
        const yvalue = getYValue(mouseX);
        verticalLine.attr("x1", mouseX + x.bandwidth() / 2 + 5).attr("x2", mouseX + x.bandwidth() / 2 + 5);
        lineCircle.attr("cx", mouseX + x.bandwidth() / 2 + 5).attr("cy", yvalue + margin.bottom / 2);
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0);
        verticalLine.attr("opacity", 0);
        lineCircle.attr("opacity", 0);
      });

    //Append Linechart with last year values

    const xline = d3
      .scaleBand()
      .domain(data.map((d) => d[timeKey]))
      .range([0, width])
      .padding(0.1);

    const interpolateLine = d3
      .line()
      .x((d) => xline(d[timeKey]))
      .y((d) => y(d[lastyearKey]))
      .curve(d3.curveCardinal);

    const linegraph = viz.append("g").attr("id", "lastyearline");

    linegraph
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "#717171")
      .attr("stroke-width", 1.5)
      .attr("d", interpolateLine);

    // calculate y-Value on Linegraph (for mouseover-circle):

    const getYValue = (mouseX) => {
      const x0 = mouseX;
      const bisect = d3.bisector((d) => x(d[timeKey]) + x.bandwidth() / 2).left;
      const index = bisect(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      if (!d1) return y(d0[lastyearKey]);

      const x1 = x(d0[timeKey]) + x.bandwidth() / 2;
      const x2 = x(d1[timeKey]) + x.bandwidth() / 2;
      const y1 = y(d0[lastyearKey]);
      const y2 = y(d1[lastyearKey]);
      return y1 + (y2 - y1) * ((x0 - x1) / (x2 - x1));
    };
  }

  onMount(() => {
    window.addEventListener("resize", handleResize);

    let svg = d3.select(".viz");
    svgWidth = svg.node().getBoundingClientRect().width;
    svgHeight = svg.node().getBoundingClientRect().height;

    svg.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight); //initial svg size

    // Fetch Data
    fetch(chartdataUrl)
      .then((response) => response.json())
      .then((rawdata) => {
        const headers = rawdata[0][0];
        data = rawdata[0].slice(1).map((row) => {
          let obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });

        // get Object Keys
        timeKey = Object.keys(data[0])[0];
        currentKey = Object.keys(data[0])[2];
        lastyearKey = Object.keys(data[0])[4];
        lastCurrentValue = parseInt(data[data.length - 1][currentKey]);
        lastYearValue = parseInt(data[data.length - 1][lastyearKey]);

        drawSVG(svg, data, timeKey, currentKey, lastyearKey, lastCurrentValue, lastYearValue);

        // Headline and subline with current data
        if (lastCurrentValue < lastYearValue) {
          percentValue = Math.round(((lastYearValue - lastCurrentValue) / lastYearValue) * 100); //Prozentuale Differenz errechnen und runden.
          subline = "Es ist " + percentValue + " % weniger los" + subline;
        } else if (lastCurrentValue > lastYearValue) {
          percentValue = Math.round(((lastCurrentValue - lastYearValue) / lastCurrentValue) * 100); //Prozentuale Differenz errechnen und runden.
          subline = "Es ist " + percentValue + " % mehr los" + subline;
        } else {
          subline = "Es ist genauso viel los wie im letzten Jahr zu dieser Zeit.";
        }
        headline = lastCurrentValue.toLocaleString() + headline;
      })
      .catch((error) => console.error("Fehler beim Abrufen der Daten:", error));
  });
  onDestroy(() => {
    window.removeEventListener("resize", handleResize);
  });
</script>

<Vizheader
  {chartHeadline}
  {chartIcon}
  currentHeadline={headline}
  currentSubline={subline}
  {chartInfoText}
  {chartInfoHeadline}
></Vizheader>
<trafficviz>
  <div class="tooltip"></div>
  <svg class="viz" id={chartID} width="100%" height="105px" color="#8e8e8e"></svg>
</trafficviz>
<credits>Quelle: HessenMobil</credits>
