"use client"

import * as d3 from "d3"
import { useEffect, useRef } from "react"
import { ChartConfig } from "types/chart"

interface D3ChartProps {
  config: ChartConfig
}

export function D3Chart({ config }: D3ChartProps) {
  const chartRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove()

    const svg = d3.select(chartRef.current)
    const margin = { top: 50, right: 30, bottom: 60, left: 60 }
    const width = chartRef.current.clientWidth - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Add title
    svg
      .append("text")
      .attr("x", chartRef.current.clientWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
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
      .style("box-shadow", "2px 2px 4px rgba(0,0,0,0.2)")

    if (config.type === "bar") {
      renderBarChart(chart, config, width, height, tooltip)
    } else if (config.type === "line") {
      renderLineChart(chart, config, width, height, tooltip)
    } else if (config.type === "pie") {
      renderPieChart(chart, config, width, height, tooltip)
    } else if (config.type === "scatter") {
      renderScatterChart(chart, config, width, height, tooltip)
    }

    // Add X axis label
    if (config.xAxisLabel) {
      chart
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text(config.xAxisLabel)
    }

    // Add Y axis label
    if (config.yAxisLabel) {
      chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text(config.yAxisLabel)
    }

    // Clean up tooltip when component unmounts
    return () => {
      d3.select("body").selectAll(".chart-tooltip").remove()
    }
  }, [config])

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
    chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))

    // Add Y axis
    chart.append("g").call(d3.axisLeft(y))

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
    chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))

    // Add Y axis
    chart.append("g").call(d3.axisLeft(y))

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
      .attr("r", 5)
      .attr("fill", "#5b9bd5")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 7).attr("fill", "#4a8bc6")

        tooltip
          .style("opacity", 1)
          .html(`<strong>${d.label}</strong><br>${d.value}k`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 5).attr("fill", "#5b9bd5")

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
      .style("stroke-width", "2px")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("opacity", 0.8).attr("transform", "scale(1.05)")

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
    chart.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x))

    // Add Y axis
    chart.append("g").call(d3.axisLeft(y))

    // Add dots with hover effects
    chart
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 5)
      .attr("fill", "#5b9bd5")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("r", 7).attr("fill", "#4a8bc6")

        tooltip
          .style("opacity", 1)
          .html(`<strong>Point ${d.x + 1}</strong><br>${d.y}k`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("r", 5).attr("fill", "#5b9bd5")

        tooltip.style("opacity", 0)
      })
  }

  return <svg ref={chartRef} width="100%" height="400px"></svg>
}

