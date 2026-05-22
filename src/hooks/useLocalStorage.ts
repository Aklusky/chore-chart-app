import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, fallback: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key);

            if (!saved) {
                return fallback;
            }

            return JSON.parse(saved);
        } catch (error) {
            console.error(`Failed to parse localStorage key "${key}"`, error);

            localStorage.removeItem(key);

            return fallback;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}