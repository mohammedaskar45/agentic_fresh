import axiosInstance from '@/lib/axios'

export const rightsIssueService = {
  getStatus: async () => {
    const response = await axiosInstance.get('/v1/rights-issue/status')
    return response.data
  },

  saveMasterData: async (data: any) => {
    const response = await axiosInstance.post('/v1/rights-issue/master-data', data)
    return response.data
  },

  runEligibility: async () => {
    const response = await axiosInstance.post('/v1/rights-issue/run-eligibility')
    return response.data
  },

  generateDrafts: async (stepId: number) => {
    const response = await axiosInstance.post('/v1/rights-issue/generate-drafts', { stepId })
    return response.data
  },

  saveStep: async (stepId: number, data: any = {}) => {
    const response = await axiosInstance.post('/v1/rights-issue/save-step', { stepId, data })
    return response.data
  }
}
