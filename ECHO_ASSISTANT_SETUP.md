# Echo-Friendly AI Assistant - Setup Guide

## Prerequisites

- Supabase project set up and configured
- `.env` file with Supabase credentials and API keys
- Bun or Node.js installed for local development
- Deno runtime available (for Supabase Functions)

## Required Environment Variables

Ensure your `.env` file contains:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_GEMINI_API_KEY="your-gemini-api-key" # Optional, for fallback
```

## Supabase Function Deployment

### 1. **Deploy the Echo Assistant Function**

```bash
# Navigate to your Supabase directory
cd supabase

# Deploy the echo-assistant function
supabase functions deploy echo-assistant

# Or with Deno directly:
deno run --allow-all supabase/functions/echo-assistant/index.ts
```

### 2. **Environment Variables for Function**

The function requires `LOVABLE_API_KEY` in Supabase secrets:

```bash
# Go to Supabase Dashboard:
# 1. Settings > Edge Functions > Environment Variables
# 2. Add: LOVABLE_API_KEY = "your-api-key"
```

Or set via CLI:

```bash
supabase secrets set LOVABLE_API_KEY="your-api-key"
```

### 3. **Verify Deployment**

```bash
# Check function logs
supabase functions logs echo-assistant

# Test the function with curl:
curl -X POST \
  'https://your-project.supabase.co/functions/v1/echo-assistant' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-publishable-key' \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "topic": "Test",
    "language": "auto",
    "communicationStyle": "auto"
  }'
```

## Component Integration

### 1. **Add to Your App Routes**

The Echo Assistant is available at `/echo-assistant`.

Update your navigation component to include a link:

```tsx
// In your Nav component
<NavLink to="/echo-assistant" label="Echo Assistant" icon={Sparkles} />
```

### 2. **Use the Component Directly**

```tsx
import EchoFriendlyAssistant from "@/components/EchoFriendlyAssistant";

// Basic usage
<EchoFriendlyAssistant />

// With context
<EchoFriendlyAssistant 
  topic="Photosynthesis" 
  context="Biology chapter 5"
/>
```

### 3. **Available Props**

```tsx
interface EchoAssistantProps {
  topic?: string;      // Topic of learning (default: "General Studies")
  context?: string;    // Background context for the assistant
}
```

## Language Detector Utilities

The `languageDetector.ts` module provides utilities for language and style detection:

```tsx
import { 
  detectLanguage, 
  detectCommunicationStyle,
  getLanguageName,
  getResponseTone 
} from "@/lib/languageDetector";

// Detect language from text
const result = detectLanguage("नमस्ते! मैं कैसे हूं?");
// { language: 'hi', confidence: 0.95 }

// Detect communication style
const style = detectCommunicationStyle("What?? This is AMAZING!!! 🎉🎉");
// 'enthusiastic'

// Get language name for display
const name = getLanguageName('hi');
// 'हिंदी (Hindi)'

// Get response tone based on style
const tone = getResponseTone('inquisitive');
// 'Provide detailed, thorough explanations with examples...'
```

## Troubleshooting Deployment

### Issue: Function Not Found (404)

**Solution:**
```bash
# Ensure function is deployed with correct name
supabase functions list

# Should show: echo-assistant
```

### Issue: LOVABLE_API_KEY Not Set

**Solution:**
```bash
# Set the secret
supabase secrets set LOVABLE_API_KEY="your-key"

# Verify it's set (shows masked for security)
supabase secrets list
```

### Issue: CORS Errors

**Solution:** The function already includes CORS headers. If issues persist:

```tsx
// In the Vite config, ensure CORS is allowed:
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/functions': {
        target: 'https://your-project.supabase.co',
        changeOrigin: true,
      }
    }
  }
})
```

### Issue: Language Detection Not Working

**Debugging:**
```tsx
// Log detection results
const result = detectLanguage("Your text here");
console.log('Detected:', result);

// Check confidence threshold
if (result.confidence < 0.5) {
  console.log('Low confidence - using fallback');
}
```

## Testing Locally

### 1. **Test Language Detection**

```tsx
// Create a test file: src/lib/__tests__/languageDetector.test.ts

import { detectLanguage, detectCommunicationStyle } from '../languageDetector';

describe('Language Detection', () => {
  it('should detect English', () => {
    const result = detectLanguage("Hello, how are you?");
    expect(result.language).toBe('en');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should detect Hindi', () => {
    const result = detectLanguage("नमस्ते! कैसे हो?");
    expect(result.language).toBe('hi');
  });

  it('should detect enthusiastic style', () => {
    const style = detectCommunicationStyle("WOW!!! This is AMAZING!!! 🎉🎉🎉");
    expect(style).toBe('enthusiastic');
  });
});
```

### 2. **Test the Component**

```tsx
// Create a test file: src/components/__tests__/EchoFriendlyAssistant.test.tsx

import { render, screen } from '@testing-library/react';
import EchoFriendlyAssistant from '../EchoFriendlyAssistant';

describe('EchoFriendlyAssistant', () => {
  it('should render welcome message', () => {
    render(<EchoFriendlyAssistant />);
    expect(screen.getByText(/Welcome to Echo Assistant/i)).toBeInTheDocument();
  });

  it('should have auto-detect language option', () => {
    render(<EchoFriendlyAssistant />);
    expect(screen.getByText('🔍 Auto-Detect')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### 1. **Streaming Responses**

The function uses server-sent events (SSE) for streaming:
- Responses appear gradually (better UX)
- Large responses don't timeout
- User sees assistant "thinking"

### 2. **Message History**

For better results:
- Keep conversation history
- Don't send extremely long histories (limit to last 10-15 messages)
- System prompt is reset per conversation

```tsx
// In the component, manage message history:
const LIMITED_MESSAGES = messages.slice(-15); // Keep last 15 messages
```

### 3. **Language Detection Caching**

Cache detected language/style to avoid re-detection:

```tsx
const [cachedLanguage, setCachedLanguage] = useState<string | null>(null);

useEffect(() => {
  const stored = localStorage.getItem('user-language-preference');
  if (stored) setCachedLanguage(stored);
}, []);
```

## Security Considerations

### 1. **API Key Security**

- Never expose API keys in frontend code
- Use environment variables
- Supabase functions run on secure servers
- Keys are stored in Supabase secrets

### 2. **CORS Headers**

The function includes proper CORS headers:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "...",
};
```

### 3. **Request Validation**

Always validate in the function:
```typescript
if (!messages || !Array.isArray(messages) || messages.length === 0) {
  return new Response(
    JSON.stringify({ error: "Invalid messages" }),
    { status: 400, headers: corsHeaders }
  );
}
```

## Monitoring & Analytics

### Log Function Calls

```typescript
// In echo-assistant function
console.log("Assistant called with:", {
  language,
  communicationStyle,
  messageCount: messages.length,
  topic,
  timestamp: new Date().toISOString(),
});
```

View logs:
```bash
supabase functions logs echo-assistant --tail
```

## Advanced Configuration

### Customize System Prompt

Edit `supabase/functions/echo-assistant/index.ts`:

```typescript
const systemPrompt = `
  // Modify the prompt here
  // Important: Keep language-specific sections
  // Maintain echo-friendly philosophy
`;
```

### Add New Languages

1. Add to `languagePatterns` in `src/lib/languageDetector.ts`
2. Add to `commonPhrases` with native language words
3. Add welcome messages to component
4. Update backend language responses
5. Test language detection

### Adjust Confidence Threshold

```typescript
// In languageDetector.ts
const MIN_CONFIDENCE = 0.5; // 50% confidence required

if (result.confidence < MIN_CONFIDENCE) {
  // Use default language
}
```

## Deployment Checklist

- [ ] `.env` file configured with all keys
- [ ] `LOVABLE_API_KEY` set in Supabase secrets
- [ ] `echo-assistant` function deployed
- [ ] Function endpoint responds with 200
- [ ] Language detection working correctly
- [ ] Component renders without errors
- [ ] Voice features working (if applicable)
- [ ] App.tsx has Echo Assistant route
- [ ] Navigation includes link to `/echo-assistant`
- [ ] Documentation created/updated

## Support & Debugging

### Check Function Logs
```bash
supabase functions logs echo-assistant --tail
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Send a message
4. Find `echo-assistant` request
5. Check Status, Response, Headers

### Browser Console Errors
```javascript
// Check for any JavaScript errors in console
// Common issues:
// - Missing imports
// - CORS blocked
// - API key invalid
// - Function timeout
```

### Test with Curl

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/echo-assistant' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR-PUBLISHABLE-KEY' \
  -d '{
    "messages": [{"role": "user", "content": "Hello in Hindi", "language": "hi"}],
    "topic": "Test",
    "language": "hi",
    "communicationStyle": "neutral"
  }'
```

## Next Steps

1. ✅ Deploy the function
2. ✅ Test locally
3. ✅ Add to production
4. ✅ Monitor performance
5. ✅ Gather user feedback
6. ✅ Iterate and improve

---

**For questions or issues, refer to ECHO_ASSISTANT_GUIDE.md**
