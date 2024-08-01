import { uniq } from 'lodash'
import React from 'react'
import { TableFilter } from '~/app/_components/table/filters/table-filter'
import { BaseScalingFilters } from './base-scaling-filters'
import { useScalingFilterValues } from './scaling-filter-context'
import { type CommonScalingEntry } from '~/server/features/scaling/get-common-scaling-entry'

interface Props {
  items: CommonScalingEntry[]
}

export function ScalingFilters({ items }: Props) {
  const state = useScalingFilterValues()
  const hostChainOptions = uniq(
    items.map((item) => item.hostChain ?? 'Ethereum'),
  )
    .sort()
    .map((value) => ({
      label: value,
      value,
    }))

  const hostChainFilter = hostChainOptions.length > 1 && (
    <TableFilter
      title="Host Chain"
      options={hostChainOptions}
      value={state.hostChain}
      onValueChange={(value) => state.set({ hostChain: value })}
    />
  )

  return (
    <BaseScalingFilters items={items} additionalFiltersLeft={hostChainFilter} />
  )
}
