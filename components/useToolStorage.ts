"use client";

import { useEffect, useState } from "react";

const favoritesKey = "nexutils:favorites";
const recentKey = "nexutils:recent";
const themeKey = "nexutils:theme";

function readList(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => setFavorites(readList(favoritesKey)), []);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
      writeList(favoritesKey, next);
      return next;
    });
  }

  return { favorites, toggleFavorite };
}

export function useRecentTools(activeToolId?: string) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const current = readList(recentKey);
    if (!activeToolId) {
      setRecent(current);
      return;
    }

    const next = [activeToolId, ...current.filter((id) => id !== activeToolId)].slice(0, 6);
    writeList(recentKey, next);
    setRecent(next);
  }, [activeToolId]);

  return recent;
}

export function useThemeMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(themeKey);
    const nextDark = stored === "dark";
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  function toggleTheme() {
    setDark((current) => {
      const next = !current;
      window.localStorage.setItem(themeKey, next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  return { dark, toggleTheme };
}
