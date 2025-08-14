export interface MacroPrompt {
  id: string
  shortPrompt: string
  longPrompt: string
  variables: string[]
}

export const promptData: Array<{
  id: string
  name: string
  prompts: MacroPrompt[]
}> = [
  {
    id: 'provider',
    name: 'Find a Provider',
    prompts: [
      {
        id: 'provider_search',
        shortPrompt: 'Provider Search',
        longPrompt:
          'Provider Search Request\nUser context:\n- Location: [location]\n- Insurance: [insurance]\n\nTask:\n- Find the top five [specialty] providers near [location].\n- Preferences: language: [language], preferred clinician gender: [gender], within [distance_miles] miles.\n\nInstructions to Agent:\n1) Call provider_search with the provided JSON.\n2) Render cards, allow details.\n3) Ask the user to pick 1–3 for deep research, compare head-to-head, recommend one.\n4) Attempt to schedule via browser_use; if that fails, initiate voice booking.\n5) Stream tool_result updates.',
        variables: ['specialty','location','insurance','language','gender','distance_miles'],
      },
    ],
  },
  {
    id: 'medications',
    name: 'Medications',
    prompts: [
      {
        id: 'cost_savings',
        shortPrompt: 'Cost Savings',
        longPrompt:
          'Help me reduce the cost of: [medications]. Use clinical_operations and FDA tools as needed. Provide steps and citations.',
        variables: ['medications'],
      },
    ],
  },
]