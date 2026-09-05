"use client";

import Link from "next/link";
import { findTool } from "@/lib/tools";
import { useFavorites, useRecentTools } from "./useToolStorage";

type ToolPageShellProps = {
  children: React.ReactNode;
  toolId: string;
};

export default function ToolPageShell({ children, toolId }: ToolPageShellProps) {
  const tool = findTool(toolId);
  const { favorites, toggleFavorite } = useFavorites();
  useRecentTools(toolId);

  if (!tool) {
    return null;
  }

  return (
    <main className="tool-page">
      <div className="tool-title-row">
        <div className="tool-title-main">
          <Link className="back-link" href="/">
            ← 도구 모음
          </Link>
          <div className={`tool-title-content accent-${tool.category}`}>
            <span className="tool-icon">{tool.icon}</span>
            <div>
              <h1>{tool.name}</h1>
              <p>{tool.description}</p>
            </div>
          </div>
        </div>
        <button
          className={`secondary-button ${favorites.includes(tool.id) ? "active" : ""}`}
          onClick={() => toggleFavorite(tool.id)}
          type="button"
        >
          ★ {favorites.includes(tool.id) ? "즐겨찾기됨" : "즐겨찾기"}
        </button>
      </div>
      <section className="tool-workspace">{children}</section>
    </main>
  );
}
