"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const isChecklist = formData.get("is_checklist") === "on";

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    period_type: String(formData.get("period_type")),
    period_label: String(formData.get("period_label")),
    title: String(formData.get("title")),
    metric_name: isChecklist ? null : (String(formData.get("metric_name") || "") || null),
    target_value: isChecklist ? null : toNumberOrNull(formData.get("target_value")),
    current_value: isChecklist ? null : (toNumberOrNull(formData.get("current_value")) ?? 0),
    unit: isChecklist ? null : (String(formData.get("unit") || "") || null),
    is_checklist: isChecklist,
    notes: String(formData.get("notes") || "") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function updateGoalProgress(id: string, current_value: number) {
  const supabase = createClient();
  const { error } = await supabase.from("goals").update({ current_value, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function toggleGoalCompleted(id: string, is_completed: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("goals").update({ is_completed, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteGoal(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

function toNumberOrNull(v: FormDataEntryValue | null) {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
