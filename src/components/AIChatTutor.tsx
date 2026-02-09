import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, Bot, User, Sparkles, Mic, Volume2 } from "lucide-react";
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

interface AIChatTutorProps {
  topic: string;
  explanation: string;
}

const SUGGESTED_QUESTIONS = [
  "Can you give me a simpler analogy?",
  "What are common mistakes about this?",
  "How is this used in real life?",
  "Can you quiz me on this?",
];

const AIChatTutor = ({ topic, explanation }: AIChatTutorProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const { listening, transcript, error: speechError, start, stop } = useSpeechRecognition({ lang: language === 'hi' ? 'hi-IN' : 'en-US', interimResults: true })
  const { speaking: isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis({ lang: language === 'hi' ? 'hi-IN' : 'en-US', rate: 0.95 })
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) setInput(transcript)
  }, [transcript])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    if (listening) stop()

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
          context: explanation,
          language,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to connect to tutor");
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

      // Final flush
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/15">
          <MessageCircle className="h-5 w-5 text-info" />
        </div>
        <div>
          <h3 className="text-xl font-display font-semibold text-foreground">AI Tutor</h3>
          <p className="text-xs text-muted-foreground">Ask follow-up questions about {topic}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-xs text-muted-foreground">Response language:</div>
        <Select onValueChange={(v) => setLanguage(v as 'en' | 'hi')} defaultValue={language}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={language === 'en' ? 'English' : 'Hindi'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">Hindi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {/* Messages area */}
        <div
          ref={chatContainerRef}
          className="h-[360px] overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Ask me anything about {topic}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                I'll help you understand it better
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-foreground/85">
                      {/* Detect mermaid code block: ```mermaid\n...``` */}
                      {(() => {
                        const mermaidMatch = msg.content.match(/```mermaid\n([\s\S]*?)```/i)
                        if (mermaidMatch) {
                          const code = mermaidMatch[1]
                          return <MermaidRenderer code={code} />
                        }
                        const chartMatch = msg.content.match(/```chart-json\n([\s\S]*?)```/i)
                        if (chartMatch) {
                          try {
                            const json = JSON.parse(chartMatch[1])
                            return <ChartRenderer data={json} />
                          } catch {
                            return <pre className="whitespace-pre-wrap">Invalid chart JSON</pre>
                          }
                        }
                        return <ReactMarkdown>{msg.content}</ReactMarkdown>
                      })()}
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => {
                        if (speakingIndex === i) {
                          stopSpeaking();
                          setSpeakingIndex(null);
                        } else {
                          setSpeakingIndex(i);
                          speak(msg.content.replace(/```[^`]*```/g, ''));
                        }
                      }}
                      className="p-1 rounded hover:bg-primary/10 transition-colors w-fit"
                      aria-label="Speak message"
                    >
                      <Volume2 className={`h-3 w-3 ${
                        speakingIndex === i ? 'text-primary animate-pulse' : 'text-muted-foreground'
                      }`} />
                    </button>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary mt-1">
                    <User className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-xl bg-muted px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border p-3 flex gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => (listening ? stop() : start())}
            className={`shrink-0 mr-1 ${listening ? 'bg-red-500/10' : ''}`}
            aria-label={listening ? 'Stop recording' : 'Start voice input'}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-hero text-primary-foreground hover:opacity-90 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default AIChatTutor;
