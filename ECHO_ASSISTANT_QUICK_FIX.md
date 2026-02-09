# Echo Assistant - QUICK FIX FOR "FAILING TO FETCH" ERROR

## ❌ Error: "Failed to connect to assistant"

This error means the backend function isn't deployed or isn't responding properly.

---

## ✅ STEP-BY-STEP FIX

### Step 1: Verify Environment Variables

Check your `.env` file has:
```env
VITE_SUPABASE_PROJECT_ID="nbvoeccgpuiqfdjbzlwt"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://nbvoeccgpuiqfdjbzlwt.supabase.co"
VITE_GEMINI_API_KEY="AIzaSyAS1Js5bBMOy9DV6XWlO_dJ9YXZwIfGK8Q"
```

**If any are missing:**
1. Add them to `.env`
2. Restart dev server: `npm run dev`

---

### Step 2: Deploy the Backend Function

Run this command in terminal:

```bash
supabase functions deploy echo-assistant
```

**Expected output:**
```
✓ Function deployed successfully to version XXXXX
```

---

### Step 3: Set Supabase Secrets

The backend needs an API key. Run:

```bash
supabase secrets set LOVABLE_API_KEY="your-api-key-here"
```

**Where to get the API key:**
- Go to Supabase Dashboard
- Select your project
- Settings → API Keys
- Copy the "Project API Key"

Or if using Lovable/other service:
- Get the API key from that service
- Paste it in the command above

---

### Step 4: Verify Deployment

Check if the function is deployed:

```bash
supabase functions list
```

You should see:
```
✓ echo-assistant
```

---

### Step 5: Restart Dev Server

```bash
npm run dev
```

Then open your browser to:
```
http://localhost:5173/echo-assistant
```

---

## 🔍 Diagnostic Commands

### Check if function is running:
```bash
supabase functions logs echo-assistant --tail
```

### Test the endpoint directly:
```bash
curl -X POST \
  'https://nbvoeccgpuiqfdjbzlwt.supabase.co/functions/v1/echo-assistant' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_PUBLISHABLE_KEY' \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "topic": "test",
    "language": "en",
    "communicationStyle": "neutral"
  }'
```

### Check secrets are set:
```bash
supabase secrets list
```

Should show: `LOVABLE_API_KEY` (masked in output)

---

## 🐛 Browser Console Debugging

Open DevTools (F12) → Console, then copy-paste:

```javascript
// Check env variables
console.log("SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("PUBLISHABLE_KEY:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
```

Then click the "🔍 Run setup verification" button in the app to auto-diagnose.

---

## ❓ Still Not Working?

### If you see 404 error:
```
Function not deployed. Run: supabase functions deploy echo-assistant
```
**Fix:** Run deployment command above

### If you see 401/403 error:
```
Authentication failed. Check LOVABLE_API_KEY
```
**Fix:** 
1. Run: `supabase secrets set LOVABLE_API_KEY="your-key"`
2. Wait 30 seconds for secrets to propagate
3. Refresh browser

### If "Environment variables not configured":
**Fix:**
1. Check `.env` file
2. Has all variables from Step 1?
3. Restart: `npm run dev`

### If you see "CORS error":
**Fix:** This is usually temporary while function deploys
1. Wait 1-2 minutes
2. Refresh browser
3. Try again

---

## 📝 Complete Setup Checklist

- [ ] `.env` file has all 4 variables
- [ ] Ran: `supabase functions deploy echo-assistant`
- [ ] Ran: `supabase secrets set LOVABLE_API_KEY="key"`
- [ ] `supabase functions list` shows `echo-assistant`
- [ ] Dev server restarted: `npm run dev`
- [ ] Browser refreshed
- [ ] Can see Echo Assistant button on home page
- [ ] Can navigate to /echo-assistant
- [ ] Green ✅ "Setup complete!" appears
- [ ] Can type message and get response

---

## 🚀 Success Signs

When everything works:
1. ✅ Green banner: "Setup complete! Echo Assistant is ready."
2. ✅ Can type in the chat
3. ✅ Message sends (loading indicator)
4. ✅ Response appears from assistant
5. ✅ Multi-language support works
6. ✅ Voice input works (click mic button)

---

## 📞 Still Need Help?

1. **Check browser console** for detailed error messages
2. **Run diagnostics**: Click setup verification button
3. **Review logs**: `supabase functions logs echo-assistant --tail`
4. **See full docs**: Read `ECHO_ASSISTANT_SETUP.md`

---

**You're almost there! Just need to deploy the backend. 🚀**
