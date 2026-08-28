import { supabase } from "@/services/supabase"

export type Habit = {
    id: string
    user_id: string
    title: string
    color: string | null
    created_at: string
}

export async function getHabits(): Promise<Habit[]> {
    const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: true })
    if (error) throw error
    return data ?? []
}

export async function createHabit(title: string, color: string) {
    const { error } = await supabase.from("habits").insert({ title, color })
    if (error) throw error
}

export async function deleteHabit(id: string) {
    const { error } = await supabase.from("habits").delete().eq("id", id)
    if (error) throw error
}