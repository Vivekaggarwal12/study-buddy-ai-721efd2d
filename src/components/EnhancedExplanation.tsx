import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronRight, ChevronDown, CheckCircle2, BookOpen, Youtube, Volume2, Pause, Play } from "lucide-react";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import ReactMarkdown from "react-markdown";
import MermaidRenderer from "./MermaidRenderer";
import ChartRenderer from "./ChartRenderer";

interface EnhancedExplanationProps {
  explanation: string;
  topic: string;
}

const EnhancedExplanation = ({ explanation, topic }: EnhancedExplanationProps) => {
  const paragraphs = explanation.split(/\n\n+/).filter((p) => p.trim());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const { speaking, paused, speak, pause, resume, stop } = useSpeechSynthesis({ lang: 'en-US', rate: 0.95 });

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const markComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const progress = paragraphs.length > 0 ? (completedSteps.size / paragraphs.length) * 100 : 0;

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " explained")}`;
  const khanAcademyUrl = `https://www.khanacademy.org/search?search_query=${encodeURIComponent(topic)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-display font-semibold text-foreground">
            Step-by-Step Explanation
          </h3>
          <p className="text-xs text-muted-foreground">
            {completedSteps.size} of {paragraphs.length} steps completed
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-hero"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Step-by-step cards */}
      <div className="space-y-3 mb-6">
        {paragraphs.map((paragraph, i) => {
          const isExpanded = expandedStep === i;
          const isDone = completedSteps.has(i);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className={`rounded-xl border bg-card shadow-card transition-all ${
                isDone
                  ? "border-primary/40 bg-primary/5"
                  : "border-border"
              }`}
            >
              <button
                onClick={() => toggleStep(i)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markComplete(i);
                  }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                </button>
                <span
                  className={`flex-1 font-medium text-sm ${
                    isDone ? "text-primary" : "text-foreground"
                  }`}
                >
                  Step {i + 1}: {paragraph.slice(0, 60).trim()}
                  {paragraph.length > 60 ? "..." : ""}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (speaking) stop();
                    else speak(paragraph);
                  }}
                  className="p-1 rounded hover:bg-primary/10 transition-colors mr-2"
                  aria-label={speaking ? 'Stop speaking' : 'Speak step'}
                >
                  {speaking ? (
                    <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-14">
                      <div className="prose prose-sm max-w-none text-foreground/85 leading-relaxed">
                        {(() => {
                          const mermaidMatch = paragraph.match(/```mermaid\n([\s\S]*?)```/i)
                          if (mermaidMatch) {
                            const code = mermaidMatch[1]
                            return <MermaidRenderer code={code} />
                          }
                          const chartMatch = paragraph.match(/```chart-json\n([\s\S]*?)```/i)
                          if (chartMatch) {
                            try {
                              const json = JSON.parse(chartMatch[1])
                              return <ChartRenderer data={json} />
                            } catch {
                              return <pre className="whitespace-pre-wrap">Invalid chart JSON</pre>
                            }
                          }
                          return <ReactMarkdown>{paragraph}</ReactMarkdown>
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Resources */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h4 className="text-sm font-display font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          Visual & Video Resources
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-destructive/40 hover:bg-destructive/5 transition-all group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <Youtube className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-destructive transition-colors">
                YouTube Videos
              </p>
              <p className="text-xs text-muted-foreground">
                Watch visual explanations
              </p>
            </div>
          </a>
          <a
            href={khanAcademyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Khan Academy
              </p>
              <p className="text-xs text-muted-foreground">
                Interactive lessons & practice
              </p>
            </div>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedExplanation;
