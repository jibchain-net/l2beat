import { getImplementationChangeReport } from '~/server/features/implementation-change-report/get-implementation-change-report'
import { getScalingSummaryEntries } from '~/server/features/scaling/get-scaling-summary-entries'
import { getLatestTvl } from '~/server/features/tvl/get-latest-tvl'
import { getProjectsVerificationStatuses } from '~/server/features/verification-status/get-projects-verification-statuses'
import { HydrateClient, api } from '~/trpc/server'
import { getCookie } from '~/utils/cookies/server'
import { getDefaultMetadata } from '~/utils/get-default-metadata'
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
  console.log('rendering -> Page')
  const implementationChangeReport = await getImplementationChangeReport()
  const projectsVerificationStatuses = await getProjectsVerificationStatuses()
  const latestTvl = await getLatestTvl({
    type: 'layer2',
  })

  // This gets all the data for the table, but NOT the % change (which comes from the API)
  const projects = await getScalingSummaryEntries({
    tvl: latestTvl,
    implementationChangeReport,
    projectsVerificationStatuses,
  })

  await api.scaling.summary.prefetch({
    type: 'layer2',
    range: getCookie('chartRange'),
  })

  return (
    <HydrateClient>
      <div className="mb-20">
        <ScalingFilterContextProvider>
          {/* <TvlChart
            latestTvl={latestTvl}
            milestones={HOMEPAGE_MILESTONES}
            // entries={projects}
          /> */}
          {/* <HorizontalSeparator className="my-4 md:my-6" /> */}
          <ScalingSummaryTables projects={projects} />
        </ScalingFilterContextProvider>
      </div>
    </HydrateClient>
  )
}
