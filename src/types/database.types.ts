export type PeriodType = "year" | "month" | "week";

export interface Goal {
  id: string;
  user_id: string;
  period_type: PeriodType;
  period_label: string;
  title: string;
  metric_name: string | null;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  is_checklist: boolean;
  is_completed: boolean;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string | null;
  category: string | null;
  default_unit: string | null;
  default_sets: number | null;
  default_reps: string | null;
  notes: string | null;
  created_at: string;
}

export interface TrainingLog {
  id: string;
  user_id: string;
  log_date: string;
  exercise_id: string | null;
  exercise_name: string;
  muscle_group: string | null;
  sets: number | null;
  reps: string | null;
  weight: number | null;
  unit: string | null;
  notes: string | null;
  created_at: string;
}

export interface BodyMetric {
  id: string;
  user_id: string;
  measured_date: string;
  weight: number | null;
  body_fat: number | null;
  visceral_fat: number | null;
  muscle_mass: number | null;
  notes: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

// 簡化版 Database 型別，供 @supabase/ssr 的泛型使用
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      goals: { Row: Goal; Insert: Partial<Goal>; Update: Partial<Goal> };
      exercises: { Row: Exercise; Insert: Partial<Exercise>; Update: Partial<Exercise> };
      training_logs: { Row: TrainingLog; Insert: Partial<TrainingLog>; Update: Partial<TrainingLog> };
      body_metrics: { Row: BodyMetric; Insert: Partial<BodyMetric>; Update: Partial<BodyMetric> };
    };
  };
}
