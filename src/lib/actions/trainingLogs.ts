"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTrainingLog(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const exerciseId = String(formData.get("exercise_id") || "") || null;

  const { error } = await supabase.from("training_logs").insert({
    user_id: user.id,
    log_date: String(formData.get("log_date")),
    exercise_id: exerciseId,
    exercise_name: String(formData.get("exercise_name")),
    muscle_group: String(formData.get("muscle_group") || "") || null,
    set_number: toIntOrNull(formData.get("set_number")),
    reps: String(formData.get("reps") || "") || null,
    weight: toNumberOrNull(formData.get("weight")),
    unit: String(formData.get("unit") || "KG"),
    rpe: toIntOrNull(formData.get("rpe")),
    notes: String(formData.get("notes") || "") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function updateTrainingLog(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("training_logs")
    .update({
      exercise_name: String(formData.get("exercise_name")),
      muscle_group: String(formData.get("muscle_group") || "") || null,
      set_number: toIntOrNull(formData.get("set_number")),
      reps: String(formData.get("reps") || "") || null,
      weight: toNumberOrNull(formData.get("weight")),
      unit: String(formData.get("unit") || "KG"),
      rpe: toIntOrNull(formData.get("rpe")),
      notes: String(formData.get("notes") || "") || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteTrainingLog(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("training_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

function toIntOrNull(v: FormDataEntryValue | null) {
  if (v === null || v === "") return null;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
}
function toNumberOrNull(v: FormDataEntryValue | null) {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
