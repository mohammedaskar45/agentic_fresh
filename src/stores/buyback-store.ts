import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BuybackState {
  currentStepId: number
  companyType: 'PRIVATE' | 'LISTED'
  workflowStatus: any[]
  setWorkflow: (status: any[], stepId: number) => void
  completeStep: (stepId: number) => void
  reset: () => void
}

export const useBuybackStore = create<BuybackState>()(
  persist(
    (set) => ({
      currentStepId: 0,
      companyType: 'PRIVATE',
      workflowStatus: [],
      setWorkflow: (status, stepId) => set({ workflowStatus: status, currentStepId: stepId }),
      completeStep: (stepId) => set((state) => {
          const newStatus = [...state.workflowStatus]
          if (newStatus[stepId]) {
              newStatus[stepId].status = 'completed'
              if (newStatus[stepId + 1]) {
                  newStatus[stepId + 1].status = 'current'
                  return { workflowStatus: newStatus, currentStepId: stepId + 1 }
              }
          }
          return { workflowStatus: newStatus }
      }),
      reset: () => set({ currentStepId: 0, workflowStatus: [] }),
    }),
    { name: 'buyback-workflow-v1' }
  )
)
