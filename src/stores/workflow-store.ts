import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WorkflowStep {
  id: number
  status: 'completed' | 'current' | 'upcoming'
}

interface WorkflowState {
  currentStepId: number
  steps: WorkflowStep[]
  completeStep: (stepId: number) => void
  setCurrentStep: (stepId: number) => void
  reset: () => void
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      currentStepId: 1,
      steps: Array.from({ length: 11 }, (_, i) => ({
        id: i + 1,
        status: i === 0 ? 'current' : 'upcoming',
      })),
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
      reset: () =>
        set(() => ({
          currentStepId: 1,
          steps: Array.from({ length: 11 }, (_, i) => ({
            id: i + 1,
            status: i === 0 ? 'current' : 'upcoming',
          })),
        })),
    }),
    {
      name: 'incorporation-workflow-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
