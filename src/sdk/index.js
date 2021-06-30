import makeListeners from "@/helpers/makeListeners"
import makeContainer from "./makeContainer"
import makeChart from "./makeChart"
import makeChartsMetadata from "./makeChartsMetadata"
import initialAttributes from "./initialAttributes"

export default ({
  ui,
  plugins: defaultPlugins = {},
  attributes: defaultAttributes,
  on = {},
  getChartMetadata,
}) => {
  const listeners = makeListeners()
  const chartsMetadata = makeChartsMetadata({ getChart: getChartMetadata })
  const attributes = { ui }
  const plugins = {}
  let root

  const init = () => {
    root = makeSDKContainer({ id: "root", ...initialAttributes, ...defaultAttributes })
    Object.keys(on).forEach(name => listeners.on(name, on[name]))
    Object.keys(defaultPlugins).forEach(name => register(name, defaultPlugins[name]))
  }

  const getRoot = () => root

  const register = (name, plugin) => {
    plugins[name] = plugin(instance)
  }

  const unregister = name => {
    plugins[name]()
    delete plugins[name]
  }

  const addUI = (type, chartLibrary) => {
    attributes.ui[type] = chartLibrary
  }

  const makeChartCore = options => makeChart({ sdk: instance, ...options })

  const makeChartUI = chart => {
    const chartLibrary = chart.getAttribute("chartLibrary") || defaultAttributes.chartLibrary

    if (!(chartLibrary in attributes.ui))
      console.error(
        `Chart library "${chartLibrary}" does not exist in ${Object.keys(attributes.ui).join(", ")}`
      )

    const makeChartLibrary = attributes.ui[chartLibrary]

    return makeChartLibrary(instance, chart)
  }

  const makeSDKChart = options => {
    const chart = makeChartCore(options)
    const ui = makeChartUI(chart)
    chart.setUI(ui)

    return chart
  }

  const makeSDKContainer = (attributes = {}) => makeContainer({ sdk: instance, attributes })

  const getNodes = attributes => root.getNodes(attributes, [root])

  const appendChild = (node, { inherit = true } = {}) => root.appendChild(node, { inherit })

  const removeChild = node => root.removeChild(node)

  const instance = {
    ...listeners,
    chartsMetadata,
    getRoot,
    register,
    unregister,
    addUI,
    makeChartCore,
    makeChartUI,
    makeChart: makeSDKChart,
    makeContainer: makeSDKContainer,
    getNodes,
    appendChild,
    removeChild,
  }

  init()

  return instance
}
