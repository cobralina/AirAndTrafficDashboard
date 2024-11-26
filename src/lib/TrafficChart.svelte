<script>
  import { onMount, onDestroy } from "svelte";
  import { createEventDispatcher } from "svelte";
  import * as d3 from "d3";
  export let chartdataConfig = {
    chartdataUrl: "",
    chartdataKeys: [0, 1, 2],
    chartdataLegend: "Jahresdurchschnitt",
  };
  export let vizcolorDefault = "#C6ADE4";
  export let vizcolorCurrent = "#613399";
  export let chartID = "defaultchart";

  let currentColor = vizcolorCurrent;

  let tooltipID = chartID + "-tooltip";
  let vizID = chartID + "_viz";
  let svgWidth, svgHeight, width, height;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const margin = { top: 10, right: 10, bottom: 17, left: 40 };
  const dispatch = createEventDispatcher();
  let data;
  let timeKey, currentKey, lastyearKey, lastCurrentValue;

  const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (isDarkMode) {
    currentColor = vizcolorDefault; // lighter color for current values in dark mode.
  }

  function sendData(val, comp) {
    dispatch("dataEvent", { current: val, compare: comp });
  }

  function getLastNonZeroValue(array, key, lastkey) {
    // letzter Wert auslesen und an Parent schicken. Index davon später an SVG-Funktion.
    for (let i = array.length - 1; i >= 0; i--) {
      if (array[i][key] !== 0) {
        sendData(array[i][key], array[i][lastkey]); // for subline in parent
        //return array[i][key];
        return i;
      }
    }
    return null; // Falls kein nicht-Null-Wert gefunden wird
  }

  function convertDecimalToTime(decimal) {
    const minutes = Math.floor(decimal);
    const seconds = Math.round((decimal - minutes) * 60);
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    return `${minutes}:${formattedSeconds}`;
  }

  function handleTrafficResize() {
    let svg = d3.select(`#${chartID}`);
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    svgWidth = svg.node().getBoundingClientRect().width;
    svgHeight = svg.node().getBoundingClientRect().height;
    width = svgWidth - margin.left - margin.right;
    height = svgHeight - margin.top - margin.bottom;
    svg.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

    svg.node().innerHTML = ""; // clean SVG and draw again.
    drawTrafficSVG(svg, data, timeKey, currentKey, lastyearKey, lastCurrentValue);
  }

  function drawTrafficSVG(svg, data, timeKey, currentKey, lastyearKey, lastCurrentValue) {
    const tooltip = d3.select("#" + tooltipID).style("opacity", 0);
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
      .padding(0.4);

    const maxCurrentKey = d3.max(data, (d) => d[currentKey]);
    const maxLastyearKey = d3.max(data, (d) => d[lastyearKey]);
    const maxDomainValue = Math.max(maxCurrentKey, maxLastyearKey);

    const y = d3.scaleLinear().domain([0, maxDomainValue]).nice().range([height, 0]);

    // x-axis
    const dataLength = data.length;

    let xAxis = viz.append("g").attr("transform", "translate(0," + height + ")");
    // Falls 24-Stunden Daten, nur bestimmte Values anzeigen
    if (dataLength >= 10) {
      xAxis.call(d3.axisBottom(x).tickValues([0, 3, 6, 9, 12, 15, 18, 21, 24]));
    } else {
      xAxis.call(d3.axisBottom(x)); // sonst Standard.
    }

    xAxis.call((g) => g.selectAll(".tick line").remove()).call((g) => g.select(".domain").remove());

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
      .attr("fill", (d, i) => {
        const color = i === lastCurrentValue ? vizcolorCurrent : vizcolorDefault;
        return isDarkMode ? (color === vizcolorCurrent ? vizcolorDefault : vizcolorCurrent) : color;
      })
      .attr("x", (d) => x(d[timeKey]))
      .attr("y", (d) => y(d[currentKey]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d[currentKey]));

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
      .attr("y", (d) => y(d[currentKey]))
      .attr("width", x.bandwidth())
      .attr("height", height)
      .attr("style", "opacity:0")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        const divRect = svg.node().getBoundingClientRect();
        const divTop = divRect.top + window.scrollY;
        const divLeft = divRect.left + window.scrollX;
        const relativeY = event.pageY - divTop;
        const relativeX = event.pageX - divLeft;
        tooltip.style("left", relativeX + 55 + "px").style("top", relativeY + 150 + "px");

        let lastYearTime = d[lastyearKey];
        let currentTime = d[currentKey];

        if (d[lastyearKey] < 20) {
          lastYearTime = convertDecimalToTime(d[lastyearKey]) + " Min.";
          currentTime = convertDecimalToTime(d[currentKey]) + " Min.";
        } else {
          lastYearTime = lastYearTime.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          currentTime = currentTime.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
        if (!chartdataConfig.chartdataUrl.includes("bikes")) {
          tooltip.html(
            `${d[timeKey]}:00 Uhr<br/><span class="lastvalue">${lastYearTime}</span><br/><span style="color:` +
              currentColor +
              `">${currentTime}</span>`,
          );
        } else {
          tooltip.html(
            `${d[timeKey]}<br/><span class="lastvalue">${lastYearTime}</span><br/><span style="color:` +
              currentColor +
              `">${currentTime}</span>`,
          );
        }
        const [mouseX] = d3.pointer(event, this);
        const yvalue = getYValue(mouseX - margin.left);

        verticalLine
          .attr("x1", mouseX + 20)
          .attr("x2", mouseX + 20)
          .style("pointer-events", "none")
          .attr("opacity", 1);
        lineCircle
          .attr("cx", mouseX + x.bandwidth() / 2 + 5)
          .attr("cy", yvalue + margin.bottom / 2)
          .attr("opacity", 0.8);
      })
      .on("mousemove touchmove", function (event, d) {
        const [mouseX] = d3.pointer(event, this);
        const yvalue = getYValue(mouseX);
        const divRect = svg.node().getBoundingClientRect();
        const divTop = divRect.top + window.scrollY;
        const divLeft = divRect.left + window.scrollX;
        const relativeY = event.pageY - divTop;
        const relativeX = event.pageX - divLeft;
        tooltip.style("left", relativeX + 55 + "px").style("top", relativeY + 150 + "px");

        verticalLine.attr("x1", mouseX).attr("x2", mouseX);
        lineCircle.attr("cx", mouseX).attr("cy", yvalue + margin.bottom / 2);
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
      .range([0, width + 15])
      .padding(0.4);

    const interpolateLine = d3
      .line()
      .x((d) => xline(d[timeKey]))
      .y((d) => y(d[lastyearKey]))
      .curve(d3.curveStep);
    //.curve(d3.curveBasis);

    const filteredData = data.filter((d) => d[lastyearKey] > 0); // all values >0

    const linegraph = viz.append("g").attr("id", "lastyearline");

    linegraph
      .append("path")
      .datum(filteredData) // only if line has values > 0 (just show the relevant comparing data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "#717171")
      .attr("stroke-width", 1.5)
      .attr("d", interpolateLine);

    // Add vertical line for mouseover
    const verticalLine = viz
      .append("line")
      .attr("class", "vertical-line")
      .attr("y1", 0)
      .attr("y2", svgHeight)
      .attr("stroke", "#e3e3e3")
      .attr("stroke-width", 1)
      .attr("opacity", 0);

    // Add Circle on linegraph for mouseover
    const lineCircle = viz
      .append("circle")
      .attr("class", "circle")
      .attr("r", 5)
      .attr("fill", "#fff")
      .attr("stroke", "#E3E3E3")
      .attr("stroke-width", 3)
      .attr("opacity", 0)
      .attr("transform", `translate(0,-${margin.top})`);

    // calculate y-Value on Linegraph (for mouseover-circle):

    const getYValue = (mouseX) => {
      const x0 = mouseX;
      const bisect = d3.bisector((d) => x(d[timeKey]) + x.bandwidth() / 2).left;
      const index = bisect(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      if (!d1) return y(d0[lastyearKey]);

      const x1 = x(d0[timeKey]); //+ x.bandwidth() / 2;
      const x2 = x(d1[timeKey]); //+ x.bandwidth() / 2;
      const y1 = y(d0[lastyearKey]);
      const y2 = y(d1[lastyearKey]);
      return y1 + (y2 - y1) * ((x0 - x1) / (x2 - x1));
    };
  }

  onMount(() => {
    window.addEventListener("resize", handleTrafficResize);

    let svg = d3.select("#" + chartID);
    svgWidth = svg.node().getBoundingClientRect().width;
    svgHeight = svg.node().getBoundingClientRect().height;

    svg.attr("viewBox", "0 0 " + svgWidth + " " + svgHeight); //initial svg size

    // Fetch Data
    fetch(chartdataConfig.chartdataUrl)
      .then((response) => response.json())
      .then((rawdata) => {
        const headers = rawdata[0][0];
        let counter = 0;

        data = rawdata[0].slice(1).map((row) => {
          let obj = {};
          headers.forEach((header, i) => {
            // First value will be counter so we have indices
            if (i === 0 && !chartdataConfig.chartdataUrl.includes("bikes")) {
              obj[header] = counter++;
            } else {
              obj[header] = row[i];
            }
          });
          return obj;
        });

        if (counter <= 24 && !chartdataConfig.chartdataUrl.includes("bikes")) {
          //falls letzter Eintrag wegen 0:00 24:00 Doppelung fehlt
          let newObj = {};
          headers.forEach((header, i) => {
            if (i === 0) {
              newObj[header] = 24;
            } else {
              newObj[header] = 0;
            }
          });
          data.push(newObj);
        }

        // get Object Keys
        timeKey = Object.keys(data[0])[chartdataConfig.chartdataKeys[0]];
        currentKey = Object.keys(data[0])[chartdataConfig.chartdataKeys[1]];
        lastyearKey = Object.keys(data[0])[chartdataConfig.chartdataKeys[2]];
        lastCurrentValue = getLastNonZeroValue(data, currentKey, lastyearKey);
        drawTrafficSVG(svg, data, timeKey, currentKey, lastyearKey, lastCurrentValue);
      })
      .catch((error) => console.error("Fehler beim Abrufen der Daten:", error));
  });
  onDestroy(() => {
    window.removeEventListener("resize", handleTrafficResize);
  });
</script>

<trafficviz id={vizID}>
  <div class="tooltip" id={tooltipID}></div>
  <div class="label">
    <div class="lbl-current" style="background-color:{currentColor}"></div>
    <credits>Aktueller Wert</credits>
    <div class="lbl-last"></div>
    <credits>{chartdataConfig.chartdataLegend}</credits>
  </div>
  <svg class="viz" id={chartID} width="100%" height="105px" color="#8e8e8e"></svg>
</trafficviz>

<style>
  :global([id="{vizID}"]) {
    position: relative;
  }
</style>
