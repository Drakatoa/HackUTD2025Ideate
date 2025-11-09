# Setting Up NVIDIA Nemotron API Credentials

## Quick Setup Guide

### Step 1: Get Your NVIDIA API Key

1. **Visit NVIDIA Developer Portal**
   - Go to: https://developer.nvidia.com/
   - Sign up or log in to your account

2. **Access NVIDIA API Catalog**
   - Go to: https://build.nvidia.com/
   - Navigate to the API Catalog
   - Find "Nemotron" models

3. **Generate API Key**
   - Go to your account settings
   - Navigate to "API Keys" section
   - Click "Generate New Key"
   - Copy the API key (you'll only see it once!)

### Step 2: Configure Environment Variables

1. **Copy the example file**
   ```bash
   # The .env.local file is already created for you
   # Just open it and add your credentials
   ```

2. **Open `.env.local` and add your credentials**
   ```env
   NEMOTRON_API_KEY=your_actual_api_key_here
   NEMOTRON_API_URL=https://integrate.api.nvidia.com/v1
   NEMOTRON_MODEL_ID=nvidia/nemotron-4-340b-instruct
   ```

3. **Verify the file is gitignored**
   - `.env.local` should already be in `.gitignore`
   - Never commit your API keys to git!

### Step 3: Test the Connection

Create a test script to verify everything works:

```typescript
// scripts/test-nemotron.ts
import { createNemotronClient } from '../lib/nemotron/client'

async function test() {
  try {
    const client = createNemotronClient()
    
    console.log('Testing Nemotron connection...')
    const response = await client.generate('Say hello in one sentence!')
    
    console.log('✅ Success!')
    console.log('Response:', response)
  } catch (error) {
    console.error('❌ Error:', error)
    console.error('\nMake sure:')
    console.error('1. Your API key is correct in .env.local')
    console.error('2. Your API key has access to Nemotron models')
    console.error('3. You have sufficient API credits/quota')
  }
}

test()
```

Or test directly in a Next.js API route:

```typescript
// app/api/test/route.ts
import { createNemotronClient } from '@/lib/nemotron/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const client = createNemotronClient()
    const response = await client.generate('Say hello!')
    
    return NextResponse.json({ success: true, response })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

Then visit: `http://localhost:3000/api/test`

### Step 4: Common Issues & Solutions

#### Issue: "NEMOTRON_API_KEY is not set"
**Solution:** 
- Make sure `.env.local` exists in the project root
- Restart your Next.js dev server after adding env variables
- Check that the variable name is exactly `NEMOTRON_API_KEY`

#### Issue: "401 Unauthorized"
**Solution:**
- Verify your API key is correct
- Check if your API key has expired
- Ensure you have access to Nemotron models in your NVIDIA account

#### Issue: "404 Not Found" or "Invalid endpoint"
**Solution:**
- Verify the `NEMOTRON_API_URL` is correct
- Check NVIDIA documentation for the latest endpoint URL
- Try: `https://integrate.api.nvidia.com/v1` or `https://api.nvcf.nvidia.com/v1`

#### Issue: "Rate limit exceeded"
**Solution:**
- Check your API quota/limits in NVIDIA dashboard
- Implement retry logic with exponential backoff
- Consider caching responses

### Step 5: Verify Setup

Once configured, you can use the Nemotron client anywhere in your app:

```typescript
// In any API route or server component
import { createNemotronClient } from '@/lib/nemotron/client'

const client = createNemotronClient()
const response = await client.generate('Your prompt here')
```

### API Endpoint URLs

Common NVIDIA API endpoints:

- **NVIDIA API Catalog**: `https://integrate.api.nvidia.com/v1`
- **NVIDIA Cloud Functions**: `https://api.nvcf.nvidia.com/v1`

Check the [NVIDIA API Documentation](https://docs.nvidia.com/) for the latest endpoints.

### Model IDs

Common Nemotron model IDs:
- `nvidia/nemotron-4-340b-instruct` - Instruction following
- `nvidia/nemotron-4-340b-reward` - Reward model
- `nvidia/nemotron-4-340b-chat` - Chat model

### Security Best Practices

1. ✅ **DO**: Store API keys in `.env.local` (gitignored)
2. ✅ **DO**: Use environment variables in production (Vercel, etc.)
3. ❌ **DON'T**: Commit API keys to git
4. ❌ **DON'T**: Hardcode API keys in source code
5. ❌ **DON'T**: Share API keys publicly

### Next Steps

Once your API credentials are set up:

1. ✅ Test the connection
2. ✅ Create your first API route (`app/api/analyze/route.ts`)
3. ✅ Integrate with the whiteboard page
4. ✅ Start generating diagrams and pitches!

---

**Need Help?**
- NVIDIA API Docs: https://docs.nvidia.com/
- NVIDIA Developer Forums: https://forums.developer.nvidia.com/

