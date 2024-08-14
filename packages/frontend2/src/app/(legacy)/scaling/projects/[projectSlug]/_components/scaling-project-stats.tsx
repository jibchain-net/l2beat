import { pluralize } from '@l2beat/shared-pure'
import { type ReactNode } from 'react'
import { StageBadge } from '~/app/_components/badge/stage-badge'
import { HorizontalSeparator } from '~/app/_components/horizontal-separator'
import { StageTooltip } from '~/app/_components/table/cells/stage/stage-tooltip'
import { TypeCell } from '~/app/_components/table/cells/type-cell'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/app/_components/tooltip/tooltip'
import InfoIcon from '~/icons/info.svg'
import { type ScalingProjectEntry } from '~/server/features/scaling/project/get-scaling-project-entry'
import { cn } from '~/utils/cn'

interface Props {
  project: ScalingProjectEntry
}

export function ScalingProjectStats({ project }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-100 dark:bg-zinc-900 md:grid-cols-3 md:px-6 md:py-5">
      <ProjectStat title="Tokens" value={<></>} />
      <ProjectStat title="Daily TPS" value={<></>} />
      <ProjectStat title="30D tx count" value={<></>} />
      <HorizontalSeparator className="col-span-full my-5 max-md:hidden" />
      <ProjectStat
        title="Stage"
        value={
          <span className="relative -top-0.5 flex items-center">
            <a href="#stage">
              <StageBadge stage={project.stageConfig.stage} big />
            </a>
            <Tooltip>
              <TooltipTrigger className="inline-block px-2">
                <InfoIcon className="size-4 fill-gray-500 dark:fill-gray-600" />
              </TooltipTrigger>
              <TooltipContent>
                <StageTooltip stageConfig={project.stageConfig} />
              </TooltipContent>
            </Tooltip>
          </span>
        }
      />
      <ProjectStat
        title="Type"
        value={<TypeCell>{project.category}</TypeCell>}
      />
      <ProjectStat
        title={pluralize(project.purposes.length, 'Purpose')}
        value={project.purposes.join(', ')}
      />
    </div>
  )
}

export interface ProjectStat {
  title: string
  value: ReactNode
  tooltip?: string
  className?: string
}

function ProjectStat(props: ProjectStat) {
  return (
    <li
      className={cn(
        'flex items-center justify-between md:flex-col md:items-start md:justify-start md:gap-3',
        props.className,
      )}
    >
      <div className="flex flex-row gap-1.5">
        <span className="text-xs text-gray-500 dark:text-gray-600">
          {props.title}
        </span>
        {props.tooltip && (
          <Tooltip>
            <TooltipTrigger className="-translate-y-px md:translate-y-0">
              <InfoIcon className="mt-0.5 fill-gray-500 dark:fill-gray-600 md:size-3.5" />
            </TooltipTrigger>
            <TooltipContent>{props.tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>

      <span className="text-lg font-semibold !leading-none md:text-xl md:font-bold">
        {props.value}
      </span>
    </li>
  )
}
