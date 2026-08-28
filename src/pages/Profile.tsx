import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Moon, Sun, Check, ArrowLeft } from "lucide-react"
import { supabase } from "@/services/supabase"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"

export function Profile() {
    const { user } = useAuth()
    const { theme, toggle } = useTheme()
    const [name, setName] = useState("")
    const [saved, setSaved] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase
            .from("profiles")
            .select("name")
            .eq("id", user?.id)
            .single()
            .then(({ data }) => {
                setName(data?.name ?? "")
                setLoading(false)
            })
    }, [user])

    async function handleSave() {
        await supabase.from("profiles").update({ name }).eq("id", user?.id)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const initial = (name || user?.email || "?").charAt(0).toUpperCase()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-md mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold dark:text-white">Профиль</h1>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        На главную
                    </Link>
                </div>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400">Загрузка…</p>
                ) : (
                    <>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                                    {initial}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                    <p className="dark:text-white">{user?.email}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                                    Имя
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-800"
                            >
                                {saved && <Check className="w-4 h-4" />}
                                {saved ? "Сохранено" : "Сохранить"}
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <p className="font-medium dark:text-white">Тёмная тема</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Сейчас: {theme === "dark" ? "тёмная" : "светлая"}
                                </p>
                            </div>
                            <button
                                onClick={toggle}
                                className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 dark:text-white rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {theme === "dark" ? (
                                    <>
                                        <Sun className="w-4 h-4" />
                                        Светлая
                                    </>
                                ) : (
                                    <>
                                        <Moon className="w-4 h-4" />
                                        Тёмная
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}