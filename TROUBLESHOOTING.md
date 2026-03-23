# Echo Assistant - Complete Troubleshooting Guide

## Error: "Failing to Fetch" - COMPLETE SOLUTION

---

## 🔍 DIAGNOSIS

The "failing to fetch" error happens when:
1. ❌ Backend function isn't deployed
2. ❌ API key isn't set in Supabase
3. ❌ Environment variables missing
4. ❌ Network/CORS issues

---

## ✅ SOLUTION (Follow in Order)

### Phase 1: Check Frontend Setup

**Check 1: Is .env file complete?**
```
Your .env file should have:
✓ VITE_SUPABASE_PROJECT_ID
✓ VITE_SUPABASE_PUBLISHABLE_KEY  
✓ VITE_SUPABASE_URL
✓ VITE_GEMINI_API_KEY (optional)
```

**If missing:**
- Find them in Supabase Dashboard
- Add to `.env` file
- Restart: `npm run dev`

---

### Phase 2: Deploy Backend

**Check 2: Is backend function deployed?**

Run:
```bash
supabase functions list
```

You should see:
```
✓ echo-assistant
```

**If NOT deployed:**
```bash
supabase functions deploy echo-assistant
```

**Wait for:**
```
✓ Function deployed successfully
```

---

### Phase 3: Set API Key

**Check 3: Is API key configured?**

Run:
```bash
supabase secrets list
```

You should see `GEMINI_API_KEY` in the list.

**If NOT set:**

First, get your API key from:
- **Lovable:** Your dashboard
- **Supabase:** Settings → API Keys → Copy "Project API Key"
- **Other service:** Your account settings

Then run:
```bash
supabase secrets set GEMINI_API_KEY="your-key-here"
```

**Wait:** 30 seconds for secrets to propagate

---

### Phase 4: Restart Everything

1. **Stop dev server:** `Ctrl+C`
2. **Clear cache:** Delete `.next` or `dist` folder (if exists)
3. **Restart:** `npm run dev`
4. **Refresh browser:** `Ctrl+Shift+R` (hard refresh)

---

## 🧪 TESTING

### Test 1: Check Console Verification

1. Open Echo Assistant page
2. Look for one of these:

**✅ Success** - Green banner:
```
✅ Setup complete! Echo Assistant is ready.
```

**⚠️ Warning** - Yellow banner with error:
```
Setup Required - Environment variables not configured...
```

**If yellow banner appears:**
- Click "🔍 Run setup verification in console"
- Check browser console (F12)
- Follow the diagnostic output

---

### Test 2: Try Sending a Message

1. Type: "Hello"
2. Click Send
3. Wait 2-3 seconds

**✅ Success:**
- Message appears
- Loading spinner shows
- Response appears from assistant

**❌ Error:**
- You'll see error message
- It will say exactly what to fix

---

## 🔴 Common Errors & Fixes

### Error: "Environment variables not configured"
```
Fix:
1. Check .env file has all 4 variables
2. Ensure NO typos in variable names
3. Restart: npm run dev
```

### Error: "Function not deployed"
```
Fix: supabase functions deploy echo-assistant
```

### Error: "Authentication failed - GEMINI_API_KEY not set"
```
Fix:
1. Get your API key
2. Run: supabase secrets set GEMINI_API_KEY="key"
3. Wait 30 seconds
4. Refresh browser
```

### Error: "Too many requests (429)"
```
Fix: Wait a minute, then try again
```

### Error: "Failed to connect (404)"
```
Fix:
1. Verify function deployed: supabase functions list
2. Re-deploy if needed: supabase functions deploy echo-assistant
3. Refresh browser
```

### Error: "CORS error" or "Failed to fetch"
```
Fix:
1. Wait 1-2 minutes for deployment to complete
2. Refresh browser
3. Check function logs: supabase functions logs echo-assistant --tail
```

---

## 🛠️ Advanced Debugging

### Enable Console Logging

Open browser DevTools (F12) → Console, paste:

```javascript
// Run setup verification
import { verifyEchoAssistantSetup } from '@/lib/echoDebugger'
verifyEchoAssistantSetup()
```

Or use the button in the app:
- Click yellow warning banner
- Click "🔍 Run setup verification in console"

### Check Function Logs

```bash
supabase functions logs echo-assistant --tail
```

This shows real-time logs. Look for:
- `ERROR: Cannot find...` → Function issue
- `Missing GEMINI_API_KEY` → Secret not set
- `CORS error` → Temporary, usually resolves

### Test Endpoint Directly

```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/echo-assistant' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_PUBLISHABLE_KEY' \
  -d '{
    "messages": [{"role": "user", "content": "test"}],
    "topic": "test",
    "language": "en"
  }'
```

Expected response: Either error with details, or streaming response starting with `data: {`

---

## ✨ SUCCESS CHECKLIST

- [ ] Green ✅ banner appears on /echo-assistant
- [ ] Can type in chat input
- [ ] Send button is enabled
- [ ] Message appears in chat
- [ ] Loading spinner appears
- [ ] Response from assistant appears
- [ ] Response text streams in (doesn't all appear at once)
- [ ] Can change language in settings
- [ ] Voice button works (click mic)
- [ ] Voice input is recognized
- [ ] Can hear audio output

If all ✅ above, **echo-assistant is working perfectly!**

---

## 📞 Additional Help

**See full documentation:**
- `ECHO_ASSISTANT_GUIDE.md` - Complete user guide
- `ECHO_ASSISTANT_SETUP.md` - Technical setup details
- `ECHO_ASSISTANT_QUICK_FIX.md` - Quick reference
- `SETUP_COMMANDS.sh` - Commands to copy-paste

**Check implementation:**
- `src/components/EchoFriendlyAssistant.tsx` - Component code
- `src/lib/languageDetector.ts` - Language detection
- `supabase/functions/echo-assistant/index.ts` - Backend

---

## 🎯 Most Common Issue

**99% of "failing to fetch" errors are because:**

```
Backend function not deployed!
```

**Solution:** Run this ONE command:
```bash
supabase functions deploy echo-assistant
```

Then restart your dev server and try again.

---

**Need more help? Check the console error message - it usually tells you exactly what's wrong!** 💡
