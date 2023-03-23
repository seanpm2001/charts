import { getChartURLOptions, getChartPayload } from "./helpers"

const wildcardArray = ["*"]

const getPayload = chart => {
  const {
    selectedContexts,
    context,
    nodesScope,
    contextScope,
    selectedNodes,
    selectedInstances,
    selectedDimensions,
    selectedLabels,
    aggregationMethod,
  } = chart.getAttributes()

  const options = getChartURLOptions(chart)

  const {
    after,
    before,
    group_by,
    group_by_label,
    points,
    time_group,
    time_resampling,
    aggregation,
    format,
  } = getChartPayload(chart)

  const groupByLabel = group_by_label || chart.getAttribute("groupByLabel")

  return {
    format,
    options,
    scope: {
      contexts: contextScope.length ? contextScope : wildcardArray,
      nodes: nodesScope.length ? nodesScope : [],
    },
    selectors: {
      contexts: selectedContexts.length ? selectedContexts : context ? [context] : wildcardArray,
      nodes: selectedNodes.length ? selectedNodes : wildcardArray,
      instances: selectedInstances.length ? selectedInstances : wildcardArray,
      dimensions: selectedDimensions.length ? selectedDimensions : wildcardArray,
      labels: selectedLabels.length ? selectedLabels : wildcardArray,
    },
    aggregations: {
      metrics: {
        aggregation: aggregation || aggregationMethod,
        group_by: group_by || chart.getAttribute("groupBy"),
        ...(!!groupByLabel && { group_by_label: groupByLabel }),
      },
      time: {
        time_group,
        // time_group_options: "",
        time_resampling,
      },
    },
    window: {
      after,
      ...(after > 0 && { before }),
      points,
      // tier: 0
    },
  }
}

export default (chart, options) => {
  const { host } = chart.getAttributes()

  const payload = getPayload(chart)

  return fetch(`${host}/data`, {
    method: "POST",
    body: JSON.stringify(payload),
    ...options,
  }).then(response => response.json())
}

// import { getChartURLOptions, getChartPayload } from "./helpers"
// import initialPayload from "../initialPayload"

// // const getCompositeChartURLOptions = chart => {
// //   const { dimensionsAggregationMethod, groupBy } = chart.getAttributes()
// //   const options = getChartURLOptions(chart)

// //   return [
// //     ...options,
// //     // (dimensionsAggregationMethod === "sum" || (groupBy && groupBy !== "dimension")) && "absolute",
// //     "flip",
// //   ].filter(Boolean)
// // }

// const getGroupByValues = groupBy => {
//   if (groupBy === "chart") return "node"
//   if (groupBy === "node" || groupBy === "dimension") return groupBy
//   return `label=${groupBy}`
// }

// const getAggregations = chart => {
//   const {
//     aggregationMethod,
//     dimensionsAggregationMethod,
//     groupBy,
//     postGroupBy,
//     aggregationGroups,
//   } = chart.getAttributes()

//   const groupValues = [getGroupByValues(groupBy), postGroupBy && `label=${postGroupBy}`].filter(
//     Boolean
//   )

//   return [
//     groupBy !== "dimension" && {
//       method: dimensionsAggregationMethod,
//       groupBy: ["chart", ...groupValues],
//     },
//     groupBy !== "chart" && {
//       method: aggregationMethod,
//       groupBy: groupValues,
//       ...(aggregationGroups.length && { labels: aggregationGroups }),
//     },
//   ].filter(Boolean)
// }

// const valuesByMethod = {
//   "sum-of-abs": "sum",
// }
// const normalizeAggregationMethod = method => valuesByMethod[method] || method

// const getChartIdsByNodeId = (instances, nodeIdSet) => {
//   return instances.reduce(
//     (acc, { chartId, nodeId }) =>
//       nodeIdSet.size
//         ? {
//             ...acc,
//             ...(nodeIdSet.has(nodeId) && { [nodeId]: [...(acc[nodeId] || []), chartId] }),
//           }
//         : {
//             ...acc,
//             [nodeId]: [...(acc[nodeId] || []), chartId],
//           },
//     {}
//   )
// }

// const getPayload = chart => {
//   const metadata = chart.getMetadata()
//   const {
//     nodeIds = [],
//     dimensions,
//     postAggregationMethod,
//     filteredLabels,
//     context,
//     chartId,
//     filters,
//     selectedNodeIds,
//     selectedChartId,
//     selectedInstances,
//   } = chart.getAttributes()

//   const filter = {
//     nodeIDs: selectedNodeIds.length ? selectedNodeIds : nodeIds,
//     context: metadata.context || context || chartId,
//     ...(dimensions.length && { dimensions }),
//     ...(Object.keys(filteredLabels).length && { labels: filteredLabels }),
//     ...(selectedChartId && { chartID: selectedChartId }),
//     ...(selectedInstances.length && {
//       nodeChartInstances: getChartIdsByNodeId(selectedInstances, new Set(selectedNodeIds)),
//     }),
//     ...filters,
//   }
//   const aggregations = getAggregations(chart)

//   return {
//     filter,
//     aggregations,
//     agent_options: getChartURLOptions(chart),
//     ...(postAggregationMethod && {
//       post_aggregation_methods: [normalizeAggregationMethod(postAggregationMethod)],
//     }),
//     ...getChartPayload(chart),
//   }
// }

// export default (chart, options) => {
//   const { host } = chart.getAttributes()

//   const payload = getPayload(chart)

//   return fetch(host, {
//     method: "POST",
//     body: JSON.stringify(payload),
//     ...options,
//   })
//     .then(response => {
//       return response.json().then(data => {
//         if (response.ok) return data
//         throw data
//       })
//     })
//     .catch(error => {
//       if (
//         error.errorMsgKey &&
//         error.errorMsgKey === "ErrAllNodesFailed" &&
//         !error.nodes.some(node => node.error.errorMsgKey !== "ErrNoData")
//       )
//         return initialPayload

//       throw error
//     })
// }