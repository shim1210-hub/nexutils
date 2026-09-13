"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";

const favoritesKey = "nexutils:favorites";
const recentKey = "nexutils:recent";
const themeKey = "nexutils:theme";
const localChangeEvent = "nexutils:storage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(localChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(localChangeEvent, callback);
  };
}

function readRaw(key: string, fallback: string) {
  return () => window.localStorage.getItem(key) ?? fallback;
}

function writeRaw(key: string, value: string) {
  window.localStorage.setItem(key, value);
  window.dispatchEvent(new Event(localChangeEvent));
}

function parseList(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function useStoredList(key: string) {
  const raw = useSyncExternalStore(subscribe, readRaw(key, "[]"), () => "[]");
  return useMemo(() => parseList(raw), [raw]);
}

export function useFavorites() {
  const favorites = useStoredList(favoritesKey);

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
    writeRaw(favoritesKey, JSON.stringify(next));
  }

  return { favorites, toggleFavorite };
}

export function useRecentTools(activeToolId?: string) {
  const recent = useStoredList(recentKey);

  useEffect(() => {
    if (!activeToolId) return;
    const current = parseList(window.localStorage.getItem(recentKey) ?? "[]");
    const next = [activeToolId, ...current.filter((id) => id !== activeToolId)].slice(0, 6);
    if (JSON.stringify(next) !== JSON.stringify(current)) writeRaw(recentKey, JSON.stringify(next));
  }, [activeToolId]);

  return recent;
}

export function useThemeMode() {
  const stored = useSyncExternalStore(subscribe, readRaw(themeKey, "light"), () => "light");
  const dark = stored === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggleTheme() {
    writeRaw(themeKey, dark ? "light" : "dark");
  }

  return { dark, toggleTheme };
}
