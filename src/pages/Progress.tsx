import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  BookOpen,
  Target,
  Flame,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface QuizScore {
  id: string;
  topic: string;
  score: number;
  total_questions: number;
  created_at: string;
}

interface StudyHistoryItem {
  id: string;
  topic: string;
  created_at: string;
}

const COLORS = [
  "hsl(158, 45%, 32%)",
  "hsl(38, 80%, 55%)",
  "hsl(210, 80%, 55%)",
  "hsl(0, 72%, 51%)",
  "hsl(270, 60%, 55%)",
  "hsl(180, 60%, 45%)",
];

const Progress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [history, setHistory] = useState<StudyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [scoresRes, historyRes] = await Promise.all([
      supabase
        .from("quiz_scores")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50),
      supabase
        .from("study_history")
        .select("id, topic, created_at")
        .order("created_at", { ascending: true })
        .limit(100),
    ]);

    setScores(scoresRes.data || []);
    setHistory(historyRes.data || []);
    setLoading(false);
  };

  // Calculate stats
  const totalTopics = new Set(history.map((h) => h.topic)).size;
  const totalQuizzes = scores.length;
  const avgScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, s) => sum + (s.score / s.total_questions) * 100, 0) /
            scores.length
        )
      : 0;
  const bestScore =
    scores.length > 0
      ? Math.round(
          Math.max(...scores.map((s) => (s.score / s.total_questions) * 100))
        )
      : 0;

  // Calculate study streak
  const studyDates = new Set(
    history.map((h) => new Date(h.created_at).toDateString())
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (studyDates.has(d.toDateString())) {
      streak++;
    } else if (i > 0) break;
  }

  // Quiz score trend data
  const scoreTrendData = scores.slice(-10).map((s, i) => ({
    name: `Q${i + 1}`,
    score: Math.round((s.score / s.total_questions) * 100),
    topic: s.topic.length > 15 ? s.topic.slice(0, 15) + "..." : s.topic,
  }));

  // Topics by frequency
  const topicFrequency: Record<string, number> = {};
  history.forEach((h) => {
    topicFrequency[h.topic] = (topicFrequency[h.topic] || 0) + 1;
  });
  const topTopics = Object.entries(topicFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([topic, count]) => ({
      name: topic.length > 18 ? topic.slice(0, 18) + "..." : topic,
      value: count,
    }));

  // Study activity by day
  const dayActivity: Record<string, number> = {};
  history.forEach((h) => {
    const date = new Date(h.created_at).toLocaleDateString("en-US", {
      weekday: "short",
    });
    dayActivity[date] = (dayActivity[date] || 0) + 1;
  });
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityData = weekDays.map((day) => ({
    day,
    sessions: dayActivity[day] || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 flex items-center gap-3 h-14">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">
              Progress Analytics
            </span>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Stats overview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8"
        >
          {[
            { icon: BookOpen, label: "Topics", value: totalTopics, color: "text-primary" },
            { icon: Trophy, label: "Quizzes", value: totalQuizzes, color: "text-secondary" },
            { icon: Target, label: "Avg Score", value: `${avgScore}%`, color: "text-info" },
            { icon: TrendingUp, label: "Best Score", value: `${bestScore}%`, color: "text-success" },
            { icon: Flame, label: "Day Streak", value: streak, color: "text-destructive" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 shadow-card text-center"
            >
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Score Trend */}
          {scoreTrendData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Quiz Score Trend
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, _: any, props: any) => [
                      `${value}%`,
                      props.payload.topic,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(158, 45%, 32%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(158, 45%, 32%)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Topics Studied */}
          {topTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-secondary" />
                Most Studied Topics
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={topTopics}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {topTopics.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value} sessions`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {topTopics.map((t, i) => (
                  <span
                    key={t.name}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-border"
                    style={{ borderColor: COLORS[i % COLORS.length] + "60" }}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-5 shadow-card md:col-span-2"
          >
            <h3 className="text-sm font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-info" />
              Weekly Study Activity
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} sessions`, "Activity"]}
                />
                <Bar dataKey="sessions" fill="hsl(158, 45%, 32%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Empty state */}
        {scores.length === 0 && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <TrendingUp className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              No data yet
            </h3>
            <p className="text-muted-foreground">
              Start studying and taking quizzes to see your progress here!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Progress;
