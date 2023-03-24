import React, { useMemo, memo } from "react"
import { useChart, useAttribute, useAttributeValue, useMetadata } from "@/components/provider"
import DropdownTable from "./dropdownTable"
import { getStats } from "./utils"
import {
  labelColumn,
  uniqueColumn,
  metricsColumn,
  contributionColumn,
  anomalyRateColumn,
  minColumn,
  avgColumn,
  maxColumn,
} from "./columns"

const tooltipProps = {
  heading: "Labels",
  body: "View or filter the contributing time-series labels to this chart. This menu also presents the contribution of each label on the chart, and a break down of the anomaly rate of the data per label.",
}

const columns = [
  labelColumn("value"),
  uniqueColumn(),
  metricsColumn(),
  contributionColumn(),
  anomalyRateColumn(),
  minColumn(),
  avgColumn(),
  maxColumn(),
]

const Labels = ({ labelProps, ...rest }) => {
  const chart = useChart()
  const value = useAttributeValue("selectedLabels")

  const { labels, labelsTotals } = useMetadata()

  const options = useMemo(
    () =>
      Object.keys(labels).map(id =>
        getStats(chart, labels[id], {
          key: "labels",
          childrenKey: "values",
          props: { selected: value.includes(id) },
          childProps: {
            unique: "-",
            parentId: id,
            getIsSelected: val => value.includes(`${id}:${val.id}`),
            getValue: val => `${id}:${val.id}`,
          },
          children: labels[id].vl,
        })
      ),
    [labels, value]
  )

  const [sortBy, onSortByChange] = useAttribute("labelsSortBy")
  const [expanded, onExpandedChange] = useAttribute("labelsExpanded")

  return (
    <DropdownTable
      title="Labels"
      resourceName="label"
      data-track={chart.track("labels")}
      labelProps={labelProps}
      onChange={chart.updateLabelsAttribute}
      options={options}
      tooltipProps={tooltipProps}
      value={value}
      columns={columns}
      enableSubRowSelection
      sortBy={sortBy}
      onSortByChange={onSortByChange}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      totals={labelsTotals}
      {...rest}
    />
  )
}

export default memo(Labels)
