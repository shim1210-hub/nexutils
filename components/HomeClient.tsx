"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categoryLabels, searchTools, tools, type ToolCategory } from "@/lib/tools";
import ToolCard from "./ToolCard";
import { useFavorites, useRecentTools } from "./useToolStorage";

const heroBadges = ["빠른 변환", "정확한 결과", "생산성 향상", "무료로 사용"];

const filterOrder: Array<ToolCategory | "all"> = ["all", "text", "data", "date", "sql", "code"];

const benefitCards = [
  {
    icon: "01",
    title: "빠른 작업",
    description: "브라우저에서 바로 사용",
  },
  {
    icon: "02",
    title: "간단한 사용법",
    description: "복잡한 설정 없이 바로 실행",
  },
  {
    icon: "03",
    title: "계속 추가되는 도구",
    description: "필요한 유틸리티를 지속적으로 확장",
  },
];

export default function HomeClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ToolCategory | "all">("all");
  const { favorites, toggleFavorite } = useFavorites();
  const recent = useRecentTools();
  const searchResults = useMemo(() => searchTools(query), [query]);
  const filteredTools = activeCategory === "all" ? searchResults : searchResults.filter((tool) => tool.category === activeCategory);
  const favoriteTools = tools.filter((tool) => favorites.includes(tool.id));
  const recentTools = recent.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean).slice(0, 4);

  function moveToTools() {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submitSearch() {
    setActiveCategory("all");
    if (query.trim() && searchResults[0]) {
      window.location.href = searchResults[0].href;
      return;
    }
    moveToTools();
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p>WEB UTILITY HUB</p>
          <h1>매일 쓰는 도구를<br />더 간단하게, 더 빠르게.</h1>
          <span>개발, 데이터, 텍스트, 날짜, SQL까지 필요한 유틸리티를 한곳에서 바로 사용하세요.</span>
          <div className="hero-search">
            <input
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch();
                }
              }}
              placeholder="원하는 도구를 검색해보세요... 예: JSON, 날짜 계산, SQL, 문자열"
              value={query}
            />
            <button onClick={submitSearch} type="button">검색</button>
            {query.trim() ? (
              <div className="hero-search-results">
                {searchResults.length ? (
                  searchResults.slice(0, 4).map((tool) => (
                    <Link href={tool.href} key={tool.id}>
                      <span className={`result-icon accent-${tool.category}`}>{tool.icon}</span>
                      <strong>{tool.name}</strong>
                      <small>{tool.description}</small>
                    </Link>
                  ))
                ) : (
                  <p>일치하는 도구가 없습니다.</p>
                )}
              </div>
            ) : null}
          </div>
          <div className="hero-badges">
            {heroBadges.map((badge) => <span key={badge}>{badge}</span>)}
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-window">
            <div className="window-dots"><i /><i /><i /></div>
            <div className="window-toolbar" />
            <div className="window-lines">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="window-output">
              <strong>Ready</strong>
              <small>Utility workspace</small>
            </div>
          </div>
          <div className="float-card float-json">JSON</div>
          <div className="float-card float-sql">SQL</div>
          <div className="float-card float-text">TEXT</div>
          <div className="float-card float-date">DATE</div>
          <div className="float-card float-code">&lt;/&gt;</div>
        </div>
      </section>

      <section className="section tool-section" id="tools">
        <div className="section-heading compact-heading">
          <div>
            <p>도구 모음</p>
            <h2>{query ? "검색 결과" : activeCategory === "all" ? "자주 쓰는 유틸 도구" : `${categoryLabels[activeCategory]} 도구`}</h2>
            <span>필요한 도구를 선택해 바로 사용하세요.</span>
          </div>
          <div className="filter-chips" aria-label="도구 카테고리 필터">
            {filterOrder.map((category) => (
              <button
                className={activeCategory === category ? "active" : ""}
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setQuery("");
                }}
                type="button"
              >
                {category === "all" ? "전체" : categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>
        <div className="tool-grid">
          {filteredTools.map((tool) => (
            <ToolCard favorite={favorites.includes(tool.id)} key={tool.id} onToggleFavorite={toggleFavorite} tool={tool} />
          ))}
        </div>
      </section>

      <section className="section compact-section">
        <div className="mini-panel">
          <div className="section-heading">
            <p>최근</p>
            <h2>최근 사용</h2>
          </div>
          <div className="tool-row-list">
            {recentTools.length ? recentTools.map((tool) => (
              <Link href={tool!.href} key={tool!.id}>
                <span className={`row-icon accent-${tool!.category}`}>{tool!.icon}</span>
                <strong>{tool!.name}</strong>
                <small>바로 열기</small>
              </Link>
            )) : <span>아직 사용한 도구가 없습니다.</span>}
          </div>
        </div>
        <div className="mini-panel" id="favorites">
          <div className="section-heading">
            <p>저장</p>
            <h2>즐겨찾기</h2>
          </div>
          <div className="tool-row-list">
            {favoriteTools.length ? favoriteTools.slice(0, 4).map((tool) => (
              <Link href={tool.href} key={tool.id}>
                <span className={`row-icon accent-${tool.category}`}>{tool.icon}</span>
                <strong>{tool.name}</strong>
                <small>바로 열기</small>
              </Link>
            )) : <span>즐겨찾기한 도구가 없습니다.</span>}
          </div>
        </div>
      </section>

      <section className="section benefit-grid" id="guide">
        {benefitCards.map((card) => (
          <article className="benefit-card" key={card.title}>
            <span>{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
