"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { searchTools } from "@/lib/tools";
import { useThemeMode } from "./useToolStorage";

export default function Header() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { dark, toggleTheme } = useThemeMode();
  const results = useMemo(() => searchTools(query).slice(0, 5), [query]);

  function goToFirstResult() {
    if (query.trim() && results[0]) {
      router.push(results[0].href);
      setQuery("");
    }
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span className="brand-text">
          <strong>NexUtils</strong>
          <small>Simple Tools, Better Work</small>
        </span>
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        <Link href="/">홈</Link>
        <Link href="/#tools">도구 모음</Link>
        <Link href="/#favorites">즐겨찾기</Link>
        <Link href="/#guide">이용 가이드</Link>
      </nav>
      <div className="header-actions">
        <div className="header-search">
          <input
            aria-label="도구 검색"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                goToFirstResult();
              }
            }}
            placeholder="검색"
            value={query}
          />
          <button aria-label="검색 결과로 이동" onClick={goToFirstResult} type="button">검색</button>
          {query.trim() ? (
            <div className="search-popover">
              {results.length ? (
                results.map((tool) => (
                  <Link href={tool.href} key={tool.id} onClick={() => setQuery("")}>
                    <strong>{tool.name}</strong>
                    <span>{tool.description}</span>
                  </Link>
                ))
              ) : (
                <p>일치하는 도구가 없습니다</p>
              )}
            </div>
          ) : null}
        </div>
        <button className="icon-button theme-button" onClick={toggleTheme} title="테마 전환" type="button">
          {dark ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
