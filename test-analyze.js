/**
 * Test script for /api/analyze endpoint
 * Run with: node test-analyze.js
 */

// Simple 1x1 red pixel PNG as base64 for testing
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='

const testData = {
  image: testImage,
  description: 'A simple mobile app sketch with login screen, dashboard, and settings'
}

async function testAnalyze() {
  try {
    console.log('Testing /api/analyze endpoint...\n')

    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const data = await response.json()

    if (data.success) {
      console.log('✅ Success!')
      console.log('\nAnalysis Result:')
      console.log(JSON.stringify(data.analysis, null, 2))
      console.log('\nMetadata:')
      console.log(JSON.stringify(data.metadata, null, 2))
    } else {
      console.log('❌ Failed!')
      console.log('Error:', data.error)
      if (data.details) {
        console.log('Details:', data.details)
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

testAnalyze()
