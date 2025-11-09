/**
 * Diagram Generation API Endpoint
 * Converts analysis results into Mermaid diagram syntax with validation and retry logic
 *
 * POST /api/generate/diagram
 * Body:
 * - analysis: AnalysisResult object from /api/analyze
 * - type: optional diagram type preference ('flowchart' | 'sequence' | 'class')
 * - previousDiagram: optional previous diagram for expansion
 *
 * Returns:
 * - Mermaid diagram syntax
 * - Diagram type
 */

import { NextRequest, NextResponse } from 'next/server'
import { createNemotronClient, getTextModelId } from '@/lib/nemotron/client'
import type { AnalysisResult, DiagramGenerationResult } from '@/lib/nemotron/types'
import { validateMermaidSyntax, attemptAutoFix } from '@/lib/utils/mermaid-validator'

const MAX_RETRIES = 3

/**
 * Extracts Mermaid code from AI response
 * Handles delimiter-based extraction and fallback methods
 */
function extractMermaidCode(rawResponse: string): string {
  const MERMAID_DELIMITER = '===MERMAID_CODE==='
  let cleanedDiagram = ''

  // Look for the delimiter
  const delimiterIndex = rawResponse.indexOf(MERMAID_DELIMITER)

  if (delimiterIndex !== -1) {
    // Extract everything after the delimiter
    let rawAfterDelimiter = rawResponse.substring(delimiterIndex + MERMAID_DELIMITER.length).trim()

    // Remove any leading reasoning text before the actual diagram code
    const diagramKeywords = ['flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'graph']
    let codeStartIndex = -1

    for (const keyword of diagramKeywords) {
      const index = rawAfterDelimiter.toLowerCase().indexOf(keyword.toLowerCase())
      if (index !== -1) {
        codeStartIndex = index
        break
      }
    }

    if (codeStartIndex > 0) {
      cleanedDiagram = rawAfterDelimiter.substring(codeStartIndex)
    } else if (codeStartIndex === 0) {
      cleanedDiagram = rawAfterDelimiter
    } else {
      throw new Error('No diagram keyword found after delimiter')
    }
  } else {
    // Fallback: try to find diagram code without delimiter
    cleanedDiagram = rawResponse.trim()

    // Remove markdown code blocks
    cleanedDiagram = cleanedDiagram.replace(/```(?:mermaid|md|text)?\n?/gi, '')
    cleanedDiagram = cleanedDiagram.replace(/```\n?$/g, '')
    cleanedDiagram = cleanedDiagram.replace(/^```/g, '')

    // Remove common introductory phrases
    cleanedDiagram = cleanedDiagram.replace(/^(okay|ok|here|here's|here is|let me|i'll|i will|sure|alright|alright,|yes,|yes|of course|certainly)[\s:,]+/gi, '')

    // Extract only the Mermaid code (look for diagram type keywords)
    const diagramKeywords = ['flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'graph']
    let keywordIndex = -1

    for (const keyword of diagramKeywords) {
      const index = cleanedDiagram.toLowerCase().indexOf(keyword.toLowerCase())
      if (index !== -1) {
        keywordIndex = index
        break
      }
    }

    if (keywordIndex > 0) {
      cleanedDiagram = cleanedDiagram.substring(keywordIndex)
    } else if (keywordIndex === -1) {
      throw new Error('No diagram keyword found in response')
    }
  }

  // Clean up the extracted code
  cleanedDiagram = cleanedDiagram.trim()
  cleanedDiagram = cleanedDiagram.replace(/^\s*\n+/, '').trim()

  // Remove trailing reasoning text
  const lines = cleanedDiagram.split('\n')
  const reasoningIndicators = [
    /^[A-Z][a-z]+ [a-z]+/,
    /^Features are/,
    /^The user/,
    /^This diagram/,
    /^But maybe/,
    /^Then /,
    /^Looking at/,
    /^flowchart showing/,
  ]

  let lastValidLine = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line &&
        !line.includes('-->') &&
        !line.includes('[') &&
        !line.includes('(') &&
        !line.includes('{') &&
        !line.match(/^(flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|graph|subgraph|end)\s/i) &&
        !line.match(/^[A-Za-z0-9_]+\[/) &&
        !line.match(/^[A-Za-z0-9_]+\s*-->/) &&
        reasoningIndicators.some(pattern => pattern.test(line))) {
      lastValidLine = i - 1
      break
    }
  }

  if (lastValidLine === -1) {
    lastValidLine = lines.length - 1
  }

  cleanedDiagram = lines.slice(0, lastValidLine + 1).join('\n').trim()

  return cleanedDiagram
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis, type, previousDiagram } = body as {
      analysis: AnalysisResult
      type?: 'flowchart' | 'sequence' | 'class'
      previousDiagram?: DiagramGenerationResult
    }

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Analysis data is required' },
        { status: 400 }
      )
    }

    const client = createNemotronClient()

    // Craft base prompt
    const previousContext = previousDiagram
      ? `\n\nPREVIOUS DIAGRAM (expand and add more detail to this):\n${previousDiagram.mermaid}\n\n`
      : ''

    const analysisText = analysis.rawAnalysis || JSON.stringify(analysis, null, 2)

    // Use few-shot prompting with concrete examples for consistency (research shows 35% → 100% improvement)
    const basePrompt = `You are a UX designer creating Mermaid flowchart diagrams. You MUST follow the exact syntax patterns shown in the examples below.

PRODUCT ANALYSIS:
${analysisText}

Components: ${analysis.components?.join(', ') || 'N/A'}
User Flow: ${analysis.userFlow || 'N/A'}
Features: ${analysis.features?.join(', ') || 'N/A'}
Product Type: ${analysis.productType || 'N/A'}
${previousContext}

CRITICAL SYNTAX RULES:
1. Every node MUST have an ID before the label: NodeID[Label]
2. NEVER use standalone labels like [Label]
3. Connections use --> between node IDs
4. Start with "flowchart TD" or "flowchart LR"
5. Use consistent node ID naming (camelCase or snake_case)

CORRECT EXAMPLES TO FOLLOW:

Example 1 - E-commerce App:
flowchart TD
    Start[User Opens App]
    Start --> Browse[Browse Products]
    Browse --> Select[Select Item]
    Select --> AddCart[Add to Cart]
    AddCart --> Checkout[Proceed to Checkout]
    Checkout --> Payment[Enter Payment]
    Payment --> Confirm[Order Confirmed]

Example 2 - Login Flow:
flowchart LR
    Entry[Landing Page]
    Entry --> Login[Login Screen]
    Login --> Auth{Authentication}
    Auth -->|Success| Dashboard[User Dashboard]
    Auth -->|Failed| Error[Error Message]
    Error --> Login

Example 3 - Social Media App:
flowchart TD
    Home[Home Feed]
    Home --> CreatePost[Create Post]
    Home --> ViewProfile[View Profile]
    CreatePost --> UploadMedia[Upload Photo/Video]
    UploadMedia --> AddCaption[Add Caption]
    AddCaption --> PublishPost[Publish]
    ViewProfile --> EditProfile[Edit Profile]
    ViewProfile --> ViewPosts[View Posts]

COMMON MISTAKES TO AVOID:
❌ WRONG: [Customer] --> [Shopping Cart]
✓ CORRECT: Customer[Customer] --> Cart[Shopping Cart]

❌ WRONG: flowchart TD
         [Start]
✓ CORRECT: flowchart TD
          Start[Start]

❌ WRONG: Node1 --> [Label]
✓ CORRECT: Node1[First] --> Node2[Label]

YOUR TASK:
Analyze the product above and create a similar diagram following the EXACT syntax pattern from the examples.

Think step by step:
1. What are the main user actions?
2. What is the logical flow?
3. What are the decision points?

Then output ONLY the Mermaid code after the delimiter.

===MERMAID_CODE===
[Output your flowchart here using the exact syntax from examples]`

    // Retry loop with validation
    let cleanedDiagram = ''
    let validationErrors: string[] = []

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      console.log(`Diagram generation attempt ${attempt + 1}/${MAX_RETRIES}`)

      // Add error feedback on retry
      let currentPrompt = basePrompt
      if (attempt > 0 && validationErrors.length > 0) {
        currentPrompt = `${basePrompt}\n\nPREVIOUS ERRORS TO FIX:\n${validationErrors.join('\n')}\n\nFix these and try again.`
      }

      // Generate diagram with low temperature for consistency
      const rawResponse = await client.generate(currentPrompt, {
        maxTokens: 1500,
        temperature: attempt === 0 ? 0.1 : 0.2 + (attempt * 0.05), // Start very low, increase minimally on retry
      })

      console.log(`Attempt ${attempt + 1} raw response:`, rawResponse.substring(0, 200) + '...')

      try {
        // Extract Mermaid code
        cleanedDiagram = extractMermaidCode(rawResponse)
        console.log(`Extracted diagram (${cleanedDiagram.length} chars):`, cleanedDiagram.substring(0, 150) + '...')

        // Validate syntax
        const validation = validateMermaidSyntax(cleanedDiagram)

        if (validation.isValid) {
          console.log('✓ Diagram validation passed')
          if (validation.warnings.length > 0) {
            console.warn('Warnings:', validation.warnings)
          }
          break // Success!
        } else {
          console.error('✗ Diagram validation failed:', validation.errors)
          validationErrors = validation.errors

          // Try auto-fix
          if (attempt === MAX_RETRIES - 1) {
            console.log('Last attempt - trying auto-fix...')
            const fixed = attemptAutoFix(cleanedDiagram)
            const fixedValidation = validateMermaidSyntax(fixed)
            if (fixedValidation.isValid) {
              console.log('✓ Auto-fix succeeded')
              cleanedDiagram = fixed
              break
            }
          }
        }
      } catch (extractError: any) {
        console.error(`Extraction error on attempt ${attempt + 1}:`, extractError.message)
        validationErrors = [extractError.message]

        if (attempt === MAX_RETRIES - 1) {
          throw new Error(`Failed to extract valid Mermaid code after ${MAX_RETRIES} attempts: ${extractError.message}`)
        }
      }
    }

    // Final validation check
    const finalValidation = validateMermaidSyntax(cleanedDiagram)
    if (!finalValidation.isValid) {
      console.error('Final diagram still invalid:', finalValidation.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'Generated diagram failed validation',
          validationErrors: finalValidation.errors,
          rawDiagram: cleanedDiagram.substring(0, 500),
        },
        { status: 500 }
      )
    }

    // Detect diagram type
    let detectedType: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' = 'flowchart'
    if (cleanedDiagram.startsWith('sequenceDiagram')) {
      detectedType = 'sequence'
    } else if (cleanedDiagram.startsWith('classDiagram')) {
      detectedType = 'class'
    } else if (cleanedDiagram.startsWith('stateDiagram')) {
      detectedType = 'state'
    } else if (cleanedDiagram.startsWith('erDiagram')) {
      detectedType = 'er'
    }

    return NextResponse.json({
      success: true,
      diagram: {
        mermaid: cleanedDiagram,
        type: detectedType,
      },
      metadata: {
        model: getTextModelId(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Diagram generation error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate diagram',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
