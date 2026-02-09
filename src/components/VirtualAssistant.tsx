import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Mic, Volume2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MermaidRenderer from "./MermaidRenderer";
import ChartRenderer from "./ChartRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const VirtualAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("General Studies");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { listening, transcript, start: startListening, stop: stopListening } = useSpeechRecognition({
    lang: language === 'hi' ? 'hi-IN' : 'en-US',
    interimResults: true,
  });

  const { speaking: isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis({
    lang: language === 'hi' ? 'hi-IN' : 'en-US',
    rate: 0.95,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    if (listening) stopListening();

    const userMsg: Message = { role: "user", content: messageText.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-tutor`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
          topic,
          language,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to connect to assistant");
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

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
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
          } catch { /* ignore */ }
        }
      }

      // Auto-read assistant response
      if (assistantContent) {
        speak(assistantContent.replace(/```[^`]*```/g, ''));
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error: ${err.message}. Please try again.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5"
    >
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-hero text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Study Buddy AI</h1>
              <p className="text-xs text-muted-foreground">Your personal learning assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select onValueChange={(v) => setLanguage(v as 'en' | 'hi')} defaultValue={language}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar & Welcome */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6 inline-block"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary/80 text-white mx-auto shadow-lg">
                <span className="text-4xl">🤖</span>
              </div>
            </motion.div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              Hello! I'm your Study Buddy
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              {language === 'hi'
                ? "नमस्ते! मैं आपका पढ़ाई सहायक हूं। कुछ भी सीखने के लिए मुझसे पूछें।"
                : "I can help you learn anything! Ask me questions, and I'll explain with diagrams, charts, and examples."}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>💬 Ask questions • 🎤 Use voice input • 🔊 Hear explanations • 📊 See diagrams</p>
            </div>
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
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span>🤖</span>
                    </div>
                  )}
                  <div
                    className={`max-w-xs rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-foreground/85">
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
                      <p>{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  🤖
                </div>
                <div className="rounded-xl bg-muted px-4 py-3">
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Loader2 className="h-4 w-4 text-primary" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'hi' ? "अपना सवाल यहाँ लिखें..." : "Type your question..."}
              disabled={isLoading || listening}
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => (listening ? stopListening() : startListening())}
              className={`shrink-0 ${listening ? 'bg-red-500/20 text-red-600' : ''}`}
              aria-label={listening ? 'Stop recording' : 'Start voice input'}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={() => (isSpeaking ? stopSpeaking() : speak(input))}
              disabled={!input.trim()}
              className={`shrink-0 ${isSpeaking ? 'bg-blue-500/20 text-blue-600' : ''}`}
              aria-label={isSpeaking ? 'Stop speaking' : 'Speak input'}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-hero text-primary-foreground hover:opacity-90 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default VirtualAssistant;
