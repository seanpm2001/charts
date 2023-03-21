import React, { memo, useMemo } from "react"
import { useChart, useAttribute, useAttributeValue, useMetadata } from "@/components/provider"
import DropdownTable from "./dropdownTable"
import { getStats } from "./utils"
import {
  labelColumn,
  metricsColumn,
  contributionColumn,
  anomalyRateColumn,
  alertsColumn,
} from "./columns"

const tooltipProps = {
  heading: "Instances",
  body: "View or filter the instances contributing time-series metrics to this chart. This menu also provides the contribution of each instance to the volume of the chart, and a break down of the anomaly rate of the queried data per instance.",
}

const columns = [
  labelColumn(),
  metricsColumn(),
  contributionColumn(),
  anomalyRateColumn(),
  alertsColumn(),
]

const Instances = ({ labelProps, ...rest }) => {
  const chart = useChart()
  const value = useAttributeValue("selectedInstances")
  const { nodes, nodesIndexes, instances, instancesTotals } = useMetadata()

  const options = useMemo(
    () =>
      Object.keys(instances).map(id => {
        const { nm: nodeName } = nodes[nodesIndexes[instances[id].ni]]

        const selected = value.includes(id)

        return getStats(chart, instances[id], {
          id,
          key: "instances",
          props: { label: `${instances[id].nm || id}@${nodeName}`, selected },
        })
      }),
    [instances, value]
  )

  const [sortBy, onSortByChange] = useAttribute("instancesSortBy")

  return (
    <DropdownTable
      title="Instances"
      resourceName="instance"
      data-track={chart.track("instances")}
      labelProps={labelProps}
      onChange={chart.updateInstancesAttribute}
      options={options}
      tooltipProps={tooltipProps}
      value={value}
      columns={columns}
      sortBy={sortBy}
      onSortByChange={onSortByChange}
      totals={instancesTotals}
      {...rest}
    />
  )
}

export default memo(Instances)