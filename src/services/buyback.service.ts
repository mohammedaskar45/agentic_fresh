import axiosInstance from '@/lib/axios'

export const buybackService = {
  getStatus: async () => {
    const response = await axiosInstance.get('/v1/buyback/status')
    return response.data
  },
  saveMasterData: async (data: any) => {
    const response = await axiosInstance.post('/v1/buyback/master-data', data)
    return response.data
  },
  getEligibility: async () => {
    const response = await axiosInstance.get('/v1/buyback/eligibility')
    return response.data
  },
  generateDrafts: async (stepId: number) => {
    const response = await axiosInstance.get(`/v1/buyback/drafts/${stepId}`)
    return response.data
  },
  saveStep: async (stepId: number, data: any = {}) => {
    const response = await axiosInstance.post(`/v1/buyback/save-step/${stepId}`, data)
    return response.data
  }
}
