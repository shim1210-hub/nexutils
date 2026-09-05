"use client";

import Link from "next/link";
import { categoryLabels, type ToolMeta } from "@/lib/tools";

type ToolCardProps = {
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  tool: ToolMeta;
};

export default function ToolCard({ favorite = false, onToggleFavorite, tool }: ToolCardProps) {
  return (
    <article className={`tool-card accent-${tool.category}`}>
      <div className="tool-card-top">
        <Link className="tool-icon-link" href={tool.href} aria-label={`${tool.name} 이동`}>
          <span className="tool-icon">{tool.icon}</span>
        </Link>
        <button
          aria-label={favorite ? "즐겨찾기 제거" : "즐겨찾기 추가"}
          className={`favorite-button ${favorite ? "active" : ""}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite?.(tool.id);
          }}
          title={favorite ? "즐겨찾기 제거" : "즐겨찾기 추가"}
          type="button"
        >
          ★
        </button>
      </div>
      <Link className="tool-card-link" href={tool.href}>
        <p>{categoryLabels[tool.category]}</p>
        <h3>{tool.name}</h3>
        <span>{tool.description}</span>
        <em>바로가기</em>
      </Link>
    </article>
  );
}
