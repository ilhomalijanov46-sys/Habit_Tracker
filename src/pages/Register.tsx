import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/services/supabase"

export function Register() {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        })
        setLoading(false)
        if (error) setError(error.message)
        else navigate("/")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm space-y-4">
                <h1 className="text-2xl font-semibold text-center dark:text-white">Регистрация</h1>
                <input
                    placeholder="Имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                    type="password"
                    placeholder="Пароль (мин. 6 символов)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white rounded-lg py-2 font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                    {loading ? "Создаём…" : "Зарегистрироваться"}
                </button>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Уже есть аккаунт? <Link to="/login" className="text-black dark:text-white underline">Войти</Link>
                </p>
            </form>
        </div>
    )
}