import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, RotateCcw, X, Coffee, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type TimerMode = "focus" | "break";

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

const PomodoroTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = mode === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setSecondsLeft(newMode === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === "focus") {
              setSessions((s) => s + 1);
              toast.success("Focus session complete! Time for a break 🎉");
              switchMode("break");
            } else {
              toast.success("Break's over! Ready for another focus session? 💪");
              switchMode("focus");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, switchMode]);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(mode === "focus" ? FOCUS_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isRunning ? (
          <span className="text-sm font-bold tabular-nums">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        ) : (
          <Timer className="h-6 w-6" />
        )}
      </motion.button>

      {/* Timer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl border border-border bg-card shadow-elevated overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-sm font-display font-semibold text-foreground">
                  Pomodoro Timer
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="grid grid-cols-2 gap-1 p-2">
              <button
                onClick={() => switchMode("focus")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                  mode === "focus"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <BookOpen className="h-3 w-3" />
                Focus
              </button>
              <button
                onClick={() => switchMode("break")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                  mode === "break"
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Coffee className="h-3 w-3" />
                Break
              </button>
            </div>

            {/* Timer display */}
            <div className="px-4 py-6 text-center">
              {/* Circular progress */}
              <div className="relative inline-flex items-center justify-center mb-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    className="stroke-muted"
                    strokeWidth="6"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    className={mode === "focus" ? "stroke-primary" : "stroke-secondary"}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold tabular-nums text-foreground">
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{mode}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={reset}
                  className="rounded-full h-10 w-10"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`rounded-full h-12 w-12 ${
                    mode === "focus"
                      ? "bg-gradient-hero text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  } hover:opacity-90`}
                >
                  {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-foreground">{sessions}</span>
                  <span className="text-[10px] text-muted-foreground">sessions</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PomodoroTimer;
