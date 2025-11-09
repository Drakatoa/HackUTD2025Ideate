/**
 * Test script for /api/generate/diagram endpoint
 * Run with: node test-diagram.js
 */

// Sample analysis result (you can replace with real data from analyze endpoint)
const sampleAnalysis = {
  rawAnalysis: "Mobile app with login screen, dashboard, and settings. User logs in, views dashboard with transaction list, and can access settings.",
  components: ["Login Screen", "Dashboard", "Settings", "Navigation Bar"],
  userFlow: "User logs in, accesses dashboard to view transactions, can navigate to settings to manage account",
  features: ["Login Authentication", "Transaction View", "Settings Management", "User Profile"],
  productType: "Mobile Application",
  targetAudience: "General users managing personal finances",
  technicalNotes: ["Authentication system", "Database for transactions", "User preferences storage"],
  summary: "A mobile app for personal finance management with login, dashboard, and settings."
}

async function testDiagram() {
  try {
    console.log('Testing /api/generate/diagram endpoint...\n')

    const response = await fetch('http://localhost:3000/api/generate/diagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analysis: sampleAnalysis,
        type: 'flowchart' // or 'sequence', 'class'
      })
    })

    const data = await response.json()

    if (data.success) {
      console.log('✅ Success!')
      console.log('\nMermaid Diagram:')
      console.log('─'.repeat(80))
      console.log(data.diagram.mermaid)
      console.log('─'.repeat(80))
      console.log('\nDiagram Type:', data.diagram.type)
      console.log('\nMetadata:')
      console.log(JSON.stringify(data.metadata, null, 2))

      console.log('\n💡 Tip: Copy the diagram above and paste it at https://mermaid.live to visualize it!')
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

testDiagram()
