import { type ContractsSectionProps } from './contracts/contracts-section'
import { type DetailedDescriptionSectionProps } from './detailed-description-section'
import { type KnowledgeNuggetsSectionProps } from './knowledge-nuggets/knowledge-nuggets-section'
import { type MarkdownSectionProps } from './markdown-section'
import { type MilestonesSectionProps } from './milestones-section'
import { type PermissionsSectionProps } from './permissions/permissions-section'
import { type ExtendedProjectSectionProps } from './project-section'
import { type RiskAnalysisSectionProps } from './risk-analysis-section'
import { type RiskSummarySectionProps } from './risk-summary/risk-summary-section'
import { type StageSectionProps } from './stage-section'
import { type StateDerivationSectionProps } from './state-derivation-section'
import { type StateValidationSectionProps } from './state-validation-section'
import { type TechnologySectionProps } from './technology/technology-section'

export type ProjectSectionId =
  | 'detailed-description'
  | 'milestones'
  | 'risk-summary'
  | 'risk-analysis'
  | 'stage'
  | 'technology'
  | 'da-layer-technology'
  | 'da-bridge-technology'
  | 'operator'
  | 'withdrawals'
  | 'other-considerations'
  | 'state-derivation'
  | 'state-validation'
  | 'upgrades-and-governance'
  | 'permissions'
  | 'contracts'
  | 'knowledge-nuggets'

export type ProjectSectionProps = Omit<
  ExtendedProjectSectionProps,
  'className' | 'children'
>

type ProjectDetailsProps<T> = Omit<T, 'sectionOrder'>

export interface ProjectDetailsDetailedDescriptionSection {
  type: 'DetailedDescriptionSection'
  props: ProjectDetailsProps<DetailedDescriptionSectionProps>
}

export interface ProjectDetailsMilestonesSection {
  type: 'MilestonesSection'
  props: ProjectDetailsProps<MilestonesSectionProps>
}

export interface ProjectDetailsRiskSummarySection {
  type: 'RiskSummarySection'
  props: ProjectDetailsProps<RiskSummarySectionProps>
}

export interface ProjectDetailsRiskAnalysisSection {
  type: 'RiskAnalysisSection'
  props: ProjectDetailsProps<RiskAnalysisSectionProps>
}

export interface ProjectDetailsStageSection {
  type: 'StageSection'
  props: ProjectDetailsProps<StageSectionProps>
}

export interface ProjectDetailsTechnologySection {
  type: 'TechnologySection'
  props: ProjectDetailsProps<TechnologySectionProps>
}

export interface ProjectDetailsStateDerivationSection {
  type: 'StateDerivationSection'
  props: ProjectDetailsProps<StateDerivationSectionProps>
}

export interface ProjectDetailsStateValidationSection {
  type: 'StateValidationSection'
  props: ProjectDetailsProps<StateValidationSectionProps>
}

export interface ProjectDetailsMarkdownSection {
  type: 'MarkdownSection'
  props: ProjectDetailsProps<MarkdownSectionProps>
}

export interface ProjectDetailsPermissionsSection {
  type: 'PermissionsSection'
  props: ProjectDetailsProps<PermissionsSectionProps>
}

export interface ProjectDetailsContractsSection {
  type: 'ContractsSection'
  props: ProjectDetailsProps<ContractsSectionProps>
}

export interface ProjectDetailsKnowledgeNuggetsSection {
  type: 'KnowledgeNuggetsSection'
  props: ProjectDetailsProps<KnowledgeNuggetsSectionProps>
}

export interface ProjectDetailsUpcomingDisclaimer {
  type: 'UpcomingDisclaimer'
  excludeFromNavigation: true
}

export type ProjectDetailsSection = {
  excludeFromNavigation?: boolean
} & (
  | ProjectDetailsDetailedDescriptionSection
  | ProjectDetailsMilestonesSection
  | ProjectDetailsRiskSummarySection
  | ProjectDetailsRiskAnalysisSection
  | ProjectDetailsStageSection
  | ProjectDetailsTechnologySection
  | ProjectDetailsStateDerivationSection
  | ProjectDetailsStateValidationSection
  | ProjectDetailsMarkdownSection
  | ProjectDetailsPermissionsSection
  | ProjectDetailsContractsSection
  | ProjectDetailsKnowledgeNuggetsSection
  | ProjectDetailsUpcomingDisclaimer
)
