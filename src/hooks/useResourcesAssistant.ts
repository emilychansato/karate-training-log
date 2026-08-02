import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface AssistantSource {
  title: string
  url: string
}

export interface AssistantAnswer {
  question: string
  answer: string
  sources: AssistantSource[]
}

export function useResourcesAssistant() {
  const [history, setHistory] = useState<AssistantAnswer[]>([])
  const [asking, setAsking] = useState(false)

  async function ask(question: string) {
    setAsking(true)
    const { data, error } = await supabase.functions.invoke('ask-resources', {
      body: { question },
    })
    setAsking(false)

    if (error) return { error: error.message }

    setHistory((prev) => [...prev, { question, answer: data.answer, sources: data.sources ?? [] }])
    return { error: null }
  }

  return { history, asking, ask }
}
