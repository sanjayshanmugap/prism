import { NextRequest, NextResponse } from 'next/server'
import { voiceAgent } from '@/lib/mastra/agent'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Convert File to Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    
    // First, transcribe the audio using OpenAI Whisper
    console.log('Transcribing audio with OpenAI Whisper...')
    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
      body: (() => {
        const formData = new FormData()
        formData.append('file', new Blob([audioBuffer], { type: audioFile.type }), audioFile.name)
        formData.append('model', 'whisper-1')
        formData.append('language', 'en')
        return formData
      })(),
    })

    if (!transcriptionResponse.ok) {
      throw new Error(`OpenAI API error: ${transcriptionResponse.status}`)
    }

    const transcriptionResult = await transcriptionResponse.json()
    const transcribedText = transcriptionResult.text

    console.log('Transcription result:', transcribedText)

    // Process the transcription with the Mastra agent
    console.log('Processing transcription with Mastra agent...')
    const result = await voiceAgent.execute({
      prompt: transcribedText,
      additionalContext: {
        audioFile: {
          name: audioFile.name,
          type: audioFile.type,
          size: audioFile.size
        },
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      text: transcribedText,
      language: 'en',
      transcription: transcribedText,
      aiResponse: result.response,
      insights: result.insights || [],
      actions: result.actions || [],
      topics: result.topics || []
    })

  } catch (error) {
    console.error('Voice processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    )
  }
}