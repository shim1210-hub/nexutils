"use client";

import { useMemo, useState } from "react";

type SqlToolMode = "formatter" | "minifier" | "insert" | "create" | "csvInsert" | "jsonInsert" | "tableDoc" | "dialect" | "columnCase" | "sample" | "erd";

const sqlToolOptions: Array<{ label: string; value: SqlToolMode }> = [
  { label: "SQL 포맷", value: "formatter" },
  { label: "SQL 압축", value: "minifier" },
  { label: "INSERT 생성", value: "insert" },
  { label: "CREATE TABLE 생성", value: "create" },
  { label: "CSV → INSERT", value: "csvInsert" },
  { label: "JSON → INSERT", value: "jsonInsert" },
  { label: "테이블 정의 → DDL", value: "tableDoc" },
  { label: "Oracle / PostgreSQL 변환", value: "dialect" },
  { label: "컬럼명 Case 변환", value: "columnCase" },
  { label: "샘플 데이터 생성", value: "sample" },
  { label: "ERD 컬럼 정리", value: "erd" },
];

const sampleSql = "select user_id,user_name,email from users where status='ACTIVE' order by created_at desc";
const sampleCsv = "user_id,user_name,email\nUSER001,Hong,hong@test.com\nUSER002,Kim,util@test.com";
const sampleJson = '[{"user_id":"USER001","user_name":"Hong","email":"hong@test.com"}]';
const sampleColumns = "user_id,varchar(30),not null,User ID\nuser_name,varchar(100),not null,User name\ncreated_at,timestamp,not null,Created at";

function escapeSql(value: string) { return value.replaceAll("'", "''"); }
function toSnake(value: string) { return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase(); }
function toCamel(value: string) { return value.toLowerCase().split(/[_\s-]+/).map((word, index) => (index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`)).join(""); }
function formatSql(sql: string) { return sql.replace(/\s+/g, " ").replace(/\b(select|from|where|group by|order by|having|inner join|left join|right join|join|values|set)\b/gi, "\n$1").replace(/,/g, ",\n  ").trim(); }
function csvToRows(input: string) {
  const parsed: string[][] = [[]];
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"' && quoted && input[index + 1] === '"') {
      const row = parsed.at(-1)!;
      row[row.length - 1] = (row[row.length - 1] ?? "") + '"';
      index += 1;
      continue;
    }
    if (character === '"') { quoted = !quoted; continue; }
    if (character === "," && !quoted) { parsed.at(-1)!.push(""); continue; }
    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      parsed.push([]);
      continue;
    }
    const row = parsed.at(-1)!;
    row[row.length - 1] = (row[row.length - 1] ?? "") + character;
  }
  const rows = parsed.filter((row) => row.some((cell) => cell.trim()));
  const headers = (rows[0] ?? []).map((header) => header.trim());
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]?.trim() ?? ""])));
}
function rowsToInsert(tableName: string, rows: Array<Record<string, unknown>>) {
  if (!tableName.trim()) return "테이블명을 입력해주세요.";
  if (!rows.length) return "";
  const columns = Object.keys(rows[0]);
  return rows.map((row) => `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${columns.map((column) => `'${escapeSql(String(row[column] ?? ""))}'`).join(", ")});`).join("\n");
}
function columnsToCreateTable(tableName: string, input: string) {
  if (!tableName.trim()) return "테이블명을 입력해주세요.";
  const columns = input.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
    const [name = "", type = "varchar(255)", nullable = "", comment = ""] = line.split(",").map((value) => value.trim());
    return `  ${name} ${type}${nullable.toLowerCase().includes("not") ? " NOT NULL" : ""}${comment ? ` /* ${comment.replaceAll("*/", "* /")} */` : ""}`;
  });
  if (!columns.length) return "컬럼 정의를 입력해주세요.";
  return `CREATE TABLE ${tableName} (\n${columns.join(",\n")}\n);`;
}
function convertDialect(input: string, direction: string) {
  return direction === "oracle-to-postgres"
    ? input.replace(/\bNVL\s*\(/gi, "COALESCE(").replace(/\bSYSDATE\b/gi, "CURRENT_TIMESTAMP").replace(/\bVARCHAR2\b/gi, "VARCHAR").replace(/\bNUMBER\b/gi, "NUMERIC").replace(/\bSYSTIMESTAMP\b/gi, "CURRENT_TIMESTAMP")
    : input.replace(/\bCOALESCE\s*\(/gi, "NVL(").replace(/\bCURRENT_TIMESTAMP\b/gi, "SYSTIMESTAMP").replace(/\bVARCHAR\b/gi, "VARCHAR2").replace(/\bNUMERIC\b/gi, "NUMBER");
}

export default function SqlDbToolsTool() {
  const [mode, setMode] = useState<SqlToolMode>("formatter");
  const [input, setInput] = useState(sampleSql);
  const [tableName, setTableName] = useState("users");
  const [dialectDirection, setDialectDirection] = useState("oracle-to-postgres");
  const [caseDirection, setCaseDirection] = useState("camel-to-snake");
  const [status, setStatus] = useState("");

  const output = useMemo(() => {
    if (mode === "formatter") return formatSql(input);
    if (mode === "minifier") return input.replace(/\s+/g, " ").trim();
    if (mode === "insert" || mode === "csvInsert") return rowsToInsert(tableName, csvToRows(input));
    if (mode === "create" || mode === "tableDoc") return columnsToCreateTable(tableName, input);
    if (mode === "jsonInsert") {
      try {
        const parsed = JSON.parse(input) as Array<Record<string, unknown>> | Record<string, unknown>;
        return rowsToInsert(tableName, Array.isArray(parsed) ? parsed : [parsed]);
      } catch {
        return "JSON 형식이 올바르지 않습니다.";
      }
    }
    if (mode === "dialect") return convertDialect(input, dialectDirection);
    if (mode === "columnCase") return input.split(/\r?\n/).map((line) => (caseDirection === "camel-to-snake" ? toSnake(line) : toCamel(line))).join("\n");
    if (mode === "sample") return rowsToInsert(tableName, input.split(/\r?\n/).map((line) => line.split(",")[0]?.trim()).filter(Boolean).map((column, index) => ({ [column]: `${column}_${String(index + 1).padStart(2, "0")}` })));
    return input.split(/\r?\n/).filter((line) => line.trim()).map((line) => {
      const [name = "", type = "", nullable = "", comment = ""] = line.split(",").map((value) => value.trim());
      return `${name} | ${type} | ${nullable || "-"} | ${comment || "-"}`;
    }).join("\n");
  }, [caseDirection, dialectDirection, input, mode, tableName]);

  function handleModeChange(nextMode: SqlToolMode) {
    setMode(nextMode);
    if (nextMode === "formatter" || nextMode === "minifier" || nextMode === "dialect") setInput(sampleSql);
    else if (nextMode === "jsonInsert") setInput(sampleJson);
    else if (nextMode === "insert" || nextMode === "csvInsert") setInput(sampleCsv);
    else setInput(sampleColumns);
  }

  async function copyOutput() {
    if (!output) { setStatus("복사할 결과가 없습니다."); return; }
    try { await navigator.clipboard.writeText(output); setStatus("복사됐어요."); }
    catch { setStatus("클립보드 복사에 실패했습니다."); }
    window.setTimeout(() => setStatus(""), 1800);
  }

  function reset() { setInput(""); setTableName(""); setStatus(""); }

  return (
    <div className="tool-form split-workspace sql-workspace">
      <div className="workspace-heading"><div><h2>SQL · DB 도구</h2><p>SQL을 빠르게 정리하고 필요한 형태로 변환합니다.</p></div></div>
      <div className="control-bar">
        <label><span>작업 선택</span><select onChange={(event) => handleModeChange(event.target.value as SqlToolMode)} value={mode}>{sqlToolOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <input onChange={(event) => setTableName(event.target.value)} placeholder="테이블명" value={tableName} />
        {mode === "dialect" ? <select onChange={(event) => setDialectDirection(event.target.value)} value={dialectDirection}><option value="oracle-to-postgres">Oracle → PostgreSQL</option><option value="postgres-to-oracle">PostgreSQL → Oracle</option></select> : null}
        {mode === "columnCase" ? <select onChange={(event) => setCaseDirection(event.target.value)} value={caseDirection}><option value="camel-to-snake">Camel → Snake</option><option value="snake-to-camel">Snake → Camel</option></select> : null}
      </div>
      <label className="editor-panel"><span>SQL Editor</span><textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} /></label>
      <label className="editor-panel result-panel"><span>결과</span><textarea readOnly spellCheck={false} value={output} /></label>
      <div className="tool-actions"><button className="tertiary-button" onClick={reset} type="button">초기화</button><button className="secondary-action" onClick={copyOutput} type="button">결과 복사</button></div>
      {status ? <p className={`status-text ${status.includes("없습니다") || status.includes("실패") ? "error-text" : ""}`} role="status">{status}</p> : null}
    </div>
  );
}
