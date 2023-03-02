import React from "react"
import styled from "styled-components"
import Flex from "@netdata/netdata-ui/lib/components/templates/flex"
import { Text } from "@netdata/netdata-ui/lib/components/typography"
import { useChart, useChartError } from "@/components/provider"

const ProceededContainer = styled(Flex).attrs({
  column: true,
  round: true,
  border: { side: "all", color: "borderSecondary" },
  gap: 1,
  padding: [1, 2],
  flex: false,
})`
  direction: initial;
`

const Proceeded = ({ defaultValue, ...rest }) => {
  const chart = useChart()

  const chartWidth = chart.getUI().getChartWidth()
  const error = useChartError()

  if (chartWidth < 240) return null

  return (
    <ProceededContainer {...rest}>
      <Text textAlign="center" textTransform="firstLetter">
        {error || defaultValue}
      </Text>
    </ProceededContainer>
  )
}

const CenterContainer = styled(Flex)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export const CenterNoData = () => (
  <CenterContainer>
    <Proceeded defaultValue="No data" />
  </CenterContainer>
)

export default Proceeded
