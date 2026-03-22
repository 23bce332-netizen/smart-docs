import { supabase } from "@/lib/supabase";

export interface Reminder {
  id: string;
  user_id: string;
  document_id: string;
  reminder_date: string;
  triggered: boolean;
  created_at: string;
}

export const createReminder = async (reminder: {
  user_id: string;
  document_id: string;
  reminder_date: string;
}) => {
  const { data, error } = await supabase
    .from("reminders")
    .insert({ ...reminder, triggered: false })
    .select()
    .single();
  if (error) throw error;
  return data as Reminder;
};

export const getUserReminders = async (userId: string) => {
  const { data, error } = await supabase
    .from("reminders")
    .select("*, documents(*)")
    .eq("user_id", userId)
    .order("reminder_date", { ascending: true });
  if (error) throw error;
  return data;
};

export const deleteReminder = async (id: string) => {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
};
