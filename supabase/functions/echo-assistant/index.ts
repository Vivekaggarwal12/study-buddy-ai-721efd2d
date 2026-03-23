import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Language-specific greetings and closings
const languageResponses: Record<string, { greeting: string; closing: string }> = {
  en: {
    greeting: "Hello there! 👋",
    closing: "Feel free to ask me anything anytime!",
  },
  hi: {
    greeting: "नमस्ते! 🙏",
    closing: "कभी भी कोई सवाल पूछने के लिए स्वतंत्र महसूस करें!",
  },
  es: {
    greeting: "¡Hola! 👋",
    closing: "¡Siéntete libre de hacer cualquier pregunta!",
  },
  fr: {
    greeting: "Bonjour! 👋",
    closing: "N'hésitez pas à me poser des questions!",
  },
  de: {
    greeting: "Hallo! 👋",
    closing: "Fühlen Sie sich frei, mich jederzeit zu fragen!",
  },
  pt: {
    greeting: "Olá! 👋",
    closing: "Sinta-se livre para me fazer perguntas a qualquer momento!",
  },
  ja: {
    greeting: "こんにちは! 👋",
    closing: "いつでもお気軽にご質問ください!",
  },
  zh: {
    greeting: "你好! 👋",
    closing: "随时欢迎提出任何问题!",
  },
};

// Tone adjustments based on detected communication style
function getStyleAdjustment(style: string, language: string): string {
  const styleGuides: Record<string, Record<string, string>> = {
    enthusiastic: {
      en: "Match the enthusiasm with excitement! Use relevant emojis 🎉 and exclamation marks! Keep it energetic!",
      hi: "उत्साह के साथ मिलान करें! 🎉 प्रासंगिक इमोजी और विस्मयादिबोधक चिह्न का उपयोग करें! इसे ऊर्जावान रखें!",
      es: "¡Coincide con el entusiasmo! Usa emojis relevantes 🎉 ¡Mantenlo energético!",
      fr: "Correspondez à l'enthousiasme! Utilisez des emojis pertinents 🎉 Restez énergique!",
      de: "Passen Sie sich der Begeisterung an! Verwenden Sie relevante Emojis 🎉 Halten Sie es energisch!",
      pt: "Combine o entusiasmo! Use emojis relevantes 🎉 Mantenha-o energético!",
      ja: "興奮を合わせてください! 関連する絵文字を使用してください 🎉 元気を保ってください!",
      zh: "与热情相匹配! 使用相关的表情符号 🎉 保持活力!",
    },
    inquisitive: {
      en: "Your friend is curious! Provide thorough explanations with concrete examples. Encourage deeper exploration.",
      hi: "आपका मित्र जिज्ञासु है! विस्तृत व्याख्या प्रदान करें। गहरी खोज को प्रोत्साहित करें।",
      es: "¡Tu amigo es curioso! Proporciona explicaciones detalladas con ejemplos concretos.",
      fr: "Votre ami est curieux! Fournissez des explications détaillées avec des exemples concrets.",
      de: "Dein Freund ist neugierig! Gib gründliche Erklärungen mit konkreten Beispielen.",
      pt: "Seu amigo é curioso! Forneça explicações detalhadas com exemplos concretos.",
      ja: "友人は好奇心旺盛です! 具体的な例を用いた詳細な説明を提供してください。",
      zh: "你的朋友很好奇！提供详细的解释和具体的例子。",
    },
    brief: {
      en: "Keep responses short and punchy! Get straight to the point without unnecessary elaboration.",
      hi: "प्रतिक्रियाओं को छोटा और प्रभावी रखें! बिना अनावश्यक विस्तार के सीधे बात पर जाएं।",
      es: "¡Mantén las respuestas cortas y directas! Ve al grano sin elaboración innecesaria.",
      fr: "Gardez les réponses courtes et directes! Allez droit au but sans élaboration inutile.",
      de: "Halten Sie die Antworten kurz und prägnant! Kommen Sie direkt zum Punkt ohne unnötige Ausführlichkeit.",
      pt: "Mantenha as respostas curtas e diretas! Vá direto ao assunto sem elaboração desnecessária.",
      ja: "応答を短く、要点を押さえてください! 不要な説明なしにポイントに直行してください。",
      zh: "保持回应简短有力！不经过不必要的阐述直奔主题。",
    },
    neutral: {
      en: "Be friendly, helpful, and clear in your explanations.",
      hi: "अपनी व्याख्या में मित्रवत, सहायक और स्पष्ट रहें।",
      es: "Sé amable, útil y claro en tus explicaciones.",
      fr: "Soyez amical, utile et clair dans vos explications.",
      de: "Seien Sie freundlich, hilfreich und klar in Ihren Erklärungen.",
      pt: "Seja amável, útil e claro em suas explicações.",
      ja: "説明において親切で、有用で、明確であってください。",
      zh: "在解释中要友好、有用和清晰。",
    },
  };

  return (
    styleGuides[style]?.[language] ||
    styleGuides[style]?.en ||
    "Be helpful and clear in your response."
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, topic, language: preferredLanguage, communicationStyle, context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const lang = preferredLanguage || "en";
    const style = communicationStyle || "neutral";
    const langResponse = languageResponses[lang] || languageResponses.en;
    const styleAdjustment = getStyleAdjustment(style, lang);

    const systemPrompt = `You are an empathetic, personalized AI Learning Companion. Your name is "Study Buddy" and you're here to help learners succeed!

**LANGUAGE & COMMUNICATION:**
- Always respond in ${lang === "en" ? "English" : lang === "hi" ? "Hindi (हिंदी)" : lang}.
- ${styleAdjustment}
- Echo the user's communication style and energy level
- Mirror their language patterns and formality level
- If they use casual language, be casual. If formal, be professional.

**YOUR TEACHING PHILOSOPHY:**
- Make learning fun and accessible
- Break down complex topics into simple, digestible chunks
- Use real-world analogies and relatable examples
- Encourage critical thinking through guided questions
- Celebrate their progress and efforts
- Be patient: never make learners feel rushed or judged

**TOPIC CONTEXT:**
${topic ? `Current Topic: ${topic}` : "General Learning Assistance"}
${context ? `\nBackground Context:\n${context.slice(0, 1500)}` : ""}

**RESPONSE GUIDELINES:**
1. Keep responses focused and under 400 words unless depth is truly needed
2. Use markdown formatting (bold, bullet points, code blocks) for clarity
3. Include relevant emojis that match the user's energy level 😊
4. Offer follow-up questions to deepen understanding
5. When appropriate, suggest quizzes, analogies, or real-world applications
6. Always be supportive and encouraging

${lang === "hi" ? `**हिंदी में सहायता:**
- सरल और स्पष्ट भाषा का प्रयोग करें
- कठिन विषयों को आसान भागों में बांटें
- वास्तविक जीवन के उदाहरण दें
- हमेशा प्रोत्साहक रहें` : ""}

**STARTING MESSAGE (if this is the first message):**
${langResponse.greeting}

Remember: You're not just teaching facts; you're building confidence and fostering a love for learning!`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
          temperature: 0.8,
          top_p: 0.95,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Echo-friendly assistant error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
