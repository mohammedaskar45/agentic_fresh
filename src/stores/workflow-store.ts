import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WorkflowStep {
  id: number
  status: 'completed' | 'current' | 'upcoming'
  documentStatus?: 'NOT STARTED' | 'DRAFT READY' | 'DOWNLOADED' | 'PENDING UPLOAD' | 'UPLOADED' | 'VERIFIED' | 'REJECTED'
}

interface WorkflowState {
  currentStepId: number
  steps: WorkflowStep[]
  completeStep: (stepId: number) => void
  setCurrentStep: (stepId: number) => void
  setSteps: (steps: WorkflowStep[], currentStepId: number) => void
  setDocumentStatus: (stepId: number, status: WorkflowStep['documentStatus']) => void
  reset: () => void
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      currentStepId: 0,
      steps: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        status: i === 0 ? 'current' : 'upcoming',
      })),
      completeStep: (stepId) =>
        set((state) => {
          const nextId = Math.min(stepId + 1, 9)
          const updatedSteps = state.steps.map((step) => ({
            ...step,
            status: step.id < nextId ? 'completed' : (step.id === nextId ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming'
          }))
          return {
            steps: updatedSteps,
            currentStepId: nextId,
          }
        }),
      setCurrentStep: (stepId) =>
        set((state) => ({
          currentStepId: stepId,
          steps: state.steps.map((step) => ({
            ...step,
            status: step.id < stepId ? 'completed' : (step.id === stepId ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming'
          }))
        })),
      setSteps: (steps, currentStepId) =>
        set(() => ({
          steps: steps.map((step) => ({
            ...step,
            status: step.id < currentStepId ? 'completed' : (step.id === currentStepId ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming'
          })),
          currentStepId,
        })),
      setDocumentStatus: (stepId, status) =>
        set((state) => ({
          steps: state.steps.map((step) => 
            step.id === stepId ? { ...step, documentStatus: status } : step
          )
        })),
      reset: () =>
        set(() => ({
          currentStepId: 0,
          steps: Array.from({ length: 10 }, (_, i) => ({
            id: i,
            status: i === 0 ? 'current' : 'upcoming',
          })),
        })),
    }),
    {
      name: 'incorporation-workflow-v4',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
