import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const jsonValue = localStorage.getItem(key);
        if (jsonValue != null) {
            try {
                return JSON.parse(jsonValue) as T;
            } catch {
                console.warn(`Error parsing localStorage key "${key}". Using initial value.`);
            }
        }

        // Return initialValue directly or invoke it if it's a function
        return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value, setValue];
}
