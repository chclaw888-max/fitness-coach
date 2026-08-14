"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertBodyMetric(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("body_metrics").upsert(
    {
      user_id: user.id,
      measured_date: String(formData.get("measured_date")),
      weight: toNumberOrNull(formData.get("weight")),
      body_fat: toNumberOrNull(formData.get("body_fat")),
      visceral_fat: toNumberOrNull(formData.get("visceral_fat")),
      muscle_mass: toNumberOrNull(formData.get("muscle_mass")),
      notes: String(formData.get("notes") || "") || null,
    },
    { onConflict: "user_id,measured_date" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/metrics");
  revalidatePath("/dashboard");
}

export async function updateBodyMetric(id: string, formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("body_metrics")
    .update({
      measured_date: String(formData.get("measured_date")),
      weight: toNumberOrNull(formData.get("weight")),
      body_fat: toNumberOrNull(formData.get("body_fat")),
      visceral_fat: toNumberOrNull(formData.get("visceral_fat")),
      muscle_mass: toNumberOrNull(formData.get("muscle_mass")),
      notes: String(formData.get("notes") || "") || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/metrics");
  revalidatePath("/dashboard");
}

export async function deleteBodyMetric(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("body_metrics").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/metrics");
  revalidatePath("/dashboard");
}

function toNumberOrNull(v: FormDataEntryValue | null) {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
