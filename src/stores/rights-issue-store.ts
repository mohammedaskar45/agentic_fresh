import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface RIStep {
  id: number
  title: string
  status: 'completed' | 'current' | 'upcoming'
}

interface RIState {
  currentStepId: number
  steps: RIStep[]
  companyType: 'PRIVATE' | 'LISTED'
  setCompanyType: (type: 'PRIVATE' | 'LISTED') => void
  completeStep: (stepId: number) => void
  setCurrentStep: (stepId: number) => void
  setSteps: (steps: RIStep[]) => void
  reset: () => void
}

export const useRightsIssueStore = create<RIState>()(
  persist(
    (set) => ({
      currentStepId: 0,
      companyType: 'PRIVATE',
      steps: [],
      setCompanyType: (companyType) => set({ companyType }),
      completeStep: (stepId) =>
        set((state) => {
          const updatedSteps = state.steps.map((step) => {
            if (step.id === stepId) return { ...step, status: 'completed' as const }
            if (step.id === stepId + 1) return { ...step, status: 'current' as const }
            return step
          })
          return {
            steps: updatedSteps,
            currentStepId: stepId + 1,
          }
        }),
      setCurrentStep: (stepId) =>
        set(() => ({
          currentStepId: stepId,
        })),
      setSteps: (steps) => set({ steps }),
      reset: () =>
        set(() => ({
          currentStepId: 0,
          companyType: 'PRIVATE',
          steps: [],
        })),
    }),
    {
      name: 'rights-issue-workflow-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
