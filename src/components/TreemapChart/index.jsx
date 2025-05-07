import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const SocialMediaTreemap = ({
  data,
  setSelectedPlatform,
  selectedPlatform,
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const tooltipRef = useRef();

  const renderTreemap = () => {
    if (!svgRef.current || !containerRef.current || !data) return;

    // Filter and sort data - ensure values are numbers
    const filteredData = Object.entries(data)
      .filter(([key, value]) => key !== "Date" && !isNaN(parseFloat(value)))
      .map(([name, value]) => ({
        name: name.replace(/"/g, ""),
        value: parseFloat(value),
      }))
      .filter(({ value }) => value > 0)
      .sort((a, b) => b.value - a.value);

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.min(width * 0.4, 400);

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create treemap layout
    const treemap = d3.treemap().size([width, height]).padding(1).round(true);

    // Prepare hierarchy
    const root = d3
      .hierarchy({ children: filteredData })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    treemap(root);

    // Color scale
    const color = d3
      .scaleOrdinal()
      .domain(filteredData.map((d) => d.name))
      .range(d3.schemeTableau10);

    // Create cells
    const cell = svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .on("click", (event, d) => {
        setSelectedPlatform(d.data.name);
      })
      .on("mouseover", (event, d) => {
        d3.select(tooltipRef.current)
          .style("opacity", 1)
          .style("visibility", "visible")
          .html(`${d.data.name}<br>${d.data.value.toFixed(2)}%`)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY + 10}px`);
      })
      .on("mousemove", (event) => {
        d3.select(tooltipRef.current)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY + 10}px`);
      })
      .on("mouseleave", () => {
        d3.select(tooltipRef.current)
          .style("opacity", 0)
          .style("visibility", "hidden");
      });

    // Add rectangles
    cell
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) =>
        selectedPlatform === d.data.name
          ? d3.color(color(d.data.name)).brighter(0.5)
          : color(d.data.name)
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);

    // Add labels only to larger rectangles
    cell.each(function (d) {
      const width = d.x1 - d.x0;
      const height = d.y1 - d.y0;
      const area = width * height;

      if (area > 1500) {
        const g = d3.select(this);
        const fontSize = Math.min(width / 10, height / 5);

        g.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", `${fontSize}px`)
          .attr("fill", "#fff")
          .text(d.data.name);

        g.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2 + fontSize)
          .attr("text-anchor", "middle")
          .attr("font-size", `${fontSize * 0.8}px`)
          .attr("fill", "#fff")
          .text(`${d.data.value.toFixed(2)}%`);
      }
    });
  };

  useEffect(() => {
    renderTreemap();
    const handleResize = () => renderTreemap();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [data, selectedPlatform]); // Add data to dependency array

  return (
    <div style={{ width: "100%", position: "relative" }} ref={containerRef}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {"Social Media Platform Shares"}
      </h2>
      <svg
        ref={svgRef}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
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

export default SocialMediaTreemap;
