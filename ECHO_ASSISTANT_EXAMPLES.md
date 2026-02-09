// Example usage of the Echo-Friendly AI Assistant

import EchoFriendlyAssistant from "@/components/EchoFriendlyAssistant";
import { detectLanguage, detectCommunicationStyle, getLanguageName } from "@/lib/languageDetector";

/**
 * EXAMPLE 1: Basic Usage - Full Page
 * Access at: /echo-assistant
 */
export function BasicEchoAssistant() {
  return (
    <EchoFriendlyAssistant 
      topic="General Studies"
      context=""
    />
  );
}

/**
 * EXAMPLE 2: With Specific Topic
 */
export function PhotosynthesisHelper() {
  return (
    <EchoFriendlyAssistant 
      topic="Biology - Photosynthesis"
      context="Understanding how plants convert light energy into chemical energy. Learn about light-dependent reactions and the Calvin cycle."
    />
  );
}

/**
 * EXAMPLE 3: Using Language Detection Utilities
 */
export function DemoLanguageDetection() {
  // Example 1: English detection
  const englishInput = "Hey! What's photosynthesis?";
  const englishResult = detectLanguage(englishInput);
  console.log("English Detection:", englishResult);
  // Output: { language: 'en', confidence: 0.85 }

  // Example 2: Hindi detection
  const hindiInput = "नमस्ते! फोटोसिंथिसिस क्या है?";
  const hindiResult = detectLanguage(hindiInput);
  console.log("Hindi Detection:", hindiResult);
  // Output: { language: 'hi', confidence: 0.95 }

  // Example 3: Spanish detection
  const spanishInput = "¡Hola! ¿Qué es la fotosíntesis?";
  const spanishResult = detectLanguage(spanishInput);
  console.log("Spanish Detection:", spanishResult);
  // Output: { language: 'es', confidence: 0.88 }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Language Detection Demo</h2>
      
      <div className="bg-blue-50 p-4 rounded">
        <p className="font-semibold">Input: {englishInput}</p>
        <p>Detected: {getLanguageName(englishResult.language as any)}</p>
        <p>Confidence: {(englishResult.confidence * 100).toFixed(1)}%</p>
      </div>

      <div className="bg-green-50 p-4 rounded">
        <p className="font-semibold">Input: {hindiInput}</p>
        <p>Detected: {getLanguageName(hindiResult.language as any)}</p>
        <p>Confidence: {(hindiResult.confidence * 100).toFixed(1)}%</p>
      </div>

      <div className="bg-yellow-50 p-4 rounded">
        <p className="font-semibold">Input: {spanishInput}</p>
        <p>Detected: {getLanguageName(spanishResult.language as any)}</p>
        <p>Confidence: {(spanishResult.confidence * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 4: Using Communication Style Detection
 */
export function DemoCommunicationStyles() {
  // Enthusiastic style
  const enthusiasticInput = "WOW!!! This is AMAZING!!! 🎉🎉🎉";
  const enthusiasticStyle = detectCommunicationStyle(enthusiasticInput);
  // Output: 'enthusiastic'

  // Inquisitive style
  const inquisitiveInput = "Why does this happen? How does it work? When will we learn more?";
  const inquisitiveStyle = detectCommunicationStyle(inquisitiveInput);
  // Output: 'inquisitive'

  // Brief style
  const briefInput = "What?";
  const briefStyle = detectCommunicationStyle(briefInput);
  // Output: 'brief'

  // Neutral style
  const neutralInput = "Please explain photosynthesis.";
  const neutralStyle = detectCommunicationStyle(neutralInput);
  // Output: 'neutral'

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Communication Style Detection</h2>
      <p className="text-gray-600">The assistant detects your communication style and matches it:</p>
      
      <div className="space-y-3">
        <div className="bg-red-50 p-4 rounded">
          <p className="font-semibold">Enthusiastic 🎉</p>
          <p className="text-sm">{enthusiasticInput}</p>
          <p className="text-sm text-gray-600">→ Assistant responds with energy and excitement!</p>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <p className="font-semibold">Inquisitive 🤔</p>
          <p className="text-sm">{inquisitiveInput}</p>
          <p className="text-sm text-gray-600">→ Assistant provides detailed, thorough explanations</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <p className="font-semibold">Brief ⚡</p>
          <p className="text-sm">{briefInput}</p>
          <p className="text-sm text-gray-600">→ Assistant keeps response short and direct</p>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <p className="font-semibold">Neutral 😊</p>
          <p className="text-sm">{neutralInput}</p>
          <p className="text-sm text-gray-600">→ Assistant is friendly and professional</p>
        </div>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 5: API Request Format
 * 
 * This shows exactly what gets sent to the backend
 */
export const API_REQUEST_EXAMPLE = {
  url: "/functions/v1/echo-assistant",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_SUPABASE_KEY"
  },
  body: {
    messages: [
      {
        role: "user",
        content: "नमस्ते! फोटोसिंथिसिस क्या है?"
      }
    ],
    topic: "Biology - Photosynthesis",
    context: "Chapter about plant biology",
    language: "hi",  // Auto-detected or manual
    communicationStyle: "enthusiastic"  // Auto-detected or manual
  },
  response: {
    type: "text/event-stream",
    format: "Server-sent events",
    example: `data: {"choices":[{"delta":{"content":"नमस्ते"}}]}\ndata: {"choices":[{"delta":{"content":"!"}}]}\n...`
  }
};

/**
 * EXAMPLE 6: Integration in Dashboard
 * Add this to your Dashboard component
 */
export const DashboardIntegrationExample = `
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardCard() {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <Sparkles className="h-8 w-8 text-purple-500" />
        <div className="flex-1">
          <h3 className="font-bold text-lg">Echo Assistant</h3>
          <p className="text-sm text-gray-600">
            Get personalized help in your language using an AI that adapts to your style
          </p>
        </div>
        <Link to="/echo-assistant">
          <Button variant="default">Open</Button>
        </Link>
      </div>
    </Card>
  );
}
`;

/**
 * EXAMPLE 7: Response Examples
 */
export const RESPONSE_EXAMPLES = {
  enthusiastic: {
    input: "OMG what's calculus?? 🎉🎉",
    response: `🤓 OMG YES, calculus is SO COOL! 🚀

Think of it like this: 
- **Derivatives** = How FAST things are changing! ⚡
- **Integrals** = Adding up TONS of tiny pieces! 📦

It's like math superpowers! 💪✨`
  },
  inquisitive: {
    input: "Can you explain photosynthesis in detail? What are the stages?",
    response: `Absolutely! Photosynthesis is a complex process with two main stages:

**1. Light Reactions (in thylakoids)**
- Photon absorption by chlorophyll
- Water splitting (photolysis)
- Electron transport chain
- ATP and NADPH production

**2. Calvin Cycle (in stroma)**
- Carbon dioxide fixation via Rubisco
- Reduction phase
- Regeneration of RuBP

Would you like to explore the electron transport chain in detail?`
  },
  brief: {
    input: "What?",
    response: `Photosynthesis is how plants convert sunlight into glucose for energy.`
  }
};

/**
 * EXAMPLE 8: Features Summary
 */
export const FEATURES = [
  {
    title: "🌍 Auto-Language Detection",
    description: "Speaks 8 languages: English, Hindi, Spanish, French, German, Portuguese, Japanese, Chinese"
  },
  {
    title: "🎭 Communication Style Detection",
    description: "Matches your tone: Enthusiastic, Inquisitive, Brief, or Neutral"
  },
  {
    title: "🎤 Voice Input & Output",
    description: "Speak your questions and listen to explanations in your language"
  },
  {
    title: "📚 Educational Focus",
    description: "Learns effectively with clear explanations, examples, and follow-ups"
  },
  {
    title: "⚡ Real-time Streaming",
    description: "Responses stream in real-time for better user experience"
  },
  {
    title: "🔄 Echo-Friendly",
    description: "Mimics your communication style for personalized learning"
  }
];

/**
 * EXAMPLE 9: Testing the API with Fetch
 */
export async function testEchoAssistantAPI() {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/echo-assistant`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "What is physics?"
          }
        ],
        topic: "Science",
        language: "en",
        communicationStyle: "neutral"
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("API Error:", error);
    return;
  }

  // Handle server-sent events
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    console.log("Received:", chunk);
  }
}

/**
 * EXAMPLE 10: Component Props Usage
 */
export function ComponentPropsDemo() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Echo Assistant Props</h2>

      <div className="bg-gray-50 p-4 rounded font-mono text-sm">
        {`interface EchoAssistantProps {
  topic?: string;        // "Photosynthesis" | "Biology" | "General Studies"
  context?: string;      // Optional background information
}

// Usage:
<EchoFriendlyAssistant 
  topic="Photosynthesis"
  context="Chapter 5 of Biology textbook"
/>`}
      </div>

      <p className="text-gray-600">
        Both props are optional. If not provided, the assistant works in general learning mode.
      </p>
    </div>
  );
}
