"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Pill,
  Users,
  Shield,
  Brain,
  ChevronRight,
  Plus,
  Stethoscope,
  Building2,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import type { UserProfile } from "@/lib/types"

interface AIPromptBuilderProps {
  userProfile: UserProfile
  onPromptGenerated: (prompt: string) => void
}

interface MacroItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  prompt?: string
  children?: MacroItem[]
}

export function AIPromptBuilder({ userProfile, onPromptGenerated }: AIPromptBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  const [providerForm, setProviderForm] = useState({
    mode: "provider" as "provider" | "facility",
    specialty: "Any",
    language: "Any",
    distance_miles: 25,
    gender: "any",
    telehealth: false,
    accepting_new_patients: false,
    attributes: [] as string[],
  })

  // Simplified macro items - max 2 levels deep
  const macroItems: MacroItem[] = [
    {
      id: "find-provider",
      label: "Find a Provider",
      icon: Search,
      children: [
        {
          id: "primary-care",
          label: "Primary Care",
          icon: Stethoscope,
          prompt: `I need to find a primary care provider. I have ${userProfile.insurance} insurance and I'm located in ${userProfile.address}.`,
        },
        {
          id: "specialist",
          label: "Specialist",
          prompt: `I need to find a specialist. I have ${userProfile.insurance} insurance and I'm located in ${userProfile.address}.`,
        },
        {
          id: "urgent-care",
          label: "Urgent Care",
          icon: Building2,
          prompt: `I need to find urgent care facilities near ${userProfile.address}. I have ${userProfile.insurance} insurance.`,
        },
      ],
    },
    {
      id: "medication",
      label: "Medication Help",
      icon: Pill,
      children: [
        {
          id: "cost-savings",
          label: "Cost Savings",
          icon: DollarSign,
          prompt: `I need help reducing medication costs. My current medications are: ${userProfile.medications?.join(", ") || "Lisinopril 10mg, Metformin 500mg"}.`,
        },
        {
          id: "refills",
          label: "Refills",
          icon: RefreshCw,
          prompt: `I need to check refill status for my medications: ${userProfile.medications?.join(", ") || "Lisinopril 10mg, Metformin 500mg"}.`,
        },
        {
          id: "side-effects",
          label: "Side Effects",
          icon: AlertTriangle,
          prompt: "I'm experiencing side effects from my medication and need guidance.",
        },
      ],
    },
    {
      id: "care-team",
      label: "My Care Team",
      icon: Users,
      children: [
        {
          id: "contact-provider",
          label: "Contact Provider",
          prompt: "I need to contact or schedule with one of my care team providers.",
        },
        {
          id: "add-provider",
          label: "Add Provider",
          icon: Plus,
          prompt: "I want to add a new provider to my care team.",
        },
      ],
    },
    {
      id: "benefits",
      label: "Insurance & Benefits",
      icon: Shield,
      children: [
        {
          id: "coverage",
          label: "Coverage Questions",
          prompt: "I have a question about what's covered under my insurance plan.",
        },
        {
          id: "claims",
          label: "Claims & Appeals",
          prompt: "I need help with an insurance claim or want to check claim status.",
        },
        {
          id: "prior-auth",
          label: "Prior Authorization",
          prompt: "I need help with prior authorization for a treatment or medication.",
        },
      ],
    },
    {
      id: "research",
      label: "Deep Research",
      icon: Brain,
      children: [
        {
          id: "general",
          label: "General Health Question",
          prompt: "I have a general health question that needs research.",
        },
        {
          id: "condition",
          label: "My Conditions",
          prompt: `I have a question about ${userProfile.conditions?.join(" or ") || "my health conditions"} and need detailed research.`,
        },
        {
          id: "treatments",
          label: "Treatment Options",
          prompt: "I want to research alternative or additional treatment options.",
        },
      ],
    },
  ]

  const handleItemClick = (item: MacroItem) => {
    if (item.children) {
      setSelectedCategory(item.id)
    } else if (item.prompt) {
      // If user clicked a provider option, enhance with form section
      if (selectedCategory === 'find-provider') {
        // Hand off to form-driven prompt below; do nothing here
        return
      } else {
        onPromptGenerated(item.prompt)
      }
      setIsVisible(false)
    }
  }

  const handleBack = () => {
    setSelectedCategory(null)
  }

  const getCurrentItems = () => {
    if (!selectedCategory) return macroItems
    const category = macroItems.find(item => item.id === selectedCategory)
    return category?.children || []
  }

  const currentItems = getCurrentItems()
  const isRootLevel = !selectedCategory

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl mx-auto"
        >
          <Card className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {!isRootLevel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="w-8 h-8 hover:bg-primary/10"
                  >
                    <Home className="w-4 h-4" />
                  </Button>
                )}
                <h3 className="text-lg font-semibold">
                  {isRootLevel ? "What can I help you with?" : macroItems.find(i => i.id === selectedCategory)?.label}
                </h3>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <motion.div
                key={selectedCategory || "root"}
                initial={{ opacity: 0, x: isRootLevel ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRootLevel ? 0 : -20 }}
                transition={{ duration: 0.15 }}
                className="grid gap-2"
              >
                {currentItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-4 px-4 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {item.icon && (
                        <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      )}
                      <div className="flex-1 text-left">
                        <span className="font-medium block">{item.label}</span>
                        {item.prompt && (
                          <span className="text-xs text-muted-foreground mt-1 block">
                            Click to use this prompt
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.children && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        )}
                      </div>
                    </div>
                  </Button>
                ))}

                {selectedCategory === 'find-provider' && (
                  <div className="mt-3 grid gap-6 rounded-2xl border border-border/30 p-5 bg-background/50">
                    {/* Looking for */}
                    <div className="space-y-2">
                      <Label className="text-sm">I'm looking for a...</Label>
                      <RadioGroup
                        className="flex items-center gap-6"
                        value={providerForm.mode}
                        onValueChange={(v) => setProviderForm(f => ({ ...f, mode: v as any }))}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="provider" id="mode-provider" />
                          <Label htmlFor="mode-provider">Provider</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="facility" id="mode-facility" />
                          <Label htmlFor="mode-facility">Facility</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Specialty / Facility Focus */}
                    <div className="grid gap-2">
                      <Label className="text-sm">Specialty / Facility Focus</Label>
                      <Select
                        value={providerForm.specialty}
                        onValueChange={(v) => setProviderForm(f => ({ ...f, specialty: v }))}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'Any','Primary Care','Pediatrics','Cardiology','Dermatology','Endocrinology','Gastroenterology','Neurology','Oncology','OB/GYN','Psychiatry','Rheumatology','Urgent Care','Physical Therapy','Imaging Center'
                          ].map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language */}
                    <div className="grid gap-2">
                      <Label className="text-sm">Language Spoken</Label>
                      <Select
                        value={providerForm.language}
                        onValueChange={(v) => setProviderForm(f => ({ ...f, language: v }))}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Any','English','Spanish','Chinese','Korean','French','German','Arabic','Russian','Portuguese','Tagalog','Vietnamese'].map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Proximity */}
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Proximity</Label>
                        <span className="text-sm text-muted-foreground">{providerForm.distance_miles} miles</span>
                      </div>
                      <Slider
                        value={[providerForm.distance_miles]}
                        min={5}
                        max={100}
                        step={5}
                        onValueChange={(v)=> setProviderForm(f => ({ ...f, distance_miles: v[0] }))}
                      />
                    </div>

                    {/* Provider Gender */}
                    <div className="space-y-2">
                      <Label className="text-sm">Provider Gender</Label>
                      <RadioGroup
                        className="flex flex-wrap gap-6"
                        value={providerForm.gender}
                        onValueChange={(v) => setProviderForm(f => ({ ...f, gender: v }))}
                      >
                        {[
                          {label:'Any', value:'any'},
                          {label:'Female', value:'female'},
                          {label:'Male', value:'male'},
                          {label:'Non-binary', value:'non-binary'},
                        ].map(opt => (
                          <div key={opt.value} className="flex items-center gap-2">
                            <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} />
                            <Label htmlFor={`gender-${opt.value}`}>{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Additional Attributes */}
                    <div className="grid gap-2">
                      <Label className="text-sm">Additional Attributes</Label>
                      <div className="min-h-[52px] rounded-xl border border-border/40 px-3 py-2 flex items-center gap-2 flex-wrap">
                        {providerForm.attributes.length === 0 ? (
                          <span className="text-sm text-muted-foreground">Select attributes to add them here...</span>
                        ) : (
                          providerForm.attributes.map(attr => (
                            <Badge key={attr} variant="secondary" className="rounded-full">{attr}</Badge>
                          ))
                        )}
                      </div>
                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="rounded-xl">
                              + Add Attributes
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72">
                            <div className="grid gap-2">
                              {[
                                'Accepting New Patients',
                                'Telehealth Available',
                                'Evenings/Weekends',
                                'LGBTQ+ Affirming',
                                'Wheelchair Accessible',
                              ].map(opt => {
                                const checked = providerForm.attributes.includes(opt)
                                return (
                                  <label key={opt} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        setProviderForm(f => ({
                                          ...f,
                                          attributes: e.target.checked
                                            ? [...f.attributes, opt]
                                            : f.attributes.filter(a => a !== opt)
                                        }))
                                      }}
                                    />
                                    {opt}
                                  </label>
                                )
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Generate Prompt */}
                    <div className="flex justify-end pt-2">
                      <Button onClick={() => {
                        const prefs: string[] = []
                        if (providerForm.language && providerForm.language !== 'Any') prefs.push(`language: ${providerForm.language}`)
                        if (providerForm.gender && providerForm.gender !== 'any') prefs.push(`preferred clinician gender: ${providerForm.gender}`)
                        if (providerForm.distance_miles) prefs.push(`within ${providerForm.distance_miles} miles`)
                        if (providerForm.attributes.includes('Telehealth Available')) prefs.push('telehealth available')
                        if (providerForm.attributes.includes('Accepting New Patients')) prefs.push('accepting new patients')
                        const preferencesText = prefs.length ? prefs.join(', ') : 'no additional preferences'

                        const languagesArray = (providerForm.language && providerForm.language !== 'Any') ? [providerForm.language] : []
                        const robustPrompt = `Provider Search Request\nUser context:\n- Location: ${userProfile.address}\n- Insurance: ${userProfile.insurance}\n- Conditions: ${userProfile.conditions?.join(', ') || 'N/A'}\n\nTask:\n- Find the top five ${providerForm.mode === 'provider' ? providerForm.specialty : providerForm.specialty} ${providerForm.mode}.\n- Preferences: ${preferencesText}.\n\nInstructions to Agent:\n1) Call provider_search with the following JSON input:\n   {"specialty": "${providerForm.specialty}", "location": "${userProfile.address}", "insurance": "${userProfile.insurance}", "preferences": {"languages": ${JSON.stringify(languagesArray)}, "gender_preference": "${providerForm.gender === 'any' ? '' : providerForm.gender}", "telehealth": ${providerForm.attributes.includes('Telehealth Available')}, "accepting_new_patients": ${providerForm.attributes.includes('Accepting New Patients')}, "distance_miles": ${Number(providerForm.distance_miles || 0)}}, "top_n": 5}\n2) Render feature cards for each result showing how they match the user's criteria. Allow viewing a detail pane.\n3) Ask the user to pick 1–3 for deep research. Perform deeper research and a head-to-head comparison against user criteria, then recommend one.\n4) After the user agrees, attempt to book online via create_browser_session + browser_use; if unsuccessful, initiate a voice call flow to book.\n5) Stream tool_result updates so the UI renders progress in real time.`
                        onPromptGenerated(robustPrompt)
                        setIsVisible(false)
                      }} className="h-11 px-5">Generate Prompt</Button>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="mt-4 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground text-center">
                  {isRootLevel 
                    ? "Select a category to see more options" 
                    : "Choose an option or go back to categories"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 