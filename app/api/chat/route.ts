import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt, Category, Company, Difficulty } from '@/lib/prompts'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, company, category, difficulty, panel, interviewer } = await req.json()

    let systemPrompt = buildSystemPrompt(company as Company, category as Category, difficulty as Difficulty)

    // Panel mode: modify the system prompt for 2 interviewers
    if (panel && interviewer) {
      const interviewerStyles = {
        1: `\n\n## Panel Mode — You are Interviewer #1
You are the TECHNICAL interviewer. Your name is Alex. You focus on:
- Technical accuracy and depth
- Algorithm efficiency and optimization
- Code quality and edge cases
- You are more direct and probing. You push candidates harder on technical details.
- Your style is precise and analytical. You ask specific follow-ups about complexity, edge cases, and implementation details.
- Start by introducing yourself: "Hi, I'm Alex, I'll be one of your interviewers today alongside my colleague Jordan."`,
        2: `\n\n## Panel Mode — You are Interviewer #2
You are the BEHAVIORAL/COMMUNICATION interviewer. Your name is Jordan. You focus on:
- Communication clarity and structure
- Problem-solving approach and reasoning
- How the candidate handles ambiguity
- You are warmer but still evaluative. You care about HOW the candidate thinks, not just WHAT they say.
- Your style is conversational but probing. You ask about trade-offs, alternatives, and real-world considerations.
- You do NOT re-introduce yourself (Alex already did). Jump straight into your question or follow-up.
- Build on what Alex asked — reference the candidate's previous answers.`,
      }
      systemPrompt += interviewerStyles[interviewer as 1 | 2] || ''
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    return NextResponse.json({ message: content.text })
  } catch (error: unknown) {
    console.error('API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
