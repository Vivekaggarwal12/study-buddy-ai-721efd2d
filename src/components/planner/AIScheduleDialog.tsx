import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AIScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleGenerated: () => void;
}

const AIScheduleDialog = ({ open, onOpenChange, onScheduleGenerated }: AIScheduleDialogProps) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-schedule", {
        body: { prompt: prompt.trim() },
      });

      if (error) {
        console.error("Schedule generation error:", error);
        throw new Error(error.message || "Failed to generate schedule");
      }

      if (!data?.schedule || !Array.isArray(data.schedule)) {
        console.error("Invalid schedule format:", data);
        throw new Error("Invalid schedule format received");
      }

      const plans = data.schedule.map((plan: any) => ({
        user_id: user.id,
        topic: plan.topic,
        day_of_week: plan.day_of_week,
        start_time: plan.start_time,
        end_time: plan.end_time,
        color: plan.color || "#3b82f6",
      }));

      const { error: insertError } = await supabase.from("study_plans").insert(plans);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error(`Failed to save: ${insertError.message}`);
      }

      toast.success(`${plans.length} study sessions created!`);
      setPrompt("");
      onOpenChange(false);
      onScheduleGenerated();
    } catch (err: any) {
      console.error("Error:", err);
      toast.error(err?.message || "Failed to generate schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Schedule Generator
          </DialogTitle>
          <DialogDescription>
            Describe your goals and time constraints, and AI will create a personalized weekly study schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Example: I'm preparing for GATE exam, need to study Data Structures, Algorithms, and OS. I have college from 9 AM to 5 PM on weekdays. I want to practice LeetCode on weekends."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIScheduleDialog;
