const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function getUtcDayNumber(date: Date) {
    return Math.floor(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
        ) / MILLISECONDS_PER_DAY,
    );
}

export function calculateLoginStreak(
    currentStreak: number,
    lastLoginDate: Date | null,
    currentDate: Date,
) {
    if (!lastLoginDate) {
        return 1;
    }

    const daysSinceLastLogin =
        getUtcDayNumber(currentDate) -
        getUtcDayNumber(new Date(lastLoginDate));

    if (daysSinceLastLogin === 0) {
        return currentStreak;
    }

    if (daysSinceLastLogin === 1) {
        return currentStreak + 1;
    }

    return 1;
}