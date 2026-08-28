import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts"
import { getHabits, type Habit } from "@/services/habitService"
import { getLogs, type HabitLog } from "@/services/habitLogService"
import { useTheme } from "@/context/ThemeContext"

function iso(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

export function Statistics() {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const [habits, setHabits] = useState<Habit[]>([])
    const [logs, setLogs] = useState<HabitLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getHabits(), getLogs()]).then(([h, l]) => {
            setHabits(h)
            setLogs(l)
            setLoading(false)
        })
    }, [])

    const weeks = []
    for (let k = 7; k >= 0; k--) {
        const end = new Date()
        end.setDate(end.getDate() - k * 7)
        const start = new Date(end)
        start.setDate(start.getDate() - 6)
        const startIso = iso(start)
        const endIso = iso(end)
        const count = logs.filter((l) => l.date >= startIso && l.date <= endIso).length
        const possible = habits.length * 7
        const percent = possible > 0 ? Math.min(100, Math.round((count / possible) * 100)) : 0
        weeks.push({
            week: start.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
            Процент: percent,
        })
    }

    const from = new Date()
    from.setDate(from.getDate() - 29)
    const fromIso = iso(from)
    const perHabit = habits.map((h) => {
        const days = new Set(
            logs.filter((l) => l.habit_id === h.id && l.date >= fromIso).map((l) => l.date)
        )
        return { habit: h, percent: Math.round((days.size / 30) * 100) }
    })

    const maxPerDay = Math.max(1, habits.length)
    const heat = []
    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayIso = iso(d)
        const count = logs.filter((l) => l.date === dayIso).length
        heat.push({
            count,
            label: d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        })
    }

    function cellColor(count: number) {
        if (count === 0) return isDark ? "#374151" : "#ebedf0"
        const alpha = 0.3 + 0.7 * Math.min(1, count / maxPerDay)
        return `rgba(34, 197, 94, ${alpha})`
    }

    const totalMarks = heat.reduce((s, d) => s + d.count, 0)
    const avgSuccess =
        perHabit.length > 0
            ? Math.round(perHabit.reduce((s, p) => s + p.percent, 0) / perHabit.length)
            : 0

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold dark:text-white">Статистика</h1>
                    <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 underline">
                        На главную
                    </Link>
                </div>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Загрузка…</p>
                ) : habits.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        Пока нет данных.{" "}
                        <Link to="/habits" className="underline text-black dark:text-white">
                            Добавь привычку
                        </Link>{" "}
                        и отметь пару дней.
                    </p>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Выполнение по неделям</p>
                            <p className="text-xs text-gray-400 mb-4">
                                Средняя успешность за 30 дней: {avgSuccess}%
                            </p>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weeks}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f0f0f0"} />
                                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: isDark ? "#9ca3af" : "#666" }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: isDark ? "#9ca3af" : "#666" }} axisLine={false} tickLine={false} width={40} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="Процент" stroke={isDark ? "#ffffff" : "#000000"} strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Успешность по привычкам (30 дней)</p>
                            <ul className="space-y-3">
                                {perHabit.map(({ habit, percent }) => (
                                    <li key={habit.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="dark:text-white">{habit.title}</span>
                                            <span className="text-gray-500 dark:text-gray-400">{percent}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${percent}%`, backgroundColor: habit.color ?? "#000" }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Активность за 30 дней</p>
                            <p className="text-xs text-gray-400 mb-4">Всего отметок: {totalMarks}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {heat.map((d, idx) => (
                                    <div
                                        key={idx}
                                        className="w-6 h-6 rounded"
                                        style={{ backgroundColor: cellColor(d.count) }}
                                        title={`${d.label}: ${d.count} отметок`}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}