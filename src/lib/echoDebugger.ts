/**
 * Echo Assistant Setup Debug Helper
 * Run this in your browser console to verify setup
 */

export function verifyEchoAssistantSetup() {
  console.group("🔍 Echo Assistant Setup Verification");

  // Check environment variables
  console.group("📋 Environment Variables");
  const requiredEnvVars = {
    "VITE_SUPABASE_URL": import.meta.env.VITE_SUPABASE_URL,
    "VITE_SUPABASE_PUBLISHABLE_KEY": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    "VITE_SUPABASE_PROJECT_ID": import.meta.env.VITE_SUPABASE_PROJECT_ID,
  };

  let allEnvVarsSet = true;
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: Set`);
    } else {
      console.error(`❌ ${key}: NOT SET`);
      allEnvVarsSet = false;
    }
  });
  console.groupEnd();

  if (!allEnvVarsSet) {
    console.error("⚠️  Missing environment variables! Check your .env file:");
    console.log(`
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
    `);
  }

  // Check endpoint reachability
  console.group("🌐 API Endpoint Check");
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    const endpoint = `${supabaseUrl}/functions/v1/echo-assistant`;
    console.log(`Endpoint: ${endpoint}`);
    
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "test" }],
        topic: "test",
        language: "en",
        communicationStyle: "neutral",
      }),
    })
      .then(res => {
        console.log(`✅ Endpoint reachable (Status: ${res.status})`);
        if (res.status === 404) {
          console.error("❌ Function not deployed. Run: supabase functions deploy echo-assistant");
        } else if (res.status === 401 || res.status === 403) {
          console.error("❌ Authentication failed. Check GEMINI_API_KEY in Supabase secrets.");
        }
      })
      .catch(err => {
        console.error(`❌ Cannot reach endpoint: ${err.message}`);
        console.log("This could be a CORS issue or the function isn't deployed.");
      });
  }
  console.groupEnd();

  console.group("📝 Next Steps");
  console.log(`
1. ✅ Verify environment variables above
2. 📦 Deploy the backend function:
   supabase functions deploy echo-assistant

3. 🔐 Set Supabase secret:
  supabase secrets set GEMINI_API_KEY='your-api-key'

4. 🔄 Restart dev server:
   npm run dev

5. 🧪 Test the assistant
  `);
  console.groupEnd();

  console.groupEnd();
}

// Call this in your Echo Assistant component for debugging
export function debugEchoAssistantError(error: Error) {
  console.group("🐛 Echo Assistant Error Debug");
  console.error("Error:", error);
  
  if (error.message.includes("fetch")) {
    console.log("❌ FETCH ERROR - This is likely one of:");
    console.log("   1. Backend function not deployed");
    console.log("   2. Environment variables not set");
    console.log("   3. CORS issue");
    console.log("   4. API key not configured");
  }
  
  if (error.message.includes("Failed to connect")) {
    console.log("🔧 Try:");
    console.log("   1. Run: supabase functions deploy echo-assistant");
    console.log("   2. Run: supabase secrets set GEMINI_API_KEY='your-key'");
    console.log("   3. Restart: npm run dev");
  }

  console.log("\n💡 For more help, call: verifyEchoAssistantSetup()");
  console.groupEnd();
}
