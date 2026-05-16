import { useState, useEffect } from 'react'
import { incorporationService } from '@/services/incorporation.service'
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
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { useWorkflowStore } from '@/stores/workflow-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MasterDataForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const workflow = useWorkflowStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('company')

  const [formData, setFormData] = useState({
    company: {
      proposed_name: '',
      alternative_name: '',
      cin: '', // Added CIN field
      company_type: 'pvt_ltd',
      main_objects: '',
      ancillary_objects: '',
      authorised_capital: '',
      paid_up_capital: '',
      face_value: '10',
      state: 'Tamil Nadu',
      registered_address: '',
      official_email: '',
      bank_name: '',
      police_station: '',
      jurisdiction: '',
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
        residential_address: '',
        occupation: 'Business',
        email_id: '',
        mobile_number: '',
        existing_din: '',
        designation: 'Director',
        share_subscription: '',
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
      bank_account: '',
    },
    witness: {
      witness_name: '',
      witness_father_name: '',
      witness_address: '',
      witness_occupation: '',
    },
  })

  const [dropdownMasters, setDropdownMasters] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mdResponse, dmResponse] = await Promise.all([
          incorporationService.getMasterData(),
          incorporationService.getDropdownMasters(),
        ])

        if (mdResponse) {
          // If response has company property, it's the new formatted structure
          if (mdResponse.company) {
            setFormData((prev) => ({
              ...prev,
              ...mdResponse,
              company: { ...prev.company, ...mdResponse.company },
              professionals: {
                ...prev.professionals,
                ...mdResponse.professionals,
              },
              witness: { ...prev.witness, ...mdResponse.witness },
              stakeholders: mdResponse.stakeholders || prev.stakeholders,
            }))
          } else if (mdResponse.master_data) {
            // Fallback for old structure
            setFormData((prev) => ({ ...prev, ...mdResponse.master_data }))
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
          residential_address: '',
          occupation: 'Business',
          email_id: '',
          mobile_number: '',
          existing_din: '',
          designation: 'Director',
          share_subscription: '',
        },
      ],
    })
  }

  const removeStakeholder = (id: string) => {
    if (formData.stakeholders.length === 1) return
    setFormData({
      ...formData,
      stakeholders: formData.stakeholders.filter((s) => s.id !== id),
    })
  }

  const updateStakeholder = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      stakeholders: prev.stakeholders.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]: value,
              // Ensure nested objects remain intact if any
            }
          : s
      ),
    }))
  }

  const handleSave = async () => {
    // Validation based on Section 1.2 of the Specification
    const stakeholderCount = formData.stakeholders.length
    if (formData.company.company_type === 'pvt_ltd') {
      if (stakeholderCount < 2) {
        toast.error(
          'Private Limited Company requires at least 2 Directors/Members (Section 1.2)'
        )
        return
      }
    } else if (formData.company.company_type === 'public_ltd') {
      if (stakeholderCount < 7) {
        toast.error(
          'Public Limited Company requires at least 7 Members/Subscribers (Section 1.2)'
        )
        return
      }
      // Assuming at least 3 directors for public ltd
      const directorCount = formData.stakeholders.filter((s) =>
        s.designation.includes('Director')
      ).length
      if (directorCount < 3) {
        toast.error(
          'Public Limited Company requires at least 3 Directors (Section 1.2)'
        )
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
        <TabsList className='mx-auto grid h-12 w-full max-w-2xl grid-cols-3 rounded-xl bg-slate-100 p-1'>
          <TabsTrigger
            value='company'
            className='gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm'
          >
            <Building2 className='h-4 w-4' /> Company
          </TabsTrigger>
          <TabsTrigger
            value='stakeholders'
            className='gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm'
          >
            <Users className='h-4 w-4' /> Stakeholders
          </TabsTrigger>
          <TabsTrigger
            value='professionals'
            className='gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm'
          >
            <ShieldCheck className='h-4 w-4' /> Professionals
          </TabsTrigger>
        </TabsList>

        <div className='mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='lg:col-span-8'>
            {/* Company Details Tab */}
            <TabsContent
              value='company'
              className='m-0 animate-in space-y-6 duration-300 fade-in slide-in-from-left-4'
            >
              <Card className='border-none shadow-xl'>
                <CardHeader>
                  <CardTitle className='text-xl'>
                    Proposed Company Details
                  </CardTitle>
                  <CardDescription>
                    Enter primary and alternate names with capital structure.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label>Proposed Company Name *</Label>
                      <Input
                        placeholder='Ex: ALPHA COMPLIANCE SOLUTIONS'
                        value={formData.company.proposed_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              proposed_name: e.target.value.toUpperCase(),
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Alternative Name (Choice 2)</Label>
                      <Input
                        placeholder='Ex: ALPHA REGULATORY SERVICES'
                        value={formData.company.alternative_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              alternative_name: e.target.value.toUpperCase(),
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Type of Company *</Label>
                      <Select
                        value={formData.company.company_type}
                        onValueChange={(val) =>
                          setFormData({
                            ...formData,
                            company: { ...formData.company, company_type: val },
                          })
                        }
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dropdownMasters
                            .filter((m) => m.category === 'company_type')
                            .map((m) => (
                              <SelectItem key={m.id} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          <>
                            <SelectItem value='pvt_ltd'>
                              Private Limited (Pvt Ltd)
                            </SelectItem>
                            <SelectItem value='public_ltd'>
                              Public Limited (Ltd)
                            </SelectItem>
                            <SelectItem value='opc'>
                              One Person Company (OPC)
                            </SelectItem>
                            <SelectItem value='section_8'>
                              Section 8 Company
                            </SelectItem>
                          </>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2 md:col-span-2'>
                      <Label>Full Registered Office Address *</Label>
                      <textarea
                        className='min-h-[80px] w-full rounded-md border border-input bg-slate-50/50 p-4 text-sm'
                        placeholder='Complete address as per utility bill...'
                        value={formData.company.registered_address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              registered_address: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Official Email *</Label>
                      <Input
                        type='email'
                        value={formData.company.official_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              official_email: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='flex items-center gap-2'>
                        Corporate Identity Number (CIN)
                        <Badge variant='outline' className='text-[10px]'>
                          Post-COI Only
                        </Badge>
                      </Label>
                      <Input
                        placeholder='Ex: U74999TN2024PTC123456'
                        value={formData.company.cin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              cin: e.target.value.toUpperCase(),
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <div className='space-y-2'>
                      <Label>Authorised Capital (Rs.) *</Label>
                      <Input
                        type='number'
                        placeholder='1,00,000'
                        value={formData.company.authorised_capital}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              authorised_capital: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Paid-up Capital (Rs.) *</Label>
                      <Input
                        type='number'
                        placeholder='10,000'
                        value={formData.company.paid_up_capital}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              paid_up_capital: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Face Value per Share *</Label>
                      <Input
                        type='number'
                        value={formData.company.face_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: {
                              ...formData.company,
                              face_value: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2'>
                      Main Objects / Business *
                      <HelpCircle className='h-3 w-3 text-slate-400' />
                    </Label>
                    <textarea
                      className='min-h-[100px] w-full rounded-md border border-input bg-slate-50/50 p-4 text-sm'
                      placeholder='Describe the core business activities for MoA...'
                      value={formData.company.main_objects}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company: {
                            ...formData.company,
                            main_objects: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className='space-y-6 border-t pt-6'>
                    <div className='flex items-center gap-2 text-indigo-800'>
                      <ShieldCheck className='h-5 w-5' />
                      <h3 className='text-sm font-bold tracking-wider uppercase'>
                        Statutory & Banking Details (for AGILE-PRO-S)
                      </h3>
                    </div>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label>Proposed Bank Name *</Label>
                        <Select
                          value={formData.company.bank_name}
                          onValueChange={(val) =>
                            setFormData({
                              ...formData,
                              company: { ...formData.company, bank_name: val },
                              professionals: {
                                ...formData.professionals,
                                bank_name: val,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Select Bank' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='ICICI Bank'>
                              ICICI Bank
                            </SelectItem>
                            <SelectItem value='HDFC Bank'>HDFC Bank</SelectItem>
                            <SelectItem value='State Bank of India'>
                              State Bank of India
                            </SelectItem>
                            <SelectItem value='Axis Bank'>Axis Bank</SelectItem>
                            <SelectItem value='Kotak Mahindra Bank'>
                              Kotak Mahindra Bank
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-2'>
                        <Label>Account Preference (e.g. Current) *</Label>
                        <Input
                          placeholder='Current Account'
                          value={formData.professionals.bank_account}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              professionals: {
                                ...formData.professionals,
                                bank_account: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Police Station Limit *</Label>
                        <Input
                          placeholder='Ex: Teynampet Police Station'
                          value={formData.company.police_station}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: {
                                ...formData.company,
                                police_station: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2 md:col-span-2'>
                        <Label>Local Jurisdiction / Ward / Division *</Label>
                        <Input
                          placeholder='Ex: Ward 112, Division 4, Chennai'
                          value={formData.company.jurisdiction}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: {
                                ...formData.company,
                                jurisdiction: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className='mt-4 h-12 w-full gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800'
                    onClick={() => setActiveTab('stakeholders')}
                  >
                    Continue to Stakeholders{' '}
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stakeholders Tab */}
            <TabsContent
              value='stakeholders'
              className='m-0 animate-in space-y-6 duration-300 fade-in slide-in-from-left-4'
            >
              <div className='space-y-6'>
                {formData.stakeholders.map((s, index) => (
                  <Card
                    key={s.id}
                    className='relative overflow-hidden border-none shadow-xl'
                  >
                    <div className='absolute top-0 left-0 h-full w-1 bg-primary' />
                    <CardHeader className='flex flex-row items-center justify-between bg-slate-50/50'>
                      <CardTitle className='text-lg'>
                        Stakeholder {index + 1}: Director/Subscriber
                      </CardTitle>
                      {formData.stakeholders.length > 1 && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-red-500'
                          onClick={() => removeStakeholder(s.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className='space-y-6 pt-6'>
                      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <Label>Full Name * (As per PAN)</Label>
                          <Input
                            value={s.full_name}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'full_name',
                                e.target.value.toUpperCase()
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Father's Name *</Label>
                          <Input
                            value={s.father_name}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'father_name',
                                e.target.value.toUpperCase()
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Date of Birth *</Label>
                          <Input
                            type='date'
                            value={s.dob}
                            onChange={(e) =>
                              updateStakeholder(s.id, 'dob', e.target.value)
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>PAN Number *</Label>
                          <Input
                            maxLength={10}
                            value={s.pan}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'pan',
                                e.target.value.toUpperCase()
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Aadhaar Number (Optional)</Label>
                          <Input
                            maxLength={12}
                            value={s.aadhaar}
                            onChange={(e) =>
                              updateStakeholder(s.id, 'aadhaar', e.target.value)
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Nationality *</Label>
                          <Input
                            value={s.nationality}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'nationality',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Occupation *</Label>
                          <Input
                            value={s.occupation}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'occupation',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Shares to Subscribe *</Label>
                          <Input
                            type='number'
                            placeholder='Ex: 500'
                            value={s.share_subscription}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'share_subscription',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Email ID *</Label>
                          <Input
                            type='email'
                            value={s.email_id}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'email_id',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Mobile Number *</Label>
                          <Input
                            value={s.mobile_number}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'mobile_number',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>Designation *</Label>
                          <Select
                            value={s.designation}
                            onValueChange={(val) =>
                              updateStakeholder(s.id, 'designation', val)
                            }
                          >
                            <SelectTrigger className='w-full'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='Director'>Director</SelectItem>
                              <SelectItem value='Managing Director'>
                                Managing Director
                              </SelectItem>
                              <SelectItem value='Whole-time Director'>
                                Whole-time Director
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label>Existing DIN (if any)</Label>
                          <Input
                            placeholder='Leave blank if new DIN'
                            value={s.existing_din}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'existing_din',
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                          <Label>Residential Address *</Label>
                          <textarea
                            className='min-h-[60px] w-full rounded-md border border-input bg-slate-50/50 p-3 text-sm'
                            value={s.residential_address}
                            onChange={(e) =>
                              updateStakeholder(
                                s.id,
                                'residential_address',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant='outline'
                  className='w-full gap-2 border-dashed py-8 text-primary border-primary/20 hover:bg-primary/5'
                  onClick={addStakeholder}
                >
                  <Plus className='h-5 w-5' /> Add Another Stakeholder
                </Button>

                <div className='flex justify-between'>
                  <Button
                    variant='ghost'
                    onClick={() => setActiveTab('company')}
                  >
                    Back
                  </Button>
                  <Button
                    className='gap-2'
                    onClick={() => setActiveTab('professionals')}
                  >
                    Next: Professionals <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Professionals Tab */}
            <TabsContent
              value='professionals'
              className='m-0 animate-in space-y-6 duration-300 fade-in slide-in-from-left-4'
            >
              <Card className='border-none shadow-xl'>
                <CardHeader>
                  <CardTitle className='text-xl'>
                    Section 3.3: Professional & Auditor Details
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label>Certifying CA/CS Name *</Label>
                      <Input
                        value={formData.professionals.ca_cs_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionals: {
                              ...formData.professionals,
                              ca_cs_name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Membership No. *</Label>
                      <Input
                        value={formData.professionals.membership_no}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionals: {
                              ...formData.professionals,
                              membership_no: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Proposed First Auditor *</Label>
                      <Input
                        value={formData.professionals.auditor_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionals: {
                              ...formData.professionals,
                              auditor_name: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Auditor Firm Reg. No. (FRN) *</Label>
                      <Input
                        value={formData.professionals.auditor_frn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionals: {
                              ...formData.professionals,
                              auditor_frn: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Auditor Address *</Label>
                      <Input
                        value={formData.professionals.auditor_address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionals: {
                              ...formData.professionals,
                              auditor_address: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Auditor Email *</Label>
                      <Input
                        type='email'
                        value={formData.professionals.auditor_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            professionals: {
                              ...formData.professionals,
                              auditor_email: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='space-y-6 border-t pt-6'>
                    <h3 className='flex items-center gap-2 text-lg font-bold'>
                      <Users className='h-5 w-5 text-indigo-600' /> MoA / AoA
                      Witness Details
                    </h3>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <Label>Witness Full Name *</Label>
                        <Input
                          value={formData.witness.witness_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              witness: {
                                ...formData.witness,
                                witness_name: e.target.value.toUpperCase(),
                              },
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Witness Father's Name *</Label>
                        <Input
                          value={formData.witness.witness_father_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              witness: {
                                ...formData.witness,
                                witness_father_name:
                                  e.target.value.toUpperCase(),
                              },
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2 md:col-span-2'>
                        <Label>Witness Residential Address *</Label>
                        <textarea
                          className='min-h-[60px] w-full rounded-md border border-input bg-slate-50/50 p-3 text-sm'
                          value={formData.witness.witness_address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              witness: {
                                ...formData.witness,
                                witness_address: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Witness Occupation *</Label>
                        <Input
                          value={formData.witness.witness_occupation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              witness: {
                                ...formData.witness,
                                witness_occupation: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className='border-t pt-6'>
                    <Button
                      className='h-12 w-full gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90'
                      onClick={handleSave}
                      disabled={isProcessing}
                    >
                      <Save className='h-5 w-5' />{' '}
                      {isProcessing
                        ? 'Saving Profile...'
                        : 'Complete Master Data Profiling'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className='space-y-6 lg:col-span-4'>
            <Card className='border-indigo-600/10 bg-indigo-600/5 shadow-none'>
              <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-sm text-indigo-800'>
                  <Bot className='h-4 w-4' />
                  AI Profiler Insight
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='text-xs leading-relaxed text-indigo-900/80 italic'>
                  "I am validating the capital structure. For Private Limited
                  companies, there is no minimum capital requirement, but ensure
                  the Authorized Capital covers your initial subscription
                  amount."
                </p>
                <div className='flex items-start gap-2 rounded-lg border border-indigo-100 bg-white/50 p-3'>
                  <Info className='mt-0.5 h-4 w-4 text-indigo-500' />
                  <p className='text-[10px] font-medium text-indigo-800'>
                    The data entered here will automatically pre-fill DIR-2,
                    INC-9, and the SPICe+ integrated form.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className='space-y-3'>
              <h3 className='text-xs font-bold tracking-wider text-slate-400 uppercase'>
                Completion Checklist
              </h3>
              {[
                {
                  label: 'Company Profile',
                  done: formData.company.proposed_name.length > 3,
                },
                {
                  label: 'Director Identifiers',
                  done: formData.stakeholders.every((s) => s.pan.length === 10),
                },
                {
                  label: 'Professional Certification',
                  done: formData.professionals.ca_cs_name.length > 3,
                },
              ].map((item, i) => (
                <div key={i} className='flex items-center gap-2 text-sm'>
                  {item.done ? (
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                  ) : (
                    <div className='h-4 w-4 rounded-full border-2 border-slate-200' />
                  )}
                  <span
                    className={item.done ? 'text-slate-600' : 'text-slate-400'}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
