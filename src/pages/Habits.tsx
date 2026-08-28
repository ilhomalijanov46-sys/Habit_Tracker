import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { Plus, Trash2, Check, Flame, ArrowLeft } from "lucide-react"
import {
    getHabits,
    createHabit,
    deleteHabit,
    type Habit,
} from "@/services/habitService"
import {
    getLogs,
    markToday,
    unmarkToday,
    today,
    type HabitLog,
} from "@/services/habitLogService"
import { calculateStreak } from "@/utils/streak"

// Палитра из 20 цветов (в стиле Google Sheets)
const COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#78716c", "#64748b", "#6b7280",
]

export function Habits() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState("")
    const [color, setColor] = useState(COLORS[10]) // синий по умолчанию

    async function load() {
        setLoading(true)
        const [h, l] = await Promise.all([getHabits(), getLogs()])
        setHabits(h)
        setLogs(l)
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    async function handleAdd(e: FormEvent) {
        e.preventDefault()
        if (!title.trim()) return
        await createHabit(title.trim(), color)
        setTitle("")
        await load()
    }

    async function handleDelete(id: string) {
        await deleteHabit(id)
        await load()
    }

    async function handleToggle(habitId: string, doneToday: boolean) {
        if (doneToday) await unmarkToday(habitId)
        else await markToday(habitId)
        await load()
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold dark:text-white">Мои привычки</h1>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        На главную
                    </Link>
                </div>

                {/* Форма добавления */}
                <form
                    onSubmit={handleAdd}
                    className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm space-y-4"
                >
                    <input
                        placeholder="Новая привычка (например, Пить воду)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Цвет</p>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${color === c
                                            ? "ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-gray-800"
                                            : "hover:scale-110"
                                        }`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                >
                                    {color === c && (
                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-800"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить
                    </button>
                </form>

                {/* Список */}
                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Загрузка…</p>
                ) : habits.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        Пока нет привычек. Добавь первую в форме выше.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {habits.map((habit) => {
                            const habitDates = logs
                                .filter((l) => l.habit_id === habit.id)
                                .map((l) => l.date)
                            const doneToday = habitDates.includes(today())
                            const streak = calculateStreak(habitDates)
                            return (
                                <li
                                    key={habit.id}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center gap-4"
                                >
                                    <span
                                        className="w-4 h-4 rounded-full shrink-0"
                                        style={{ backgroundColor: habit.color ?? "#999" }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium dark:text-white">{habit.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            {streak > 0 ? (
                                                <>
                                                    <Flame className="w-4 h-4 text-orange-500" />
                                                    Серия: {streak} дн.
                                                </>
                                            ) : (
                                                "Серии пока нет"
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(habit.id, doneToday)}
                                        className={
                                            doneToday
                                                ? "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium bg-green-500 text-white hover:bg-green-600"
                                                : "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium border border-gray-300 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                        }
                                    >
                                        <Check className="w-4 h-4" />
                                        {doneToday ? "Сделано" : "Отметить"}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(habit.id)}
                                        className="text-gray-400 hover:text-red-500"
                                        title="Удалить"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}