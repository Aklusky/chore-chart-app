export function toDateInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getTodayInputValue() {
    return toDateInputValue(new Date());
}

export function getDayNumber(dateString: string) {
    return new Date(`${dateString}T00:00:00`).getDate();
}

export function getWeekNumber(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`);

    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);

    const pastDays =
        (date.getTime() - firstDayOfYear.getTime()) / 86400000;

    return Math.floor((pastDays + firstDayOfYear.getDay()) / 7);
}

export function isWeekday(dateString: string) {
    const day = new Date(`${dateString}T00:00:00`).getDay();

    return day >= 1 && day <= 5;
}