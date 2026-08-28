import { supabase } from "@/services/supabase"

export type HabitLog = {
    id: string
    habit_id: string
    user_id: string
    date: string
    created_at: string
}

// сегодняшняя дата в формате ГГГГ-ММ-ДД по местному времени
export function today(): string {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

export async function getLogs(): Promise<HabitLog[]> {
    const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .order("date", { ascending: false })
    if (error) throw error
    return data ?? []
}

export async function markToday(habitId: string) {
    const { error } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habitId, date: today() })
    if (error) throw error
}

export async function unmarkToday(habitId: string) {
    const { error } = await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("date", today())
    if (error) throw error
}