import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "agent-flow-theme";

function getInitialTheme(): Theme {
	if (typeof window === "undefined") return "dark";
	const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
	if (stored === "light" || stored === "dark") return stored;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

	return { theme, toggleTheme } as const;
}
