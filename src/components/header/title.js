import React from "react"
import Flex from "@netdata/netdata-ui/lib/components/templates/flex"
import { Text } from "@netdata/netdata-ui/lib/components/typography"
import { useChart, useAttributeValue } from "@/components/provider"

const Title = props => {
  const chart = useChart()
  const { title } = chart.getMetadata()
  const unit = useAttributeValue("unit")

  return (
    <Flex overflow="hidden" data-testid="chartHeaderStatus-title" gap={1} {...props}>
      <Text strong color="textDescription" truncate>
        {title}
      </Text>
      {unit && (
        <Text strong color="textLite" whiteSpace="nowrap">
          • [{unit}]
        </Text>
      )}
    </Flex>
  )
}

export default Title
