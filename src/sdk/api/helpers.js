export const getChartURLOptions = chart => {
  const { chartUrlOptions, eliminateZeroDimensions, urlOptions } = chart.getAttributes()

  return [
    ...(chartUrlOptions || chart.getUI().getUrlOptions()),
    ...urlOptions,
    "jsonwrap",
    eliminateZeroDimensions && "nonzero",
    "flip",
    "ms",
    "jw-anomaly-rates",
    "minify",
    "annotations",
  ].filter(Boolean)
}

const oneValueOptions = {
  group_by: "selected",
  group_by_label: "",
  aggregation: "sum",
}

const defaultOptionsByLibrary = {
  gauge: oneValueOptions,
  easypiechart: oneValueOptions,
  default: {},
}

export const getChartPayload = chart => {
  const ui = chart.getUI()

  const { format } = ui
  const width = ui.getParentWidth() || ui.getEstimatedChartWidth() || ui.getChartWidth()

  const pixelsPerPoint = ui.getPixelsPerPoint()
  const { after, before, groupingMethod, groupingTime, chartLibrary } = chart.getAttributes()

  const dataPadding = Math.round((before - after) / 2)
  const afterWithPadding = after - dataPadding
  const beforeWithPadding = before + dataPadding
  const pointsMultiplier = after < 0 ? 1.5 : 2

  return {
    points: Math.round((width / pixelsPerPoint) * pointsMultiplier),
    format: "json2" || format, // TODO use format
    time_group: groupingMethod,
    time_resampling: groupingTime,
    after: afterWithPadding,
    ...(after > 0 && { before: beforeWithPadding }),
    ...(defaultOptionsByLibrary[chartLibrary] || defaultOptionsByLibrary.default),
  }
}

export const errorCodesToMessage = {
  ErrAllNodesFailed: "All agents failed to return data",
}
