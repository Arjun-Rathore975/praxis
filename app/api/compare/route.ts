import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { transcript, company, category, difficulty } = await req.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are an expert FAANG interview coach. Analyze the following interview transcript and produce a comparison between what the candidate said vs what a Strong Hire candidate would have said.

For each major question/topic in the interview, produce a comparison. Focus on the 2-3 most important exchanges — not every single message.

Return ONLY valid JSON in this exact format (no markdown, no code fences, just raw JSON):
[
  {
    "question": "Brief summary of what the interviewer asked",
    "yourAnswer": "Brief summary of what the candidate said (2-3 sentences max)",
    "idealAnswer": "What a Strong Hire candidate would have said at a ${company} ${category} interview at ${difficulty} level (2-3 sentences, specific and actionable)",
    "gap": "One sentence explaining specifically what was missing from the candidate's answer"
  }
]

Return 2-3 comparisons maximum. Be specific and actionable — don't give generic advice.`,
      messages: [
        {
          role: 'user',
          content: `Here is the interview transcript:\n\n${transcript
            .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'}: ${m.content}`)
            .join('\n\n')}`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    try {
      // Try to parse the response as JSON directly
      let text = content.text.trim()
      // Strip markdown code fences if present
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      const comparisons = JSON.parse(text)
      return NextResponse.json({ comparisons })
    } catch {
      return NextResponse.json({ comparisons: [] })
    }
  } catch (error: unknown) {
    console.error('Compare API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
