# Manual Restart Required for Vision Model

## TL;DR

**Action Required:** Please manually stop and restart your dev server from YOUR terminal.

```bash
# Stop any running servers (Ctrl+C)
npm run dev
```

Then test:
```bash
node test-analyze.js
```

## Why Manual Restart?

Next.js/Turbopack is aggressively caching environment variables and module imports at a level that programmatic restarts can't clear. This is the same issue we had before.

## Current Configuration (All Files Are Correct!)

### Model Setup
✅ **Vision**: `meta/llama-3.2-11b-vision-instruct` (supports images)
✅ **Text**: `nvidia/nvidia-nemotron-nano-9b-v2` (reasoning capabilities)

### Files Updated
1. ✅ `.env.local` line 20 - Llama 3.2 Vision
2. ✅ `lib/nemotron/client.ts` line 330 - Llama 3.2 Vision default

## Proof It Works

Direct curl tests confirmed both models work:

**Llama 3.2 11B Vision** ✅
```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer nvapi-..." \
  -d '{"model":"meta/llama-3.2-11b-vision-instruct", ...}'
```
Response: `{"content":"This is a red square."}`

**Llama 3.2 90B Vision** ✅ (also works, but slower/more expensive)

## The Caching Problem

Server logs show it's STILL trying to use:
```
model: 'nvidia/nemotron-nano-v2-12b-vl'  // ❌ OLD CACHED VALUE
```

But `.env.local` has:
```
NEMOTRON_VISION_MODEL_ID=meta/llama-3.2-11b-vision-instruct  // ✅ CORRECT
```

This is environment variable caching that only a manual restart can clear.

## After Manual Restart

Once you restart from your terminal and test with `node test-analyze.js`, you should see structured JSON analysis of the sketch!

Then we can move on to Phase 1 next step:
- Install Mermaid.js
- Create diagram generation endpoint
- Wire up the full analyze → diagram flow

