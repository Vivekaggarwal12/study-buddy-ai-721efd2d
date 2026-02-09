import { motion } from "framer-motion";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb, Volume2 } from "lucide-react";
import MermaidRenderer from "./MermaidRenderer";
import ChartRenderer from "./ChartRenderer";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";

interface ExplanationCardProps {
  explanation: string;
}

const ExplanationCard = ({ explanation }: ExplanationCardProps) => {
  const { speaking: isSpeaking, speak, stop } = useSpeechSynthesis({ lang: 'en-US', rate: 0.95 });

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(explanation.replace(/```[^`]*```/g, ''));
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-card"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground">Simple Explanation</h3>
        <button
          onClick={handleSpeak}
          className="ml-auto p-2 rounded-lg hover:bg-primary/10 transition-colors"
          aria-label={isSpeaking ? 'Stop speaking' : 'Speak explanation'}
        >
          <Volume2 className={`h-5 w-5 ${isSpeaking ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
        </button>
      </div>
      <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed">
        {(() => {
          const mermaidMatch = explanation.match(/```mermaid\n([\s\S]*?)```/i)
          if (mermaidMatch) {
            const code = mermaidMatch[1]
            return <MermaidRenderer code={code} />
          }
          const chartMatch = explanation.match(/```chart-json\n([\s\S]*?)```/i)
          if (chartMatch) {
            try {
              const json = JSON.parse(chartMatch[1])
              return <ChartRenderer data={json} />
            } catch {
              return <pre className="whitespace-pre-wrap">Invalid chart JSON</pre>
            }
          }
          return <ReactMarkdown>{explanation}</ReactMarkdown>
        })()}
      </div>
    </motion.div>
  );
};

export default ExplanationCard;
