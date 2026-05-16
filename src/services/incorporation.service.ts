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

  saveAuditor: async (data: any) => axiosInstance.post('/v1/incorporation/auditor', data),
  getAuditor: async () => (await axiosInstance.get('/v1/incorporation/auditor')).data,

  getStats: async () => {
    const response = await axiosInstance.get('/v1/incorporation/stats')
    return response.data
  },

  // Workflow Status
  getWorkflowStatus: async () => {
    const response = await axiosInstance.get('/v1/incorporation/status')
    return response.data
  },

  getStatus: async () => {
    const response = await axiosInstance.get('/v1/incorporation/status')
    return response.data
  },

  // Master Data (Step 0) CRUD
  saveMasterData: async (data: any) => {
    const response = await axiosInstance.post('/v1/incorporation/master-data', data)
    return response.data
  },

  getMasterData: async () => {
    const response = await axiosInstance.get('/v1/incorporation/master-data')
    return response.data
  },

  uploadDocument: async (stepId: number, file: File, subId?: string) => {
    const formData = new FormData()
    formData.append('stepId', stepId.toString())
    if (subId) formData.append('subId', subId)
    formData.append('file', file)
    const response = await axiosInstance.post('/v1/incorporation/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  verifyDocument: async (stepId: number, subId?: string) => {
    const response = await axiosInstance.post('/v1/incorporation/verify', { stepId, subId })
    return response.data
  },

  getRecord: async () => {
    const response = await axiosInstance.get('/v1/incorporation/record')
    return response.data
  },

  getLogs: async () => {
    const response = await axiosInstance.get('/v1/incorporation/logs')
    return response.data
  },

  getDropdownMasters: async () => {
    const response = await axiosInstance.get('/v1/incorporation/dropdown-masters')
    return response.data
  },

  async saveMeeting(meetingData: any) {
    const response = await axiosInstance.post('/v1/incorporation/save-meeting', meetingData);
    return response.data;
  }
}
