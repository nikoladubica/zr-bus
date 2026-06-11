const parseMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
};

// Returns minutes until the next departure, or null if none left today.
// departures: flat array of objects with a `departure` field like "14:30:00"
export const nextDepartureMinutes = (departures, now = new Date()) => {
    const current = now.getHours() * 60 + now.getMinutes();
    const times = departures
        .map((d) => parseMinutes(d.departure))
        .filter((t) => t !== null && t >= current)
        .sort((a, b) => a - b);
    return times.length > 0 ? times[0] - current : null;
};

// Human label: "sad", "4 min", "1 h 20 min", or the fallback string.
export const countdownLabel = (minutesAway, cyrillic = false) => {
    if (minutesAway === null) return cyrillic ? 'нема полазака' : 'nema polazaka';
    if (minutesAway === 0) return 'sad';
    if (minutesAway < 60) return `${minutesAway} min`;
    const h = Math.floor(minutesAway / 60);
    const m = minutesAway % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

// Returns the next N formatted times ("HH:mm") after the first upcoming departure.
export const followingTimes = (departures, now = new Date(), limit = 4) => {
    const current = now.getHours() * 60 + now.getMinutes();
    return departures
        .map((d) => ({ min: parseMinutes(d.departure), fmt: d.departure.slice(0, 5) }))
        .filter((d) => d.min !== null && d.min > current)
        .sort((a, b) => a.min - b.min)
        .slice(1, limit + 1)
        .map((d) => d.fmt);
};
