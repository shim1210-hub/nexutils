"use client";

import { useMemo, useState } from "react";

type DateToolMode = "unix" | "format" | "diff" | "timezone" | "iso" | "cron" | "uuid";

const dateToolOptions: Array<{ label: string; value: DateToolMode }> = [
  { label: "Unix Timestamp", value: "unix" },
  { label: "날짜 포맷", value: "format" },
  { label: "날짜 차이", value: "diff" },
  { label: "UTC / KST 변환", value: "timezone" },
  { label: "ISO 8601", value: "iso" },
  { label: "Cron 해석", value: "cron" },
  { label: "UUID 생성", value: "uuid" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date) {
  if (Number.isNaN(date.getTime())) return "날짜 형식이 올바르지 않습니다.";
  return [
    `Locale: ${date.toLocaleString("ko-KR")}`,
    `YYYY-MM-DD: ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `YYYY/MM/DD HH:mm:ss: ${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    `ISO: ${date.toISOString()}`,
    `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
    `Unix milliseconds: ${date.getTime()}`,
  ].join("\n");
}

function explainCron(expression: string) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return "5필드 Cron 형식으로 입력해주세요. 예: */5 * * * *";
  const [minute, hour, day, month, weekday] = parts;
  return [`분: ${minute}`, `시: ${hour}`, `일: ${day}`, `월: ${month}`, `요일: ${weekday}`].join("\n");
}

function parseUtcInput(value: string) {
  const trimmed = value.trim();
  return new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed) ? trimmed : `${trimmed.replace(" ", "T")}Z`);
}

function parseKstInput(value: string) {
  const trimmed = value.trim();
  return new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed) ? trimmed : `${trimmed.replace(" ", "T")}+09:00`);
}

export default function DateTimeToolsTool() {
  const [mode, setMode] = useState<DateToolMode>("unix");
  const [input, setInput] = useState("1735689600");
  const [secondInput, setSecondInput] = useState("2025-01-08");
  const [timezoneDirection, setTimezoneDirection] = useState("utc-to-kst");
  const [uuidCount, setUuidCount] = useState("3");
  const [status, setStatus] = useState("");
  const [uuidOutput, setUuidOutput] = useState("");

  const output = useMemo(() => {
    if (mode === "unix") {
      const timestamp = Number(input.trim());
      if (!Number.isFinite(timestamp)) return "숫자 timestamp를 입력해주세요.";
      return formatDate(new Date(input.trim().length <= 10 ? timestamp * 1000 : timestamp));
    }
    if (mode === "format" || mode === "iso") return formatDate(new Date(input));
    if (mode === "diff") {
      const startDate = new Date(input);
      const endDate = new Date(secondInput);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "두 날짜를 올바르게 입력해주세요.";
      const diffDays = Math.abs(endDate.getTime() - startDate.getTime()) / 86400000;
      return `일수 차이: ${Math.floor(diffDays)}일\n시간 차이: ${Math.floor(diffDays * 24)}시간`;
    }
    if (mode === "timezone") {
      const date = timezoneDirection === "utc-to-kst" ? parseUtcInput(input) : parseKstInput(input);
      if (Number.isNaN(date.getTime())) return "날짜 형식이 올바르지 않습니다.";
      return timezoneDirection === "utc-to-kst"
        ? `입력 기준: UTC\nKST: ${new Date(date.getTime() + 9 * 3600000).toISOString().replace("Z", "+09:00")}`
        : `입력 기준: KST (UTC+09:00)\nUTC: ${date.toISOString()}`;
    }
    if (mode === "cron") return explainCron(input);
    return uuidOutput;
  }, [input, mode, secondInput, timezoneDirection, uuidOutput]);

  function handleModeChange(nextMode: DateToolMode) {
    setMode(nextMode);
    setStatus("");
    if (nextMode === "unix") setInput(String(Math.floor(Date.now() / 1000)));
    else if (nextMode === "cron") setInput("*/5 * * * *");
    else if (nextMode === "diff") setInput(new Date().toISOString().slice(0, 10));
    else setInput(new Date().toISOString());
  }

  async function copyOutput() {
    if (!output) { setStatus("복사할 결과가 없습니다."); return; }
    try { await navigator.clipboard.writeText(output); setStatus("복사됐어요."); }
    catch { setStatus("클립보드 복사에 실패했습니다."); }
    window.setTimeout(() => setStatus(""), 1800);
  }

  function generateUuids() {
    const count = Math.min(Math.max(Math.trunc(Number(uuidCount)) || 1, 1), 50);
    setUuidOutput(Array.from({ length: count }, () => crypto.randomUUID()).join("\n"));
    setStatus(`${count}개를 생성했어요.`);
  }

  function reset() {
    setInput(""); setSecondInput(""); setUuidOutput(""); setStatus("");
  }

  return (
    <div className="tool-form form-workspace date-workspace">
      <div className="workspace-heading">
        <div>
          <h2>날짜 · 시간 도구</h2>
          <p>날짜 계산, 변환, 생성 작업을 폼 중심으로 처리합니다.</p>
        </div>
      </div>
      <div className="control-bar">
        <label><span>작업 선택</span><select onChange={(event) => handleModeChange(event.target.value as DateToolMode)} value={mode}>{dateToolOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        {mode === "timezone" ? <select aria-label="변환 기준" onChange={(event) => setTimezoneDirection(event.target.value)} title="시간대가 없는 입력은 선택한 출발 시간대로 해석합니다." value={timezoneDirection}><option value="utc-to-kst">UTC → KST</option><option value="kst-to-utc">KST → UTC</option></select> : null}
        {mode === "uuid" ? <input max="50" min="1" onChange={(event) => setUuidCount(event.target.value)} placeholder="생성 개수" type="number" value={uuidCount} /> : null}
      </div>
      <div className="form-panel">
        {mode !== "uuid" ? <label><span>{mode === "cron" ? "Cron 입력" : "날짜 / 시간 입력"}</span><textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} /></label> : null}
        {mode === "diff" ? <label><span>종료 날짜</span><textarea onChange={(event) => setSecondInput(event.target.value)} spellCheck={false} value={secondInput} /></label> : null}
      </div>
      <label className="editor-panel result-panel"><span>결과</span><textarea readOnly spellCheck={false} value={output} /></label>
      <div className="tool-actions"><button className="tertiary-button" onClick={reset} type="button">초기화</button>{mode === "uuid" ? <button onClick={generateUuids} type="button">UUID 생성</button> : null}<button className="secondary-action" onClick={copyOutput} type="button">결과 복사</button></div>
      {status ? <p className={`status-text ${status.includes("없습니다") || status.includes("실패") ? "error-text" : ""}`} role="status">{status}</p> : null}
    </div>
  );
}
