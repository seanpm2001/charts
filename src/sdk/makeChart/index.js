import deepEqual from "@/helpers/deepEqual"
import makeKeyboardListener from "@/helpers/makeKeyboardListener"
import makeNode from "../makeNode"
import initialPayload from "./initialPayload"
import convert from "../unitConversion"
import { fetchChartData, errorCodesToMessage } from "./api"
import makeDimensions from "./makeDimensions"
import makeGetClosestRow from "./makeGetClosestRow"
import getInitialFilterAttributes from "./filters/getInitialAttributes"
import makeFilterControllers from "./filters/makeControllers"
import makeGetUnitSign from "./makeGetUnitSign"
import makeWeights from "./makeWeights"
import camelizePayload from "./camelizePayload"
import initialMetadata from "../initialMetadata"

const maxBackoffMs = 30 * 1000

const defaultMakeTrack = () => value => value

export default ({
  sdk,
  parent,
  getChart = fetchChartData,
  chartsMetadata,
  attributes,
  makeTrack = defaultMakeTrack,
} = {}) => {
  let node = makeNode({ sdk, parent, attributes })
  let ui = null
  let abortController = null
  let payload = initialPayload
  let nextPayload = null
  let fetchTimeoutId = null
  let prevMetadata = null

  let backoffMs = null
  const backoff = ms => {
    if (ms) {
      backoffMs = ms
      return
    }
    const tmpBackoffMs = backoffMs ? backoffMs * 2 : getUpdateEvery()
    backoffMs = tmpBackoffMs > maxBackoffMs ? maxBackoffMs : tmpBackoffMs
  }

  const getMetadataDecorator = () =>
    node ? chartsMetadata || sdk.chartsMetadata : sdk.chartsMetadata

  const getPayload = () => payload

  const { invalidateClosestRowCache, getClosestRow } = makeGetClosestRow(getPayload)

  const cancelFetch = () => abortController && abortController.abort()

  const getMetadata = () =>
    node ? getMetadataDecorator().get(node) || initialMetadata : initialMetadata
  const setMetadataAttributes = (values = {}) => {
    if (!node || !getMetadataDecorator().set) return getMetadata()

    getMetadataDecorator().set(node, values)
    updateMetadata()
    return getMetadata()
  }
  const setMetadataAttribute = (attribute, value) => setMetadataAttributes({ [attribute]: value })

  const getUpdateEvery = () => {
    if (!node) return

    const { loaded, viewUpdateEvery: viewUpdateEveryAttribute } = node.getAttributes()
    if (viewUpdateEveryAttribute) return viewUpdateEveryAttribute * 1000

    const { viewUpdateEvery, updateEvery } = getPayload()
    if (loaded && viewUpdateEvery) return viewUpdateEvery * 1000

    return updateEvery * 1000 || 2000
  }

  const startAutofetch = () => {
    if (!node) return

    const { fetchStartedAt, loading, autofetch, active, paused } = node.getAttributes()

    if (!autofetch || loading || !active || paused) return

    if (fetchStartedAt === 0) return fetch()

    const fetchingPeriod = Date.now() - fetchStartedAt
    const updateEveryMs = getUpdateEvery()
    const div = fetchingPeriod / updateEveryMs
    const updateEveryMultiples = Math.floor(div)

    if (updateEveryMultiples >= 1) return fetch()

    const remaining =
      backoffMs || updateEveryMs - Math.round((div - Math.floor(div)) * updateEveryMs)

    clearTimeout(fetchTimeoutId)
    fetchTimeoutId = setTimeout(() => {
      startAutofetch()
    }, remaining)
  }

  const finishFetch = () => {
    if (!node) return

    startAutofetch()
    node.trigger("finishFetch")
  }

  const getDataLength = payload => {
    const { result } = payload || {}
    return Array.isArray(result) ? result.length : result.data?.length || 0
  }

  const doneFetch = nextRawPayload => {
    backoffMs = 0
    const { metadata, result, chartType, ...restPayload } = camelizePayload(nextRawPayload)

    const prevPayload = nextPayload

    nextPayload = {
      ...initialPayload,
      ...nextPayload,
      ...restPayload,
      result,
      chartType,
      metadata,
    }

    if (
      !deepEqual(getMetadata(), metadata, {
        keep: ["fullyLoaded", "dimensions", "labels", "nodes", "instances", "functions"],
      })
    )
      setMetadataAttributes(metadata)

    const dataLength = getDataLength(nextPayload)
    if (
      !node.getAttribute("loaded") ||
      (dataLength > 0 && getDataLength(payload) === 0) ||
      (getDataLength(payload) > 0 && dataLength === 0)
    )
      consumePayload()

    invalidateClosestRowCache()

    if (!node.getAttribute("loaded")) node.getParent().trigger("chartLoaded", node)

    const wasLoaded = node.getAttribute("loaded")

    const attributes = node.getAttributes()

    node.updateAttributes({
      loaded: true,
      loading: false,
      updatedAt: Date.now(),
      outOfLimits: !dataLength,
      chartType: attributes.selectedChartType || attributes.chartType || chartType,
      ...restPayload,
      title: attributes.title || restPayload.title,
      error: null,
    })

    if (wasLoaded) node.trigger("successFetch", nextPayload, prevPayload)

    invalidateContexts(nextPayload.versions?.contexts_hard_hash)
    finishFetch()
  }

  const invalidateContexts = hardHash => {
    if (!node || !hardHash) return

    const container = node.getParent()
    if (!container) return

    const containerHardHash = container.getAttribute("contextsHardHash")

    if (containerHardHash !== hardHash) container.updateAttribute("contextsHardHash", hardHash)
  }

  const failFetch = error => {
    if (!node) return

    if (error?.name === "AbortError") {
      node.updateAttribute("loading", false)
      return
    }

    backoff()
    if (!error || error.name !== "AbortError") node.trigger("failFetch", error)

    if (!node.getAttribute("loaded")) node.getParent().trigger("chartLoaded", node)

    node.updateAttributes({
      loaded: true, //node.getAttribute("loaded"),
      loading: false,
      updatedAt: Date.now(),
      error:
        errorCodesToMessage[error?.errorMessage] ||
        error?.errorMessage ||
        error?.message ||
        "Something went wrong",
    })

    finishFetch()
  }

  const dataFetch = () => {
    abortController = new AbortController()
    const options = { signal: abortController.signal }

    return getChart(node, options)
      .then(data => {
        if (data?.errorMsgKey) return failFetch(data)
        if (!(Array.isArray(data?.result) || Array.isArray(data?.result?.data))) return failFetch()

        return doneFetch(data)
      })
      .catch(failFetch)
  }

  const isNewerThanRetention = () => {
    const metadata = getMetadata()

    if (metadata) {
      if (!node) return

      const { firstEntry } = metadata
      const { after, before } = node.getAttributes()
      const absoluteBefore = after >= 0 ? before : Date.now() / 1000
      return !firstEntry || firstEntry <= absoluteBefore
    }

    return false
  }

  const fetch = () => {
    if (!node) return

    cancelFetch()
    node.trigger("startFetch")
    node.updateAttributes({ loading: true, fetchStartedAt: Date.now() })

    if (!isNewerThanRetention())
      return Promise.resolve().then(() =>
        failFetch({ message: "Exceeds agent data retention settings" })
      )

    return dataFetch()
  }

  const updateMetadata = () => {
    if (!node) return

    const metadata = getMetadata()
    if (deepEqual(metadata, prevMetadata, { omit: ["lastEntry"] })) return

    prevMetadata = getMetadata()
    dimensions.updateMetadataColors()
    node.trigger("metadataChanged")

    if (!node.getAttribute("initializedFilters"))
      node.setAttributes(getInitialFilterAttributes(node))
  }

  const getUI = () => ui
  const setUI = newUi => {
    ui = newUi
  }

  const render = () => ui && ui.render()

  const fetchAndRender = ({ initialize = false } = {}) => {
    if (!!node && initialize) node.updateAttribute("loaded", false)

    return fetch().then(() => {
      // if (getUI() && Date.now() - getUI().getRenderedAt() < 1000) return
      render()
    })
  }

  const getConvertedValue = (value, { fractionDigits } = {}) => {
    if (!node) return

    if (value === null) return "-"

    const { unitsConversionMethod, unitsConversionDivider, unitsConversionFractionDigits } =
      node.getAttributes()
    const converted = convert(node, unitsConversionMethod, value, unitsConversionDivider)

    if (unitsConversionFractionDigits === -1) return converted

    return Intl.NumberFormat(undefined, {
      useGrouping: true,
      minimumFractionDigits: fractionDigits || unitsConversionFractionDigits,
      maximumFractionDigits: fractionDigits || unitsConversionFractionDigits,
    }).format(converted)
  }

  const focus = event => {
    if (!node) return
    node.updateAttributes({ focused: true, hovering: true })
    sdk.trigger("hoverChart", node, event)
    node.trigger("hoverChart", event)
  }

  const blur = event => {
    if (!node) return
    node.updateAttributes({ focused: false, hovering: false })
    sdk.trigger("blurChart", node, event)
    node.trigger("blurChart", event)
  }

  const activate = () => {
    if (!node) return
    node.updateAttribute("active", true)
    sdk.trigger("active", node, true)
  }

  const deactivate = () => {
    if (!node) return
    node.updateAttribute("active", false)
    sdk.trigger("active", node, false)
  }

  const stopAutofetch = () => {
    clearTimeout(fetchTimeoutId)

    if (!node) return

    if (
      !node.getAttribute("active") &&
      node.getAttribute("loaded") &&
      node.getAttribute("loading")
    ) {
      cancelFetch()
    }
  }

  const getFirstEntry = () => getPayload().firstEntry

  const getUnits = () => {
    if (!node) return

    const { units } = node.getAttributes()
    return units
  }

  node.onAttributeChange("autofetch", autofetch => {
    if (autofetch) {
      startAutofetch()
    } else {
      stopAutofetch()
    }
  })

  node.onAttributeChange("active", active => {
    if (!node) return

    if (!active) return stopAutofetch()
    if (node.getAttribute("autofetch")) return startAutofetch()
  })

  const { onKeyChange, initKeyboardListener, clearKeyboardListener } = makeKeyboardListener()

  node.onAttributeChange("focused", focused => {
    if (!node) return

    focused ? initKeyboardListener() : clearKeyboardListener()
    invalidateClosestRowCache()
  })

  const getApplicableNodes = (attributes, options) => {
    if (!node) return []

    if (!node.match(attributes)) return [node]

    const ancestor = node.getAncestor(attributes)
    if (!ancestor) return [node]

    return ancestor.getNodes(attributes, options)
  }

  const destroy = () => {
    if (!node) return

    cancelFetch()
    stopAutofetch()
    clearKeyboardListener()

    if (ui) ui.unmount()

    ui = null
    node.destroy()
    node = null
  }

  node.type = "chart"
  node.getApplicableNodes = getApplicableNodes

  const consumePayload = () => {
    if (payload === nextPayload || nextPayload === null) return false

    const prevPayload = payload
    payload = nextPayload
    if (node) node.trigger("payloadChanged", nextPayload, prevPayload)

    return true
  }

  node = {
    ...node,
    getUI,
    setUI,
    getMetadata,
    setMetadataAttribute,
    setMetadataAttributes,
    getPayload,
    fetch,
    doneFetch,
    cancelFetch,
    fetchAndRender,
    getConvertedValue,
    startAutofetch,
    focus,
    blur,
    activate,
    deactivate,
    getClosestRow,
    getFirstEntry,
    getUnits,
    consumePayload,
  }

  node.getUnitSign = makeGetUnitSign(node)

  onKeyChange(["Alt", "Shift", "KeyF"], () => {
    if (!node) return
    node.updateAttribute("fullscreen", !node.getAttribute("fullscreen"))
  })

  onKeyChange(["Alt", "Shift", "KeyR"], () => {
    if (!node) return
    node.resetNavigation()
  })

  const dimensions = makeDimensions(node, sdk)
  const weights = makeWeights(node, sdk)

  const track = makeTrack(node)

  return {
    ...node,
    ...dimensions,
    ...weights,
    ...makeFilterControllers(node),
    track,
    destroy,
    onKeyChange,
  }
}
