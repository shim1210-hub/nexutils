"use client";

import { useMemo, useState } from "react";

type CodeToolMode = "jsFormatter" | "htmlFormatter" | "cssFormatter" | "xmlFormatter" | "yamlJson" | "markdown" | "regexBuilder" | "diff" | "escape" | "color" | "httpRequest";

const codeToolOptions: Array<{ label: string; value: CodeToolMode }> = [
  { label: "JavaScript 포맷", value: "jsFormatter" },
  { label: "HTML 포맷", value: "htmlFormatter" },
  { label: "CSS 포맷", value: "cssFormatter" },
  { label: "XML 포맷", value: "xmlFormatter" },
  { label: "YAML / JSON 변환", value: "yamlJson" },
  { label: "Markdown 미리보기", value: "markdown" },
  { label: "정규식 테스트", value: "regexBuilder" },
  { label: "Diff 비교", value: "diff" },
  { label: "Escape / Unescape", value: "escape" },
  { label: "색상 코드 변환", value: "color" },
  { label: "HTTP 요청 코드 생성", value: "httpRequest" },
];

const sampleCode = "function hello(){const name='NexUtils';console.log(name);}";
const sampleMarkdown = "# Title\n\n- item one\n- item two\n\n**bold text**";

function simpleFormat(value: string) {
  let depth = 0;
  return value.replace(/([{};])/g, "$1\n").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    if (line.startsWith("}")) depth = Math.max(0, depth - 1);
    const formatted = `${"  ".repeat(depth)}${line}`;
    if (line.endsWith("{") || (line.includes("{") && !line.includes("}"))) depth += 1;
    return formatted;
  }).join("\n");
}
function formatMarkup(value: string) {
  let depth = 0;
  return value.replace(/>\s*</g, ">\n<").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    if (/^<\//.test(line)) depth = Math.max(0, depth - 1);
    const formatted = `${"  ".repeat(depth)}${line}`;
    if (/^<[^/!?][^>]*[^/]?>$/.test(line) && !/<\/[^>]+>$/.test(line)) depth += 1;
    return formatted;
  }).join("\n");
}
function yamlToJson(value: string) {
  const result: Record<string, string> = {};
  value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const [key = "", ...rest] = line.split(":");
    result[key.trim()] = rest.join(":").trim();
  });
  return JSON.stringify(result, null, 2);
}
function jsonToYaml(value: string) { return Object.entries(JSON.parse(value) as Record<string, unknown>).map(([key, item]) => `${key}: ${String(item)}`).join("\n"); }
function markdownToPreview(value: string) { return value.replace(/^# (.*)$/gm, "H1: $1").replace(/^## (.*)$/gm, "H2: $1").replace(/^- (.*)$/gm, "- $1").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)"); }
function diffLines(left: string, right: string) {
  const leftLines = left.split(/\r?\n/);
  const rightLines = right.split(/\r?\n/);
  const lines: string[] = [];
  for (let index = 0; index < Math.max(leftLines.length, rightLines.length); index += 1) {
    if (leftLines[index] === rightLines[index]) lines.push(`  ${leftLines[index] ?? ""}`);
    else {
      if (leftLines[index] !== undefined) lines.push(`- ${leftLines[index]}`);
      if (rightLines[index] !== undefined) lines.push(`+ ${rightLines[index]}`);
    }
  }
  return lines.join("\n");
}
function convertColor(value: string) {
  const hex = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return "HEX 색상값을 입력해주세요. 예: #4dd7c8";
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));
  const hue = max === min ? 0 : max === r / 255 ? 60 * (((g - b) / 255 / (max - min) + 6) % 6) : max === g / 255 ? 60 * ((b - r) / 255 / (max - min) + 2) : 60 * ((r - g) / 255 / (max - min) + 4);
  return [`HEX: #${hex.toUpperCase()}`, `RGB: rgb(${r}, ${g}, ${b})`, `HSL: hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`].join("\n");
}

export default function CodeToolsTool() {
  const [mode, setMode] = useState<CodeToolMode>("jsFormatter");
  const [input, setInput] = useState(sampleCode);
  const [secondInput, setSecondInput] = useState("function hello() {\n  console.log('NexUtils');\n}");
  const [escapeMode, setEscapeMode] = useState("escape");
  const [yamlDirection, setYamlDirection] = useState("json-to-yaml");
  const [regexPattern, setRegexPattern] = useState("[A-Z][a-z]+");
  const [requestMethod, setRequestMethod] = useState("GET");
  const [requestUrl, setRequestUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [requestBody, setRequestBody] = useState('{"title":"NexUtils","body":"utility","userId":1}');
  const [status, setStatus] = useState("");

  const output = useMemo(() => {
    try {
      if (mode === "httpRequest") {
        if (!requestUrl.trim()) return "Request URL을 입력해주세요.";
        const body = requestMethod === "POST" ? `,\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${requestBody || "{}"})` : "";
        return `fetch(${JSON.stringify(requestUrl.trim())}, {\n  method: ${JSON.stringify(requestMethod)}${body}\n});`;
      }
      if (["jsFormatter", "cssFormatter"].includes(mode)) return simpleFormat(input);
      if (["htmlFormatter", "xmlFormatter"].includes(mode)) return formatMarkup(input);
      if (mode === "yamlJson") return yamlDirection === "json-to-yaml" ? jsonToYaml(input) : yamlToJson(input);
      if (mode === "markdown") return markdownToPreview(input);
      if (mode === "regexBuilder") return (input.match(new RegExp(regexPattern, "gm")) ?? ["매칭 결과가 없습니다."]).join("\n");
      if (mode === "diff") return diffLines(input, secondInput);
      if (mode === "escape") return escapeMode === "escape" ? encodeURIComponent(input) : decodeURIComponent(input);
      return convertColor(input);
    } catch {
      return "입력값을 확인해주세요.";
    }
  }, [escapeMode, input, mode, regexPattern, requestBody, requestMethod, requestUrl, secondInput, yamlDirection]);

  function handleModeChange(nextMode: CodeToolMode) {
    setMode(nextMode);
    if (nextMode === "markdown") setInput(sampleMarkdown);
    else if (nextMode === "yamlJson") setInput('{"name":"NexUtils","type":"utility"}');
    else if (nextMode === "color") setInput("#4dd7c8");
    else if (nextMode === "httpRequest") setInput("");
    else setInput(sampleCode);
  }

  async function copyOutput() {
    if (!output) { setStatus("복사할 결과가 없습니다."); return; }
    try { await navigator.clipboard.writeText(output); setStatus("복사됐어요."); }
    catch { setStatus("클립보드 복사에 실패했습니다."); }
    window.setTimeout(() => setStatus(""), 1800);
  }

  function reset() { setInput(""); setSecondInput(""); setRequestUrl(""); setRequestBody(""); setStatus(""); }

  return (
    <div className="tool-form split-workspace code-workspace">
      <div className="workspace-heading"><div><h2>개발 코드 도구</h2><p>코드 포맷, 변환, 비교와 HTTP 요청 코드 생성을 브라우저 안에서 처리합니다.</p></div></div>
      <div className="control-bar">
        <label><span>작업 선택</span><select onChange={(event) => handleModeChange(event.target.value as CodeToolMode)} value={mode}>{codeToolOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        {mode === "yamlJson" ? <select onChange={(event) => setYamlDirection(event.target.value)} value={yamlDirection}><option value="json-to-yaml">JSON → YAML</option><option value="yaml-to-json">YAML → JSON</option></select> : null}
        {mode === "regexBuilder" ? <input onChange={(event) => setRegexPattern(event.target.value)} placeholder="정규식" value={regexPattern} /> : null}
        {mode === "escape" ? <select onChange={(event) => setEscapeMode(event.target.value)} value={escapeMode}><option value="escape">Escape</option><option value="unescape">Unescape</option></select> : null}
        {mode === "httpRequest" ? <><select onChange={(event) => setRequestMethod(event.target.value)} value={requestMethod}><option value="GET">GET</option><option value="POST">POST</option></select><input onChange={(event) => setRequestUrl(event.target.value)} placeholder="Request URL" value={requestUrl} /></> : null}
      </div>
      {mode === "httpRequest" ? <label className="editor-panel"><span>Request Body</span><textarea disabled={requestMethod === "GET"} onChange={(event) => setRequestBody(event.target.value)} spellCheck={false} value={requestMethod === "GET" ? "" : requestBody} /></label> : <label className="editor-panel"><span>입력</span><textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} /></label>}
      {mode === "diff" ? <label className="editor-panel"><span>비교 대상</span><textarea onChange={(event) => setSecondInput(event.target.value)} spellCheck={false} value={secondInput} /></label> : null}
      <label className={`editor-panel result-panel ${mode === "diff" ? "full-span" : ""}`}><span>결과</span><textarea readOnly spellCheck={false} value={output} /></label>
      <div className="tool-actions"><button className="tertiary-button" onClick={reset} type="button">초기화</button><button className="secondary-action" onClick={copyOutput} type="button">결과 복사</button></div>
      {status ? <p className={`status-text ${status.includes("없습니다") || status.includes("실패") ? "error-text" : ""}`} role="status">{status}</p> : null}
    </div>
  );
}
