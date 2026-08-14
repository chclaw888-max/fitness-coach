"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { seedExercises, seedGoals } from "@/lib/seedData";

export async function importSeedData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { count } = await supabase
    .from("exercises")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count && count > 0) {
    // 避免重複匯入
    return { alreadyImported: true };
  }

  const exercisesPayload = seedExercises.map((e) => ({ ...e, user_id: user.id }));
  const goalsPayload = seedGoals.map((g) => ({ ...g, user_id: user.id }));

  const { error: exErr } = await supabase.from("exercises").insert(exercisesPayload);
  if (exErr) throw new Error(exErr.message);

  const { error: goalErr } = await supabase.from("goals").insert(goalsPayload);
  if (goalErr) throw new Error(goalErr.message);

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  revalidatePath("/exercises");
  return { alreadyImported: false };
}
