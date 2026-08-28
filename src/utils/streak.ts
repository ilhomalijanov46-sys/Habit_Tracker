// Считает серию: сколько дней подряд до сегодня привычка отмечена.
// Если сегодня не отмечено, но вчера было — серия ещё жива (считаем до вчера).
// Если пропущен целый день — серия обрывается.
export function calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0
    const done = new Set(dates)

    const iso = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        return `${y}-${m}-${day}`
    }

    const cursor = new Date()
    // если сегодня ещё не отмечено — начинаем отсчёт со вчера
    if (!done.has(iso(cursor))) {
        cursor.setDate(cursor.getDate() - 1)
    }

    let streak = 0
    while (done.has(iso(cursor))) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
    }
    return streak
}