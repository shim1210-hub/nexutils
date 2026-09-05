export type ToolCategory = "text" | "data" | "date" | "sql" | "code";

export type ToolMeta = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  href: string;
  keywords: string[];
  icon: string;
};

export const categoryLabels: Record<ToolCategory, string> = {
  text: "텍스트 · 변환",
  data: "데이터 · 포맷",
  date: "날짜 · 시간",
  sql: "SQL & DB",
  code: "개발 도구",
};

export const tools: ToolMeta[] = [
  {
    id: "horizontal-view",
    name: "Horizontal View",
    description: "세로 목록을 따옴표가 포함된 가로 값으로 빠르게 변환합니다.",
    category: "text",
    href: "/horizontal-view",
    keywords: ["horizontal", "vertical", "list", "quote", "sql in", "text"],
    icon: "H",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "JSON을 보기 좋게 정렬하고 유효성을 확인한 뒤 복사합니다.",
    category: "data",
    href: "/json-formatter",
    keywords: ["json", "format", "pretty", "validate", "data"],
    icon: "{}",
  },
  {
    id: "string-tools",
    name: "문자열 도구",
    description: "대소문자, 공백, 중복, 정렬, 비교, 정규식, 인코딩을 처리합니다.",
    category: "text",
    href: "/string-tools",
    keywords: ["string", "text", "case", "trim", "dedupe", "regex", "replace", "base64", "url"],
    icon: "T",
  },
  {
    id: "date-time-tools",
    name: "날짜 · 시간 도구",
    description: "타임스탬프, 날짜 포맷, 기간 차이, Cron, UUID를 다룹니다.",
    category: "date",
    href: "/date-time-tools",
    keywords: ["date", "time", "unix", "timestamp", "timezone", "cron", "uuid"],
    icon: "D",
  },
  {
    id: "sql-db-tools",
    name: "SQL · DB 도구",
    description: "SQL 포맷, INSERT/DDL 생성, 문법 변환, 컬럼 정리를 돕습니다.",
    category: "sql",
    href: "/sql-db-tools",
    keywords: ["sql", "db", "insert", "create table", "csv", "ddl", "oracle", "postgres"],
    icon: "DB",
  },
  {
    id: "code-tools",
    name: "개발 코드 도구",
    description: "코드 포맷, YAML/JSON 변환, 마크다운, Diff, 요청 테스트를 제공합니다.",
    category: "code",
    href: "/code-tools",
    keywords: ["code", "javascript", "html", "css", "xml", "yaml", "markdown", "diff", "qr", "http"],
    icon: "</>",
  },
];

export function findTool(id: string) {
  return tools.find((tool) => tool.id === id);
}

export function searchTools(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return tools;
  }

  return tools.filter((tool) =>
    [tool.name, tool.description, categoryLabels[tool.category], ...tool.keywords]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
