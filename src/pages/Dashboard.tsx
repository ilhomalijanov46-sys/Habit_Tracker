import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
    ListChecks,
    BarChart3,
    User,
    LogOut,
    Flame,
    Check,
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { supabase } from "@/services/supabase"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { getHabits, type Habit } from "@/services/habitService"
import {
    getLogs,
    markToday,
    unmarkToday,
    today,
    type HabitLog,
} from "@/services/habitLogService"
import { calculateStreak } from "@/utils/streak"

function iso(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

const navBtn =
    "inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"

export function Dashboard() {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [loading, setLoading] = useState(true)

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

    async function handleLogout() {
        await supabase.auth.signOut()
    }

    async function handleToggle(habitId: string, doneToday: boolean) {
        if (doneToday) await unmarkToday(habitId)
        else await markToday(habitId)
        await load()
    }

    const doneToday = habits.filter((h) =>
        logs.some((l) => l.habit_id === h.id && l.date === today())
    ).length
    const total = habits.length
    const percent = total > 0 ? Math.round((doneToday / total) * 100) : 0

    const bestStreak = habits.reduce((best, h) => {
        const dates = logs.filter((l) => l.habit_id === h.id).map((l) => l.date)
        return Math.max(best, calculateStreak(dates))
    }, 0)

    const chartData = []
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayIso = iso(d)
        const count = logs.filter((l) => l.date === dayIso).length
        chartData.push({
            day: d.toLocaleDateString("ru-RU", { weekday: "short" }),
            Выполнено: count,
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">Привет</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/habits"
                            className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800"
                        >
                            <ListChecks className="w-4 h-4" />
                            Мои привычки
                        </Link>
                        <Link to="/statistics" className={navBtn}>
                            <BarChart3 className="w-4 h-4" />
                            Статистика
                        </Link>
                        <Link to="/profile" className={navBtn}>
                            <User className="w-4 h-4" />
                            Профиль
                        </Link>
                        <button onClick={handleLogout} className={navBtn}>
                            <LogOut className="w-4 h-4" />
                            Выйти
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Загрузка…</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Выполнено сегодня</p>
                                <p className="text-6xl font-bold dark:text-white">{percent}%</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {doneToday} из {total}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center flex flex-col justify-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Лучшая серия</p>
                                <p className="text-6xl font-bold dark:text-white flex items-center justify-center gap-2">
                                    <Flame className="w-10 h-10 text-orange-500" />
                                    {bestStreak}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">дней подряд</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Выполнение за последние 7 дней
                            </p>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={chartData}>
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 12, fill: isDark ? "#9ca3af" : "#666" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip cursor={{ fill: isDark ? "#374151" : "#f3f4f6" }} />
                                    <Bar dataKey="Выполнено" fill={isDark ? "#ffffff" : "#000000"} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Привычки на сегодня</p>
                            {habits.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">
                                    Нет привычек.{" "}
                                    <Link to="/habits" className="underline text-black dark:text-white">
                                        Добавить
                                    </Link>
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {habits.map((h) => {
                                        const isDone = logs.some(
                                            (l) => l.habit_id === h.id && l.date === today()
                                        )
                                        return (
                                            <li key={h.id} className="flex items-center gap-3">
                                                <span
                                                    className="w-3 h-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: h.color ?? "#999" }}
                                                />
                                                <span className="flex-1 dark:text-white">{h.title}</span>
                                                <button
                                                    onClick={() => handleToggle(h.id, isDone)}
                                                    className={
                                                        isDone
                                                            ? "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-green-500 text-white hover:bg-green-600"
                                                            : "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    }
                                                >
                                                    <Check className="w-4 h-4" />
                                                    {isDone ? "Сделано" : "Отметить"}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}