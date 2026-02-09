   import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Mic, Volume2, Globe, Settings, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MermaidRenderer from "./MermaidRenderer";
import ChartRenderer from "./ChartRenderer";
import { detectLanguage, getLanguageName, detectCommunicationStyle } from "@/lib/languageDetector";
import { verifyEchoAssistantSetup } from "@/lib/echoDebugger";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EchoAssistantProps {
  topic?: string;
  context?: string;
}

const WELCOME_MESSAGES: Record<string, string> = {
  en: "Hi there! 👋 I'm your Study Buddy, and I'm here to help you learn! Feel free to ask me anything - I'll adapt my communication style to match yours.",
  hi: "नमस्ते! 👋 मैं आपका Study Buddy हूं, और मैं आपको सीखने में मदद करने के लिए यहां हूं! मुझसे कुछ भी पूछें - मैं अपनी संचार शैली को आपके अनुसार ढाल लूंगा।",
  es: "¡Hola! 👋 Soy tu Study Buddy, ¡estoy aquí para ayudarte a aprender! Siéntete libre de preguntarme cualquier cosa.",
  fr: "Bonjour! 👋 Je suis ton Study Buddy, et je suis ici pour t'aider à apprendre! N'hésite pas à me poser des questions.",
  de: "Hallo! 👋 Ich bin dein Study Buddy und bin hier, um dir beim Lernen zu helfen! Frag mich einfach alles.",
  pt: "Olá! 👋 Sou seu Study Buddy e estou aqui para ajudá-lo a aprender! Sinta-se livre para me fazer qualquer pergunta.",
  ja: "こんにちは! 👋 私はあなたのStudy Buddyです。学習をお手伝いします！何でもお聞きください。",
  zh: "你好! 👋 我是你的Study Buddy。我在这里帮助你学习！随时可以问我任何问题。",
};

const EchoFriendlyAssistant = ({ topic = "General Studies", context = "" }: EchoAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("en");
  const [communicationStyle, setCommunicationStyle] = useState<string>("neutral");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userPreferredLanguage, setUserPreferredLanguage] = useState<string>("auto");
  const [userPreferredStyle, setUserPreferredStyle] = useState<string>("auto");
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check setup on mount
  useEffect(() => {
    const checkSetup = () => {
      const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!hasUrl || !hasKey) {
        setSetupComplete(false);
        setSetupError("Environment variables not configured. Check your .env file.");
        return;
      }
      
      setSetupComplete(true);
      setSetupError(null);
    };
    
    checkSetup();
  }, []);

  const { listening, transcript, start: startListening, stop: stopListening } = useSpeechRecognition({
    lang: detectedLanguage === 'hi' ? 'hi-IN' : detectedLanguage === 'es' ? 'es-ES' : 'en-US',
    interimResults: true,
  });

  const { speaking: isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis({
    lang: detectedLanguage === 'hi' ? 'hi-IN' : detectedLanguage === 'es' ? 'es-ES' : 'en-US',
    rate: 0.95,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // Auto-detect language and style from user input
  const analyzeUserMessage = (text: string) => {
    if (userPreferredLanguage === "auto") {
      const detection = detectLanguage(text);
      if (detection.confidence > 0.5) {
        setDetectedLanguage(detection.language);
      }
    }

    if (userPreferredStyle === "auto") {
      const style = detectCommunicationStyle(text);
      setCommunicationStyle(style);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    if (listening) stopListening();

    // Analyze message for language and style
    analyzeUserMessage(messageText);

    const userMsg: Message = { role: "user", content: messageText.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/echo-assistant`;
      
      // Validate environment variables
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
        throw new Error("Environment variables not configured. Please check your .env file.");
      }

      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
          topic,
          context,
          language: userPreferredLanguage === "auto" ? detectedLanguage : userPreferredLanguage,
          communicationStyle: userPreferredStyle === "auto" ? communicationStyle : userPreferredStyle,
        }),
      });

      if (!resp.ok) {
        let errorMsg = "Failed to connect to Echo Assistant";
        if (resp.status === 404) {
          errorMsg = "The Echo Assistant backend function has not been deployed yet. Please deploy it using: supabase functions deploy echo-assistant";
        } else if (resp.status === 401 || resp.status === 403) {
          errorMsg = "Authentication failed. Please check your Supabase configuration and ensure LOVABLE_API_KEY is set in Supabase secrets.";
        } else if (resp.status === 429) {
          errorMsg = "Too many requests. Please wait a moment and try again.";
        }
        throw new Error(errorMsg);
      }

      if (!resp.body) {
        throw new Error("No response received from server");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Auto-read assistant response with appropriate speech rate
      if (assistantContent) {
        const cleanContent = assistantContent.replace(/```[^`]*```/g, '').replace(/\n+/g, ' ');
        speak(cleanContent);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg = err.message || "I encountered an issue connecting to the assistant. Please try again.";
      
      // Update setup error if it's an API/backend issue
      if (errorMsg.includes("Failed to connect") || errorMsg.includes("404") || errorMsg.includes("fetch")) {
        setSetupError("Backend connection failed. Make sure the function is deployed: supabase functions deploy echo-assistant");
      }
      
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `⚠️ **Connection Error**\n\n${errorMsg}\n\n**How to fix this:**\n\n1. Make sure the backend function is deployed:\n   \`supabase functions deploy echo-assistant\`\n\n2. Set the LOVABLE_API_KEY in Supabase:\n   \`supabase secrets set LOVABLE_API_KEY='your-key'\`\n\n3. Check your .env file has all required variables:\n   - VITE_SUPABASE_URL\n   - VITE_SUPABASE_PUBLISHABLE_KEY\n   - VITE_SUPABASE_PROJECT_ID\n\n4. Restart the dev server:\n   \`npm run dev\`` 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const currentLanguage = userPreferredLanguage === "auto" ? detectedLanguage : userPreferredLanguage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex flex-col bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20"
    >
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
            >
              <Sparkles className="h-6 w-6" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Echo Assistant
              </h1>
              <p className="text-xs text-muted-foreground">Your personalized learning companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-secondary/30 rounded-full px-3 py-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={currentLanguage} onValueChange={(v) => setDetectedLanguage(v)}>
                <SelectTrigger className="w-40 border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🔍 Auto-Detect</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                  <SelectItem value="pt">🇵🇹 Português</SelectItem>
                  <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                  <SelectItem value="zh">🇨🇳 中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Setup Status Banner */}
      {setupError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800 p-4"
        >
          <div className="max-w-5xl mx-auto flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                Setup Required
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                {setupError}
              </p>
              <div className="space-y-2 text-sm  text-yellow-800 dark:text-yellow-300">
                <p>
                  <strong>Quick Fix:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Deploy the function: <code className="bg-black/20 px-2 py-1 rounded">supabase functions deploy echo-assistant</code></li>
                  <li>Set API key: <code className="bg-black/20 px-2 py-1 rounded">supabase secrets set LOVABLE_API_KEY="your-key"</code></li>
                  <li>Restart: <code className="bg-black/20 px-2 py-1 rounded">npm run dev</code></li>
                </ol>
                <button
                  onClick={() => {
                    verifyEchoAssistantSetup();
                    console.log("Check browser console above ⬆️");
                  }}
                  className="text-yellow-700 dark:text-yellow-300 underline hover:no-underline mt-2"
                >
                  🔍 Run setup verification in console
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {setupComplete === true && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800 p-2"
        >
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>✅ Setup complete! Echo Assistant is ready.</span>
          </div>
        </motion.div>
      )}

      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center max-w-2xl"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6"
            >
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white mx-auto shadow-2xl">
                <span className="text-5xl">🎓</span>
              </div>
            </motion.div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to Echo Assistant
            </h2>
            <Card className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur border-blue-200/50 dark:border-blue-800/50">
              <p className="text-lg text-foreground mb-4 leading-relaxed">
                {WELCOME_MESSAGES[currentLanguage] || WELCOME_MESSAGES.en}
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-sm">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  ✨ Echo-Friendly
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  🌍 Multi-lingual
                </span>
                <span className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                  🎯 Personalized
                </span>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Chat Area */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md">
                      ✨
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none shadow-md"
                        : "bg-white dark:bg-slate-800 text-foreground rounded-bl-none shadow-md border border-border"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {(() => {
                          const mermaidMatch = msg.content.match(/```mermaid\n([\s\S]*?)```/i);
                          if (mermaidMatch) {
                            return <MermaidRenderer code={mermaidMatch[1]} />;
                          }
                          const chartMatch = msg.content.match(/```chart-json\n([\s\S]*?)```/i);
                          if (chartMatch) {
                            try {
                              const json = JSON.parse(chartMatch[1]);
                              return <ChartRenderer data={json} />;
                            } catch {
                              return <pre className="whitespace-pre-wrap">Invalid chart data</pre>;
                            }
                          }
                          return <ReactMarkdown>{msg.content}</ReactMarkdown>;
                        })()}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      👤
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  ✨
                </div>
                <div className="rounded-2xl bg-white dark:bg-slate-800 px-4 py-3 shadow-md">
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Loader2 className="h-4 w-4 text-blue-500" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card/60 backdrop-blur-md p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentLanguage === "hi"
                  ? "अपना सवाल यहाँ लिखें..."
                  : currentLanguage === "es"
                  ? "Escribe tu pregunta aquí..."
                  : "Type your question..."
              }
              disabled={isLoading || listening}
              className="flex-1 text-sm bg-white/50 dark:bg-black/20 border-border"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => (listening ? stopListening() : startListening())}
              className={`shrink-0 rounded-full ${listening ? "bg-red-500/20 text-red-600" : "bg-secondary/50 hover:bg-secondary"}`}
              title={listening ? "Stop recording" : "Start voice input"}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={() => (isSpeaking ? stopSpeaking() : speak(input))}
              disabled={!input.trim()}
              className={`shrink-0 rounded-full ${isSpeaking ? "bg-blue-500/20 text-blue-600" : "bg-secondary/50 hover:bg-secondary"}`}
              title={isSpeaking ? "Stop speaking" : "Speak input"}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assistant Settings</DialogTitle>
            <DialogDescription>Customize your experience with Echo Assistant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Language Preference</label>
              <Select value={userPreferredLanguage} onValueChange={setUserPreferredLanguage}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🔍 Auto-Detect (Recommended)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Communication Style</label>
              <Select value={userPreferredStyle} onValueChange={setUserPreferredStyle}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🔍 Auto-Detect (Recommended)</SelectItem>
                  <SelectItem value="enthusiastic">🎉 Enthusiastic</SelectItem>
                  <SelectItem value="inquisitive">🤔 Inquisitive</SelectItem>
                  <SelectItem value="brief">⚡ Brief</SelectItem>
                  <SelectItem value="neutral">😊 Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Card className="p-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                💡 <strong>Tip:</strong> Auto-detect provides the best experience! The assistant will automatically adapt to your language and communication style.
              </p>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default EchoFriendlyAssistant;
