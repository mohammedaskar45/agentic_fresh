import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Save, 
  Plus, 
  Trash2, 
  Bot, 
  HelpCircle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { incorporationService } from '@/services/incorporation.service'
import { useWorkflowStore } from '@/stores/workflow-store'

export default function MasterDataForm({ onSuccess }: { onSuccess?: () => void }) {
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  
  const [formData, setFormData] = useState({
    company: {
      proposed_name: '',
      alternative_name: '',
      company_type: 'pvt_ltd',
      main_objects: '',
      ancillary_objects: '',
      authorised_capital: '',
      paid_up_capital: '',
      face_value: '10',
      state: 'Tamil Nadu',
      registered_address: '',
      office_ownership_type: 'Rented',
      office_owner_name: '',
      utility_bill_type: 'Electricity Bill',
      office_email: '',
      office_phone: '',
    },
    stakeholders: [
      {
        id: crypto.randomUUID(),
        full_name: '',
        father_name: '',
        dob: '',
        pan: '',
        aadhaar: '',
        nationality: 'Indian',
        address: '',
        present_address: '',
        permanent_address: '',
        is_permanent_same_as_present: true,
        stay_duration_years: 0,
        stay_duration_months: 0,
        previous_address: '',
        occupation: 'Business',
        occupation_type: 'Self Employed',
        qualification: 'Graduate',
        highest_qualification: '',
        place_of_birth: '',
        designation: 'Director',
        existing_din: '',
        email: '',
        mobile: '',
        shares_subscribed: '',
        other_directorships: [],
      },
    ],
    professionals: {
      ca_cs_name: '',
      membership_no: '',
      auditor_name: '',
      auditor_frn: '',
      auditor_address: '',
      auditor_email: '',
      bank_name: '',
      bank_account: ''
    },
    witness: {
      witness_name: '',
      witness_father_name: '',
      witness_address: '',
      witness_occupation: ''
    }
  })

  const [dropdownMasters, setDropdownMasters] = useState<any[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mdResponse, dmResponse] = await Promise.all([
          incorporationService.getMasterData(),
          incorporationService.getDropdownMasters()
        ])
        
        if (mdResponse) {
          // If response has company property, it's the new formatted structure
          if (mdResponse.company) {
            setFormData(prev => ({
              ...prev,
              ...mdResponse,
              company: { ...prev.company, ...mdResponse.company },
              professionals: { ...prev.professionals, ...mdResponse.professionals },
              witness: { ...prev.witness, ...mdResponse.witness },
              stakeholders: mdResponse.stakeholders || prev.stakeholders
            }))
          } else if (mdResponse.master_data) {
            // Fallback for old structure
            setFormData(prev => ({ ...prev, ...mdResponse.master_data }))
          }
        }
        
        if (dmResponse) {
          setDropdownMasters(dmResponse)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [])

  const addStakeholder = () => {
    setFormData({
      ...formData,
      stakeholders: [
        ...formData.stakeholders,
        {
          id: crypto.randomUUID(),
          full_name: '',
          father_name: '',
          dob: '',
          pan: '',
          aadhaar: '',
          nationality: 'Indian',
          address: '',
          present_address: '',
          permanent_address: '',
          is_permanent_same_as_present: true,
          stay_duration_years: 0,
          stay_duration_months: 0,
          previous_address: '',
          occupation: 'Business',
          occupation_type: 'Self Employed',
          qualification: 'Graduate',
          highest_qualification: '',
          place_of_birth: '',
          designation: 'Director',
          existing_din: '',
          email: '',
          mobile: '',
          shares_subscribed: '',
          other_directorships: [],
        }
      ]
    })
  }

  const removeStakeholder = (id: string) => {
    if (formData.stakeholders.length === 1) return
    setFormData({
      ...formData,
      stakeholders: formData.stakeholders.filter(s => s.id !== id)
    })
  }

  const updateStakeholder = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.map(s => 
        s.id === id ? { 
          ...s, 
          [field]: value,
          // Ensure nested objects remain intact if any
        } : s
      )
    }))
  }

  const handleSave = async () => {
    // Validation based on Section 1.2 of the Specification
    const stakeholderCount = formData.stakeholders.length
    if (formData.company.company_type === 'pvt_ltd') {
      if (stakeholderCount < 2) {
        toast.error('Private Limited Company requires at least 2 Directors/Members (Section 1.2)')
        return
      }
    } else if (formData.company.company_type === 'public_ltd') {
      if (stakeholderCount < 7) {
        toast.error('Public Limited Company requires at least 7 Members/Subscribers (Section 1.2)')
        return
      }
      // Assuming at least 3 directors for public ltd
      const directorCount = formData.stakeholders.filter(s => s.designation.includes('Director')).length
      if (directorCount < 3) {
        toast.error('Public Limited Company requires at least 3 Directors (Section 1.2)')
        return
      }
    }

    setIsProcessing(true)
    try {
      await incorporationService.saveMasterData(formData)
      workflow.completeStep(0)
      toast.success('Step 0: Master Data Profile Finalized!')
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error('Failed to save data. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='space-y-6'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid grid-cols-3 w-full max-w-2xl mx-auto h-12 bg-slate-100 p-1 rounded-xl'>
          <TabsTrigger value='company' className='rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2'>
            <Building2 className='h-4 w-4' /> Company
          </TabsTrigger>
          <TabsTrigger value='stakeholders' className='rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2'>
            <Users className='h-4 w-4' /> Stakeholders
          </TabsTrigger>
          <TabsTrigger value='professionals' className='rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2'>
            <ShieldCheck className='h-4 w-4' /> Professionals
          </TabsTrigger>
        </TabsList>

        <div className='mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8'>
          <div className='lg:col-span-8'>
            {/* Company Details Tab */}
            <TabsContent value='company' className='m-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300'>
              <Card className='border-none shadow-xl'>
                <CardHeader>
                  <CardTitle className='text-xl'>Section 3.1: Proposed Company Details</CardTitle>
                  <CardDescription>Enter primary and alternate names with capital structure.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label>Proposed Company Name *</Label>
                      <Input 
                        placeholder='Ex: ALPHA COMPLIANCE SOLUTIONS' 
                        value={formData.company.proposed_name}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, proposed_name: e.target.value.toUpperCase()}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Alternative Name (Choice 2)</Label>
                      <Input 
                        placeholder='Ex: ALPHA REGULATORY SERVICES' 
                        value={formData.company.alternative_name}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, alternative_name: e.target.value.toUpperCase()}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Type of Company *</Label>
                      <Select value={formData.company.company_type} onValueChange={(val) => setFormData({...formData, company: {...formData.company, company_type: val}})}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dropdownMasters
                            .filter(m => m.category === 'company_type')
                            .map(m => <SelectItem key={m.id} value={m.value}>{m.label}</SelectItem>)}
                          {dropdownMasters.filter(m => m.category === 'company_type').length === 0 && (
                            <>
                              <SelectItem value='pvt_ltd'>Private Limited (Pvt Ltd)</SelectItem>
                              <SelectItem value='public_ltd'>Public Limited (Ltd)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2 md:col-span-2'>
                      <Label>Full Registered Office Address *</Label>
                      <textarea 
                        className='w-full min-h-[80px] p-4 text-sm rounded-md border border-input bg-slate-50/50'
                        placeholder='Complete address as per utility bill...'
                        value={formData.company.registered_address}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, registered_address: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Office Possession Type *</Label>
                      <Select value={formData.company.office_ownership_type} onValueChange={(val) => setFormData({...formData, company: {...formData.company, office_ownership_type: val}})}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Owned'>Owned</SelectItem>
                          <SelectItem value='Rented'>Rented</SelectItem>
                          <SelectItem value='Leased'>Leased</SelectItem>
                          <SelectItem value='Consent'>Consent from Owner (NOC)</SelectItem>
                          <SelectItem value='Shared'>Shared Office / Co-working</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label>Owner Name (as per Bill) *</Label>
                      <Input 
                        value={formData.company.office_owner_name}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, office_owner_name: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Utility Bill Type *</Label>
                      <Select value={formData.company.utility_bill_type} onValueChange={(val) => setFormData({...formData, company: {...formData.company, utility_bill_type: val}})}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Electricity Bill'>Electricity Bill</SelectItem>
                          <SelectItem value='Telephone Bill'>Telephone Bill</SelectItem>
                          <SelectItem value='Gas Bill'>Gas Bill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label>Official Email *</Label>
                      <Input 
                        type='email'
                        value={formData.company.office_email}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, office_email: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-2'>
                      <Label>Authorised Capital (Rs.) *</Label>
                      <Input 
                        type='number' 
                        placeholder='1,00,000' 
                        value={formData.company.authorised_capital}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, authorised_capital: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Paid-up Capital (Rs.) *</Label>
                      <Input 
                        type='number' 
                        placeholder='10,000' 
                        value={formData.company.paid_up_capital}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, paid_up_capital: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Face Value per Share *</Label>
                      <Input 
                        type='number' 
                        value={formData.company.face_value}
                        onChange={(e) => setFormData({...formData, company: {...formData.company, face_value: e.target.value}})}
                      />
                    </div>
                    {/* Preference Capital Section */}
                    <div className='space-y-2'>
                      <Label>Preference Capital (Optional)</Label>
                      <Input 
                        type='number'
                        value={formData.capital?.preference_capital || 0} 
                        onChange={(e) => setFormData({...formData, capital: {...formData.capital, preference_capital: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Pref. Face Value</Label>
                      <Input 
                        type='number'
                        value={formData.capital?.preference_face_value || 10} 
                        onChange={(e) => setFormData({...formData, capital: {...formData.capital, preference_face_value: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2'>
                      Main Objects / Business *
                      <HelpCircle className='h-3 w-3 text-slate-400' />
                    </Label>
                    <textarea 
                      className='w-full min-h-[100px] p-4 text-sm rounded-md border border-input bg-slate-50/50'
                      placeholder='Describe the core business activities for MoA...'
                      value={formData.company.main_objects}
                      onChange={(e) => setFormData({...formData, company: {...formData.company, main_objects: e.target.value}})}
                    />
                  </div>
                  
                  <Button className='w-full mt-4 gap-2' onClick={() => setActiveTab('stakeholders')}>
                    Next: Stakeholders <ChevronRight className='h-4 w-4' />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stakeholders Tab */}
            <TabsContent value='stakeholders' className='m-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300'>
              <div className='space-y-6'>
                {formData.stakeholders.map((s, index) => (
                  <Card key={s.id} className='border-none shadow-xl relative overflow-hidden'>
                    <div className='absolute top-0 left-0 w-1 h-full bg-indigo-500' />
                    <CardHeader className='flex flex-row items-center justify-between bg-slate-50/50'>
                      <CardTitle className='text-lg'>Stakeholder {index + 1}: Director/Subscriber</CardTitle>
                      {formData.stakeholders.length > 1 && (
                        <Button variant='ghost' size='icon' className='text-red-500' onClick={() => removeStakeholder(s.id)}>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className='pt-6 space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                          <Label>Full Name * (As per PAN)</Label>
                          <Input 
                            value={s.full_name} 
                            onChange={(e) => updateStakeholder(s.id, 'full_name', e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Father's Name *</Label>
                          <Input 
                            value={s.father_name} 
                            onChange={(e) => updateStakeholder(s.id, 'father_name', e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Date of Birth *</Label>
                          <Input 
                            type='date'
                            value={s.dob} 
                            onChange={(e) => updateStakeholder(s.id, 'dob', e.target.value)}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>PAN Number *</Label>
                          <Input 
                            maxLength={10}
                            value={s.pan} 
                            onChange={(e) => updateStakeholder(s.id, 'pan', e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Place of Birth *</Label>
                          <Input 
                            placeholder='City/Town'
                            value={s.place_of_birth} 
                            onChange={(e) => updateStakeholder(s.id, 'place_of_birth', e.target.value)}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Educational Qualification *</Label>
                          <Select value={s.qualification} onValueChange={(val) => updateStakeholder(s.id, 'qualification', val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dropdownMasters
                                .filter(m => m.category === 'qualification')
                                .map(m => <SelectItem key={m.id} value={m.value}>{m.label}</SelectItem>)}
                              {dropdownMasters.filter(m => m.category === 'qualification').length === 0 && (
                                <>
                                  <SelectItem value='Under Graduate'>Under Graduate</SelectItem>
                                  <SelectItem value='Graduate'>Graduate</SelectItem>
                                  <SelectItem value='Post Graduate'>Post Graduate</SelectItem>
                                  <SelectItem value='Professional'>Professional (CA/CS/CWA)</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label>Occupation Type *</Label>
                          <Select value={s.occupation_type} onValueChange={(val) => updateStakeholder(s.id, 'occupation_type', val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dropdownMasters
                                .filter(m => m.category === 'occupation_type')
                                .map(m => <SelectItem key={m.id} value={m.value}>{m.label}</SelectItem>)}
                              {dropdownMasters.filter(m => m.category === 'occupation_type').length === 0 && (
                                <>
                                  <SelectItem value='Self Employed'>Self Employed</SelectItem>
                                  <SelectItem value='Professional'>Professional</SelectItem>
                                  <SelectItem value='Business'>Business</SelectItem>
                                  <SelectItem value='Housewife'>Housewife</SelectItem>
                                  <SelectItem value='Student'>Student</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label>Shares to Subscribe *</Label>
                          <Input 
                            type='number'
                            placeholder='Ex: 500'
                            value={s.shares_subscribed} 
                            onChange={(e) => updateStakeholder(s.id, 'shares_subscribed', e.target.value)}
                          />
                        </div>
                        <div className='flex items-center space-x-2'>
                          <input 
                            type='checkbox' 
                            checked={s.is_foreign_national} 
                            onChange={(e) => updateStakeholder(s.id, 'is_foreign_national', e.target.checked)}
                          />
                          <Label className='text-xs'>Is Foreign National? (Passport Mandatory)</Label>
                        </div>
                        {s.is_foreign_national && (
                          <>
                            <div className='space-y-2'>
                              <Label>Passport Number *</Label>
                              <Input 
                                value={s.passport_number} 
                                onChange={(e) => updateStakeholder(s.id, 'passport_number', e.target.value.toUpperCase())}
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label>OCI / PIO Number (if any)</Label>
                              <Input 
                                value={s.oci_number} 
                                onChange={(e) => updateStakeholder(s.id, 'oci_number', e.target.value.toUpperCase())}
                              />
                            </div>
                          </>
                        )}
                        <div className='space-y-2'>
                          <Label>Designation *</Label>
                          <Select value={s.designation} onValueChange={(val) => updateStakeholder(s.id, 'designation', val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dropdownMasters
                                .filter(m => m.category === 'designation')
                                .map(m => <SelectItem key={m.id} value={m.value}>{m.label}</SelectItem>)}
                              {dropdownMasters.filter(m => m.category === 'designation').length === 0 && (
                                <>
                                  <SelectItem value='Director'>Director</SelectItem>
                                  <SelectItem value='Managing Director'>Managing Director</SelectItem>
                                  <SelectItem value='Whole-time Director'>Whole-time Director</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label>Existing DIN (if any)</Label>
                          <Input 
                            placeholder='Leave blank if new DIN'
                            value={s.existing_din} 
                            onChange={(e) => updateStakeholder(s.id, 'existing_din', e.target.value)}
                          />
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                          <Label>Present Residential Address *</Label>
                          <textarea 
                            className='w-full min-h-[60px] p-3 text-sm rounded-md border border-input bg-slate-50/50'
                            value={s.present_address} 
                            onChange={(e) => updateStakeholder(s.id, 'present_address', e.target.value)}
                          />
                        </div>
                        <div className='flex items-center space-x-2 md:col-span-2'>
                          <input 
                            type='checkbox' 
                            checked={s.is_permanent_same_as_present} 
                            onChange={(e) => updateStakeholder(s.id, 'is_permanent_same_as_present', e.target.checked)}
                          />
                          <Label className='text-xs'>Permanent Address is same as Present Address</Label>
                        </div>
                        {!s.is_permanent_same_as_present && (
                          <div className='space-y-2 md:col-span-2'>
                            <Label>Permanent Residential Address *</Label>
                            <textarea 
                              className='w-full min-h-[60px] p-3 text-sm rounded-md border border-input bg-slate-50/50'
                              value={s.permanent_address} 
                              onChange={(e) => updateStakeholder(s.id, 'permanent_address', e.target.value)}
                            />
                          </div>
                        )}
                        <div className='space-y-2'>
                          <Label>Stay Duration at Present Address (Years) *</Label>
                          <Input 
                            type='number'
                            value={s.stay_duration_years} 
                            onChange={(e) => updateStakeholder(s.id, 'stay_duration_years', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        {Number(s.stay_duration_years) < 1 && (
                          <div className='space-y-2 md:col-span-2'>
                            <Label>Previous Residential Address * (Required if stay &lt; 1yr)</Label>
                            <textarea 
                              className='w-full min-h-[60px] p-3 text-sm rounded-md border border-input bg-slate-50/50'
                              value={s.previous_address} 
                              onChange={(e) => updateStakeholder(s.id, 'previous_address', e.target.value)}
                            />
                          </div>
                        )}
                        <div className='space-y-2'>
                          <Label>Highest Educational Qualification *</Label>
                          <Input 
                            placeholder='Ex: M.Tech / MBA / PhD'
                            value={s.highest_qualification} 
                            onChange={(e) => updateStakeholder(s.id, 'highest_qualification', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button variant='outline' className='w-full border-dashed py-8 gap-2 text-indigo-600' onClick={addStakeholder}>
                  <Plus className='h-5 w-5' /> Add Another Stakeholder
                </Button>

                <div className='flex justify-between'>
                  <Button variant='ghost' onClick={() => setActiveTab('company')}>Back</Button>
                  <Button className='gap-2' onClick={() => setActiveTab('professionals')}>
                    Next: Professionals <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Professionals Tab */}
            <TabsContent value='professionals' className='m-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300'>
              <Card className='border-none shadow-xl'>
                <CardHeader>
                  <CardTitle className='text-xl'>Section 3.3: Professional & Auditor Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label>Certifying CA/CS Name *</Label>
                      <Input 
                        value={formData.professionals.ca_cs_name}
                        onChange={(e) => setFormData({...formData, professionals: {...formData.professionals, ca_cs_name: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Membership No. *</Label>
                      <Input 
                        value={formData.professionals.membership_no}
                        onChange={(e) => setFormData({...formData, professionals: {...formData.professionals, membership_no: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Proposed First Auditor *</Label>
                      <Input 
                        value={formData.professionals.auditor_name}
                        onChange={(e) => setFormData({...formData, professionals: {...formData.professionals, auditor_name: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Auditor Firm Reg. No. (FRN) *</Label>
                      <Input 
                        value={formData.professionals.auditor_frn}
                        onChange={(e) => setFormData({...formData, professionals: {...formData.professionals, auditor_frn: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Auditor Address *</Label>
                      <Input 
                        value={formData.professionals.auditor_address}
                        onChange={(e) => setFormData({...formData, professionals: {...formData.professionals, auditor_address: e.target.value}})}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Auditor Email *</Label>
                      <Input 
                        type='email'
                        value={formData.professionals.auditor_email}
                        onChange={(e) => setFormData({...formData, professionals: {...formData.professionals, auditor_email: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className='pt-6 border-t space-y-6'>
                    <h3 className='text-lg font-bold flex items-center gap-2'>
                      <Users className='h-5 w-5 text-indigo-600' /> MoA / AoA Witness Details
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <Label>Witness Full Name *</Label>
                        <Input 
                          value={formData.witness.witness_name}
                          onChange={(e) => setFormData({...formData, witness: {...formData.witness, witness_name: e.target.value.toUpperCase()}})}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Witness Father's Name *</Label>
                        <Input 
                          value={formData.witness.witness_father_name}
                          onChange={(e) => setFormData({...formData, witness: {...formData.witness, witness_father_name: e.target.value.toUpperCase()}})}
                        />
                      </div>
                      <div className='space-y-2 md:col-span-2'>
                        <Label>Witness Residential Address *</Label>
                        <textarea 
                          className='w-full min-h-[60px] p-3 text-sm rounded-md border border-input bg-slate-50/50'
                          value={formData.witness.witness_address}
                          onChange={(e) => setFormData({...formData, witness: {...formData.witness, witness_address: e.target.value}})}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Witness Occupation *</Label>
                        <Input 
                          value={formData.witness.witness_occupation}
                          onChange={(e) => setFormData({...formData, witness: {...formData.witness, witness_occupation: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='pt-6 border-t'>
                    <Button 
                      className='w-full bg-indigo-600 hover:bg-indigo-700 h-12 shadow-lg shadow-indigo-600/20 gap-2'
                      onClick={handleSave}
                      disabled={isProcessing}
                    >
                      <Save className='h-5 w-5' /> {isProcessing ? 'Saving Profile...' : 'Complete Master Data Profiling'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className='lg:col-span-4 space-y-6'>
            <Card className='bg-indigo-600/5 border-indigo-600/10 shadow-none'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm flex items-center gap-2 text-indigo-800'>
                  <Bot className='h-4 w-4' />
                  AI Profiler Insight
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-xs leading-relaxed text-indigo-900/80 italic'>
                  "I am validating the capital structure. For Private Limited companies, there is no minimum capital requirement, but ensure the Authorized Capital covers your initial subscription amount."
                </p>
                <div className='p-3 bg-white/50 rounded-lg border border-indigo-100 flex items-start gap-2'>
                  <Info className='h-4 w-4 text-indigo-500 mt-0.5' />
                  <p className='text-[10px] text-indigo-800 font-medium'>
                    The data entered here will automatically pre-fill DIR-2, INC-9, and the SPICe+ integrated form.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className='space-y-3'>
              <h3 className='text-xs font-bold uppercase text-slate-400 tracking-wider'>Completion Checklist</h3>
              {[
                { label: 'Company Profile', done: formData.company.proposed_name.length > 3 },
                { label: 'Director Identifiers', done: formData.stakeholders.every(s => s.pan.length === 10) },
                { label: 'Professional Certification', done: formData.professionals.ca_cs_name.length > 3 }
              ].map((item, i) => (
                <div key={i} className='flex items-center gap-2 text-sm'>
                  {item.done ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <div className='h-4 w-4 rounded-full border-2 border-slate-200' />}
                  <span className={item.done ? 'text-slate-600' : 'text-slate-400'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
