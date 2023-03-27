import { scaleLinear } from "d3-scale"

export default chartUI => plotter => {
  if (!chartUI) return

  // We need to handle all the series simultaneously.

  if (plotter.setName === "ANOMALY_RATE") {
    const ctx = plotter.drawingContext
    const points = plotter.points

    let min_sep = points[1].canvasx - points[0].canvasx + 1

    const bar_width = Math.floor(min_sep)

    const getColor = scaleLinear()
      .domain([0, 0.00001, 100])
      .range([
        chartUI.getThemeAttribute("themeScaleColor"),
        chartUI.getThemeAttribute("themeAnomalyLiteScaleColor"),
        chartUI.getThemeAttribute("themeAnomalyScaleColor"),
      ])

    const dimensionIds = chartUI.chart.getPayloadDimensionIds()
    const selectedLegendDimensions = chartUI.chart.getAttribute("selectedLegendDimensions")

    const selectedIdsSet = dimensionIds.reduce((h, id, index) => {
      if (!selectedLegendDimensions.length) {
        h.add(index)
      } else {
        if (chartUI.chart.isDimensionVisible(id)) h.add(index)
      }
      return h
    }, new Set())

    const { all } = chartUI.chart.getPayload()

    points.forEach(p => {
      const center_x = p.canvasx

      const row = chartUI.chart.getClosestRow(p.xval)
      const [, ...anomalyRow] = all[row]
      const value = anomalyRow.reduce(
        (max, { arp = 0 }, index) => (selectedIdsSet.has(index) ? (max > arp ? max : arp) : max),
        0
      )

      ctx.fillStyle = getColor(value)
      ctx.fillRect(center_x - bar_width / 2, 0, bar_width, 15)

      ctx.strokeStyle = getColor(value)
      ctx.strokeRect(center_x - bar_width / 2, 0, bar_width, 15)
    })
  }
}
