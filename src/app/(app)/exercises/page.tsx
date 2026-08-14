import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/types/database.types";
import AddExerciseForm from "@/components/exercises/AddExerciseForm";
import ExerciseTable from "@/components/exercises/ExerciseTable";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const supabase = createClient();
  const { data } = await supabase.from("exercises").select("*").order("created_at", { ascending: true });
  const exercises = (data ?? []) as Exercise[];

  return (
    <div className="space-y-8">
      <div>
        <div className="section-eyebrow">Exercises</div>
        <h1 className="font-display text-2xl mt-1">訓練項目</h1>
        <p className="text-sm text-muted mt-1">
          建立你的訓練動作庫，之後在行事曆中即可快速選用。
        </p>
      </div>

      <AddExerciseForm />
      <ExerciseTable exercises={exercises} />
    </div>
  );
}
