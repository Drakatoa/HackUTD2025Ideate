/**
 * Test endpoint for Nemotron API connection
 * Visit: http://localhost:3000/api/test
 */

import { createNemotronClient, getTextModelId, getVisionModelId } from '@/lib/nemotron/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Debug: Log all env vars that start with NEMOTRON
    const nemotronEnvVars = Object.keys(process.env)
      .filter(key => key.startsWith('NEMOTRON'))
      .reduce((acc, key) => {
        const value = process.env[key]
        acc[key] = key === 'NEMOTRON_API_KEY' 
          ? (value ? `${value.substring(0, 10)}...` : 'NOT SET')
          : (value || 'NOT SET')
        return acc
      }, {} as Record<string, string>)

    // Check if API key is configured
    if (!process.env.NEMOTRON_API_KEY || process.env.NEMOTRON_API_KEY === 'your_nvidia_api_key_here') {
      return NextResponse.json(
        {
          success: false,
          error: 'NEMOTRON_API_KEY is not set. Please add it to your .env.local file.',
          instructions: 'See SETUP_NEMOTRON.md for instructions',
          debug: {
            envVars: nemotronEnvVars,
            allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEMOTRON')),
            hasApiKey: !!process.env.NEMOTRON_API_KEY,
            apiKeyLength: process.env.NEMOTRON_API_KEY?.length || 0,
          },
          troubleshooting: [
            '1. Make sure .env.local is in the project root (same directory as package.json)',
            '2. Restart your Next.js dev server completely (stop and start again)',
            '3. Check that .env.local has no extra spaces or quotes around the API key',
            '4. Verify the variable name is exactly: NEMOTRON_API_KEY',
          ],
        },
        { status: 500 }
      )
    }

    // Debug: Log what env vars we're actually seeing
    console.log('DEBUG - Environment Variables:',{
      NEMOTRON_MODEL_ID: process.env.NEMOTRON_MODEL_ID,
      NEMOTRON_TEXT_MODEL_ID: process.env.NEMOTRON_TEXT_MODEL_ID,
      NEMOTRON_VISION_MODEL_ID: process.env.NEMOTRON_VISION_MODEL_ID,
      getTextModelId: getTextModelId(),
      getVisionModelId: getVisionModelId(),
    })

    // Create client and test connection
    const client = createNemotronClient()

    console.log('Testing Nemotron connection...')
    const response = await client.generate('Say hello in one sentence!', {
      maxTokens: 50,
      temperature: 0.7,
    })

    return NextResponse.json({
      success: true,
      message: 'Nemotron API connection successful!',
      response: response,
      config: {
        apiUrl: process.env.NEMOTRON_API_URL,
        textModelId: getTextModelId(),
        visionModelId: getVisionModelId(),
        modelId: process.env.NEMOTRON_MODEL_ID || 'Not set (using dual model setup)',
        hasApiKey: !!process.env.NEMOTRON_API_KEY,
      },
    })
  } catch (error: any) {
    console.error('Nemotron test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to Nemotron API',
        troubleshooting: {
          checkApiKey: 'Make sure NEMOTRON_API_KEY is set in .env.local',
          checkApiUrl: 'Verify NEMOTRON_API_URL is correct',
          checkCredentials: 'Ensure your API key is valid and has access to Nemotron models',
          restartServer: 'Restart your Next.js dev server after adding env variables',
        },
      },
      { status: 500 }
    )
  }
}

