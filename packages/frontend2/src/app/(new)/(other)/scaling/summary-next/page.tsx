import { getDefaultMetadata } from '~/utils/get-default-metadata'

import { HOMEPAGE_MILESTONES } from '@l2beat/config'
import { About } from '~/app/_components/about'
import { TvlChart } from '~/app/_components/chart/tvl-chart'
import { HorizontalSeparator } from '~/app/_components/horizontal-separator'
import { OtherSites } from '~/app/_components/other-sites'
import { HydrateClient, api } from '~/trpc/server'
import { ScalingFilterContextProvider } from '../../_components/scaling-filter-context'
import { ScalingSummaryTables } from './_components/scaling-summary-tables'

export const metadata = getDefaultMetadata({
  openGraph: {
    url: '/scaling/summary',
  },
  robots: {
    index: false,
  },
})

export default async function Page() {
  await api.scaling.summary.prefetch({
    type: 'layer2',
    range: getCookie('chartRange'),
  })

  return (
    <HydrateClient>
      <div className="mb-20">
        <ScalingFilterContextProvider>
          <TvlChart milestones={HOMEPAGE_MILESTONES} />
          <HorizontalSeparator className="my-4 md:my-6" />
          <ScalingSummaryTables layer2s={[]} layer3s={[]} />
        </ScalingFilterContextProvider>
        <OtherSites />
        <About />
      </div>
    </HydrateClient>
  )
}
