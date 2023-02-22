export default {
  api: 2,
  summary: {
    hosts: [],
    contexts: [],
    instances: [],
    dimensions: [],
    labels: [],
    alerts: [],
  },
  functions: [],
  db: {
    update_every: 1,
    first_entry: null,
    last_entry: null,
  },
  view: {
    title: "",
    time_group: "",
    update_every: 1,
    after: null,
    before: null,
    points: 0,
    units: "",
    chart_type: "line",
    dimensions: {
      ids: [],
      names: [],
      units: [],
      priorities: [],
      grouped: [],
      count: 2,
    },
  },
  result: {
    labels: [],
    data: [],
  },
  anomaly_rates: {
    labels: [],
    data: [],
  },
  min: null,
  max: null,
  timings: {
    prep_ms: 0,
    query_ms: 0,
    group_by_ms: 0,
    output_ms: 0,
    total_ms: 0,
  },
}
