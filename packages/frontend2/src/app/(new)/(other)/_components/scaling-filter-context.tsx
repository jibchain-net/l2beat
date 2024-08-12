'use client'

import {
  type Layer2Provider,
  type Layer3Provider,
  type ScalingProjectCategory,
  type ScalingProjectPurpose,
  type StageConfig,
} from '@l2beat/config'
import { notUndefined } from '@l2beat/shared-pure'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { type ScalingFinalityEntry } from '~/server/features/scaling/finality/types'
import { type ScalingDataAvailabilityEntry } from '~/server/features/scaling/get-scaling-da-entries'
import { type ScalingRiskEntry } from '~/server/features/scaling/get-scaling-risk-entries'
import { type ScalingSummaryEntry } from '~/server/features/scaling/get-scaling-summary-entries'
import {
  type ScalingSummaryLayer2sEntry,
  type ScalingSummaryLayer3sEntry,
} from '~/server/features/scaling/types'

export type ScalingFilterContextValue = {
  rollupsOnly: boolean
  excludeAssociatedTokens: boolean
  category?: ScalingProjectCategory
  stack?: Layer2Provider | Layer3Provider
  stage?: StageConfig['stage']
  purpose?: ScalingProjectPurpose
  hostChain?: string
  daLayer?: string
}

export type MutableScalingFilterContextValue = ScalingFilterContextValue & {
  set: (value: Partial<ScalingFilterContextValue>) => void
  reset: () => void
}

const ScalingFilterContext = createContext<
  MutableScalingFilterContextValue | undefined
>(undefined)

const defaultValues: ScalingFilterContextValue = {
  rollupsOnly: false,
  excludeAssociatedTokens: false,
  category: undefined,
  stack: undefined,
  stage: undefined,
  purpose: undefined,
  hostChain: undefined,
  daLayer: undefined,
}

export function useScalingFilterValues() {
  console.log('using -> useScalingFilterValues')
  const context = useContext(ScalingFilterContext)
  if (!context) {
    throw new Error(
      'useScalingFilterContext must be used within a ScalingFilterContextProvider',
    )
  }
  return {
    ...context,
    // Check if all values are default, in which case the filter is effectively disabled
    // This is used e.g. to determine if we should pass the project list to the backend
    // or just use the predefined query type.
    // empty: (Object.keys(defaultValues) as (keyof typeof defaultValues)[]).every(
    //   (key) => context[key] === defaultValues[key],
    // ),
  }
}

type ScalingEntry =
  | ScalingSummaryLayer2sEntry
  | ScalingSummaryLayer3sEntry
  | ScalingRiskEntry
  | ScalingFinalityEntry
  | ScalingDataAvailabilityEntry
  | ScalingSummaryEntry

export function useScalingFilter() {
  console.log('using -> useScalingFilter')

  const scalingFilters = useScalingFilterValues()

  const filter = useCallback(
    (entry: ScalingEntry) => {
      const checks = [
        scalingFilters.rollupsOnly !== false
          ? entry.category.includes('Rollup')
          : undefined,
        scalingFilters.category !== undefined
          ? entry.category === scalingFilters.category
          : undefined,
        scalingFilters.stack !== undefined
          ? entry.provider === scalingFilters.stack
          : undefined,
        scalingFilters.stage !== undefined
          ? entry.type === 'layer2'
            ? entry.stage?.stage === scalingFilters.stage
            : false
          : undefined,
        scalingFilters.purpose !== undefined
          ? entry.purposes.some((purpose) => purpose === scalingFilters.purpose)
          : undefined,
        scalingFilters.hostChain !== undefined
          ? scalingFilters.hostChain === 'Ethereum'
            ? entry.type === 'layer2'
            : entry.type === 'layer3' &&
              entry.hostChain === scalingFilters.hostChain
          : undefined,
        scalingFilters.daLayer !== undefined
          ? entry.entryType === 'data-availability'
            ? entry.dataAvailability.layer.value === scalingFilters.daLayer
            : undefined
          : undefined,
      ].filter(notUndefined)
      return checks.length === 0 || checks.every(Boolean)
    },
    [scalingFilters],
  )

  return filter
}

export function ScalingFilterContextProvider({
  children,
}: { children: React.ReactNode }) {
  const [value, setValue] = useState<ScalingFilterContextValue>(defaultValues)

  const set = useCallback(
    (newValue: Partial<ScalingFilterContextValue>) => {
      console.log('setting new filter value')
      setValue((prev) => ({ ...prev, ...newValue }))
    },
    [setValue],
  )

  const reset = useCallback(() => setValue(defaultValues), [setValue])

  const contextValue = useMemo(
    () => ({ ...value, set, reset }),
    [value, set, reset],
  )

  console.log('rendering -> ScalingFilterContextProvider')
  return (
    <ScalingFilterContext.Provider value={contextValue}>
      {children}
    </ScalingFilterContext.Provider>
  )
}
