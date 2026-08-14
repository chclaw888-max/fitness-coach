"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createExercise(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("exercises").insert({
    user_id: user.id,
    name: String(formData.get("name")),
    muscle_group: String(formData.get("muscle_group") || "") || null,
    category: String(formData.get("category") || "") || null,
    default_unit: String(formData.get("default_unit") || "KG"),
    default_sets: toIntOrNull(formData.get("default_sets")),
    default_reps: String(formData.get("default_reps") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/exercises");
  revalidatePath("/calendar");
}

export async function deleteExercise(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/exercises");
  revalidatePath("/calendar");
}

function toIntOrNull(v: FormDataEntryValue | null) {
  if (v === null || v === "") return null;
  const n = parseInt(String(v), 10);
  return Number.isNaN(n) ? null : n;
}
