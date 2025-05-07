import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const FacebookLineChart = ({ data, option }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const tooltipRef = useRef();

  const renderLineChart = () => {
    if (!svgRef.current || !containerRef.current || !data) return;

    const processedData = data
      .filter(
        (item) => item[`"${option}"`] !== "0" && item['"Date"'] !== "2009-03"
      )
      .map((item) => {
        const [year, month] = item['"Date"'].split("-").map(Number);
        return {
          date: new Date(year, month - 1), // months are 0-indexed in JS
          value: parseFloat(item[`"${option}"`]),
          dateString: item['"Date"'], // Keep original for display
        };
      })
      .sort((a, b) => a.date - b.date);

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.min(width * 0.4, 400);
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f5f5f5")
      .style("border-radius", "8px");

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d.date))
      .range([0, chartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.value * 1.1)]) // Add 10% padding
      .range([chartHeight, 0]);

    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add clip path
    chartGroup
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y"));
    const yAxis = d3.axisLeft(yScale);

    chartGroup
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    chartGroup.append("g").attr("class", "y-axis").call(yAxis);

    // Add grid lines
    chartGroup
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(""))
      .selectAll("line")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-dasharray", "2,2");

    // Create the line path
    const path = chartGroup
      .append("path")
      .datum(processedData)
      .attr("class", "line")
      .attr("clip-path", "url(#clip)")
      .attr("fill", "none")
      .attr("stroke", "#1877f2") // Facebook blue
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("stroke-dasharray", function () {
        return this.getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      });

    // Animate the line drawing
    path.transition().duration(1500).attr("stroke-dashoffset", 0);

    // Add circles for interaction points
    const circles = chartGroup
      .selectAll(".dot")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 0) // Start invisible
      .attr("fill", "#1877f2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        // Highlight circle
        d3.select(event.currentTarget)
          .attr("r", 8)
          .attr("fill", "#fff")
          .attr("stroke", "#1877f2")
          .attr("stroke-width", 3);

        // Show tooltip
        d3.select(tooltipRef.current)
          .style("opacity", 1)
          .style("visibility", "visible")
          .html(`${d.dateString}<br><strong>${d.value.toFixed(2)}%</strong>`)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY + 10}px`);
      })
      .on("mousemove", (event) => {
        d3.select(tooltipRef.current)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY + 10}px`);
      })
      .on("mouseleave", (event) => {
        // Reset circle
        d3.select(event.currentTarget)
          .attr("r", 5)
          .attr("fill", "#1877f2")
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        // Hide tooltip
        d3.select(tooltipRef.current)
          .style("opacity", 0)
          .style("visibility", "hidden");
      });

    // Animate circles appearing
    circles
      .transition()
      .delay((d, i) => i * 25)
      .duration(500)
      .attr("r", 5);
  };

  useEffect(() => {
    renderLineChart();
    const handleResize = () => renderLineChart();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [data, option]);

  return (
    <div style={{ width: "100%", position: "relative" }} ref={containerRef}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {option} Share Growth (2009)
      </h2>
      <svg
        ref={svgRef}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />

      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          opacity: 0,
          visibility: "hidden",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          pointerEvents: "none",
          zIndex: 100,
          fontSize: "14px",
          maxWidth: "200px",
          transition: "opacity 0.2s",
        }}
      />
    </div>
  );
};

export default FacebookLineChart;
