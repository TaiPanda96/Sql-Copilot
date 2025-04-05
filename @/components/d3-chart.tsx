"use client"

import { useEffect, useRef, useState, useLayoutEffect } from "react"
import * as d3 from "d3"
import type { ChartConfig } from "@/types/chart"

interface D3ChartProps {
  config: ChartConfig
}

export function D3Chart({ config }: D3ChartProps) {
  const chartRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isReady, setIsReady] = useState(false)

  // Use ResizeObserver to accurately track container dimensions
  useEffect(() => {
    if (!containerRef.current) return

    // Function to measure container
    const measureContainer = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        if (width > 0 && height > 0) {
          setDimensions({ width, height })
        }
      }
    }

    // Measure immediately
    measureContainer()

    // Set up ResizeObserver for continuous monitoring
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          const { width, height } = entry.contentRect
          if (width > 0 && height > 0) {
            setDimensions({ width, height })
          }
        }
      }
    })

    resizeObserver.observe(containerRef.current)

    // Force multiple measurement attempts to ensure dimensions are captured
    const immediateTimer = setTimeout(measureContainer, 0)
    const shortTimer = setTimeout(measureContainer, 50)
    const mediumTimer = setTimeout(() => {
      measureContainer()
      setIsReady(true)
    }, 200)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(immediateTimer)
      clearTimeout(shortTimer)
      clearTimeout(mediumTimer)
    }
  }, [])

  // Force a re-render after component mount
  useLayoutEffect(() => {
    // This will trigger after the DOM has been updated but before the browser paints
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      if (width > 0 && height > 0 && (width !== dimensions.width || height !== dimensions.height)) {
        setDimensions({ width, height })
      }
    }
  }, [dimensions.width, dimensions.height])

  // Render chart when dimensions or config changes
  useEffect(() => {
    if (!chartRef.current || dimensions.width === 0 || dimensions.height === 0) return

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove()

    // Create chart with explicit dimensions
    renderChart(chartRef.current, dimensions.width, dimensions.height, config)

    // Clean up
    return () => {
      d3.select("body").selectAll(".chart-tooltip").remove()
    }
  }, [dimensions, config, isReady])

  // Main chart rendering function
  const renderChart = (svgElement: SVGSVGElement, width: number, height: number, config: ChartConfig) => {
    const svg = d3.select(svgElement)
    const margin = { top: 40, right: 30, bottom: 50, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Set explicit width and height on SVG
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`)

    // Create white background
    svg.append("rect").attr("width", width).attr("height", height).attr("fill", "white")

    // Create chart group with margin
    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(config.title)

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "chart-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #d4d0c8")
      .style("padding", "8px")
      .style("border-radius", "2px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "1000")
      .style("box-shadow", "2px 2px 4px rgba(0,0,0,0.2)")

    // Render appropriate chart type
    const chartType = config.type || "bar"

    if (chartType === "bar") {
      renderBarChart(chart, config, chartWidth, chartHeight, tooltip)
    } else if (chartType === "line") {
      renderLineChart(chart, config, chartWidth, chartHeight, tooltip)
    } else if (chartType === "pie") {
      renderPieChart(chart, config, chartWidth, chartHeight, tooltip)
    } else if (chartType === "scatter") {
      renderScatterChart(chart, config, chartWidth, chartHeight, tooltip)
    } else {
      renderBarChart(chart, config, chartWidth, chartHeight, tooltip)
    }

    // Add X axis label
    if (config.xAxisLabel) {
      chart
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 35)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(config.xAxisLabel)
    }

    // Add Y axis label
    if (config.yAxisLabel) {
      chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(config.yAxisLabel)
    }
  }

  const renderBarChart = (
    chart: d3.Selection<SVGGElement, unknown, null, undefined>,
    config: ChartConfig,
    width: number,
    height: number,
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  ) => {
    const { labels, datasets } = config.data
    const data = labels.map((label, i) => ({
      label,
      value: datasets[0].data[i],
    }))

    const x = d3.scaleBand().domain(labels).range([0, width]).padding(0.2)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(datasets[0].data) || 0])
      .nice()
      .range([height, 0])

    // Add X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px")

    // Add Y axis
    chart.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "10px")

    // Add bars with hover effects
    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.label) || 0)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", "#5b9bd5")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("fill", "#4a8bc6")

        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.label}</strong><br>${d.value}k`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("fill", "#5b9bd5")

        tooltip.style("opacity", 0)
      })
  }

  const renderLineChart = (
    chart: d3.Selection<SVGGElement, unknown, null, undefined>,
    config: ChartConfig,
    width: number,
    height: number,
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  ) => {
    const { labels, datasets } = config.data
    const data = labels.map((label, i) => ({
      label,
      value: datasets[0].data[i],
    }))

    const x = d3.scalePoint().domain(labels).range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(datasets[0].data) || 0])
      .nice()
      .range([height, 0])

    // Add X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px")

    // Add Y axis
    chart.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "10px")

    // Add line
    const line = d3
      .line<{ label: string; value: number }>()
      .x((d) => x(d.label) || 0)
      .y((d) => y(d.value))

    chart
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#5b9bd5")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Add dots with hover effects
    chart
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.label) || 0)
      .attr("cy", (d) => y(d.value))
      .attr("r", 4)
      .attr("fill", "#5b9bd5")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 6).attr("fill", "#4a8bc6")

        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.label}</strong><br>${d.value}k`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 4).attr("fill", "#5b9bd5")

        tooltip.style("opacity", 0)
      })
  }

  const renderPieChart = (
    chart: d3.Selection<SVGGElement, unknown, null, undefined>,
    config: ChartConfig,
    width: number,
    height: number,
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  ) => {
    const { labels, datasets } = config.data
    const data = labels.map((label, i) => ({
      label,
      value: datasets[0].data[i],
    }))

    const radius = Math.min(width, height) / 2
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(labels)
      .range(["#5b9bd5", "#ed7d31", "#70ad47", "#ffc000", "#4bacc6", "#8064a2"])

    const pie = d3.pie<{ label: string; value: number }>().value((d) => d.value)
    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>().innerRadius(0).outerRadius(radius)

    const pieData = pie(data)

    // Move chart to center
    chart.attr("transform", `translate(${width / 2},${height / 2})`)

    // Add slices with hover effects
    chart
      .selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.label) as string)
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("opacity", 0.8).attr("transform", "scale(1.03)")

        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.data.label}</strong><br>${d.data.value}k (${((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1)}%)`,
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("opacity", 1).attr("transform", "scale(1)")

        tooltip.style("opacity", 0)
      })

    // Add labels
    chart
      .selectAll("text")
      .data(pieData)
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const centroid = arc.centroid(d)
        return `translate(${centroid[0] * 1.2},${centroid[1] * 1.2})`
      })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .style("font-size", "8px")
      .text((d) => d.data.label)
  }

  const renderScatterChart = (
    chart: d3.Selection<SVGGElement, unknown, null, undefined>,
    config: ChartConfig,
    width: number,
    height: number,
    tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  ) => {
    const { datasets } = config.data
    const data = datasets[0].data.map((value, i) => ({
      x: i,
      y: value,
    }))

    const x = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .nice()
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(datasets[0].data) || 0])
      .nice()
      .range([height, 0])

    // Add X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px")

    // Add Y axis
    chart.append("g").call(d3.axisLeft(y)).selectAll("text").style("font-size", "10px")

    // Add dots with hover effects
    chart
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 4)
      .attr("fill", "#5b9bd5")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 6).attr("fill", "#4a8bc6")

        tooltip
          .style("opacity", 1)
          .html(`<strong>Point ${d.x + 1}</strong><br>${d.y}k`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 4).attr("fill", "#5b9bd5")

        tooltip.style("opacity", 0)
      })
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-white" style={{ minHeight: "200px" }}>
      {/* Add a pre-render div with fixed dimensions to ensure container has size */}
      <div style={{ position: "absolute", width: "100%", height: "100%", visibility: "hidden" }}></div>

      <svg
        ref={chartRef}
        className="w-full h-full"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  )
}

