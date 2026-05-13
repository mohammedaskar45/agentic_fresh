import axiosInstance from '@/lib/axios'

export interface DscData {
  full_name: string
  dob: string
  father_name: string
  nationality: string
  pan: string
  aadhaar: string
}

export interface DinData extends DscData {
  qualification: string
  occupation: string
  pob: string
}

export const incorporationService = {
  // DSC (Step 1) CRUD
  saveDsc: async (data: DscData) => {
    // Adding /v1 prefix to match backend controller
    const response = await axiosInstance.post('/v1/incorporation/dsc', data)
    return response.data
  },
  
  getDsc: async () => {
    const response = await axiosInstance.get('/v1/incorporation/dsc')
    return response.data
  },

  // DIN (Step 2) CRUD
  saveDin: async (data: DinData) => {
    const response = await axiosInstance.post('/v1/incorporation/din', data)
    return response.data
  },

  getDin: async () => {
    const response = await axiosInstance.get('/v1/incorporation/din')
    return response.data
  },

  // Name Approval (RUN - Step 3) CRUD
  saveRun: async (data: any) => {
    const response = await axiosInstance.post('/v1/incorporation/run', data)
    return response.data
  },

  getRun: async () => {
    const response = await axiosInstance.get('/v1/incorporation/run')
    return response.data
  },

  checkNameAvailability: async (name: string) => {
    const response = await axiosInstance.post('/v1/incorporation/check-name', { name })
    return response.data
  },

  // MOA & AOA Drafting (Step 4) CRUD
  saveMoaAoa: async (data: any) => {
    const response = await axiosInstance.post('/v1/incorporation/moa-aoa', data)
    return response.data
  },

  getMoaAoa: async () => {
    const response = await axiosInstance.get('/v1/incorporation/moa-aoa')
    return response.data
  },

  generateDrafts: async () => {
    const response = await axiosInstance.post('/v1/incorporation/generate-drafts')
    return response.data
  },

  // SPICe+ Filing (Step 5) CRUD
  saveSpice: async (data: any) => {
    const response = await axiosInstance.post('/v1/incorporation/spice', data)
    return response.data
  },

  getSpice: async () => {
    const response = await axiosInstance.get('/v1/incorporation/spice')
    return response.data
  },

  // PAN & TAN (Step 6) CRUD
  savePanTan: async (data: any) => {
    const response = await axiosInstance.post('/v1/incorporation/pan-tan', data)
    return response.data
  },

  getPanTan: async () => {
    const response = await axiosInstance.get('/v1/incorporation/pan-tan')
    return response.data
  },

  saveCoi: async (data: any) => axiosInstance.post('/v1/incorporation/coi', data),
  getCoi: async () => (await axiosInstance.get('/v1/incorporation/coi')).data,

  saveBank: async (data: any) => axiosInstance.post('/v1/incorporation/bank', data),
  getBank: async () => (await axiosInstance.get('/v1/incorporation/bank')).data,

  saveGst: async (data: any) => axiosInstance.post('/v1/incorporation/gst', data),
  getGst: async () => (await axiosInstance.get('/v1/incorporation/gst')).data,

  saveLabor: async (data: any) => axiosInstance.post('/v1/incorporation/labor', data),
  getLabor: async () => (await axiosInstance.get('/v1/incorporation/labor')).data,

  saveCommencement: async (data: any) => axiosInstance.post('/v1/incorporation/commencement', data),
  getCommencement: async () => (await axiosInstance.get('/v1/incorporation/commencement')).data,

  getStats: async () => {
    const response = await axiosInstance.get('/v1/incorporation/stats')
    return response.data
  },

  // Workflow Status
  getWorkflowStatus: async () => {
    const response = await axiosInstance.get('/v1/incorporation/status')
    return response.data
  }
}
