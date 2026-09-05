"use client";

import { useMemo, useState } from "react";

type ToolMode = "case" | "trim" | "dedupe" | "removeBlank" | "sort" | "count" | "compare" | "regex" | "replace" | "naming" | "encoding";

const toolOptions: Array<{ label: string; value: ToolMode }> = [
  { label: "대소문자 변환", value: "case" },
  { label: "공백 제거", value: "trim" },
  { label: "중복 줄 제거", value: "dedupe" },
  { label: "빈 줄 제거", value: "removeBlank" },
  { label: "문자열 정렬", value: "sort" },
  { label: "텍스트 카운트", value: "count" },
  { label: "문자열 비교", value: "compare" },
  { label: "정규식 매칭", value: "regex" },
  { label: "찾기/바꾸기", value: "replace" },
  { label: "네이밍 변환", value: "naming" },
  { label: "인코딩/디코딩", value: "encoding" },
];

function toWords(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^\p{L}\p{N}]+/u).map((word) => word.trim()).filter(Boolean);
}

function textToBase64(value: string) {
  return btoa(String.fromCodePoint(...new TextEncoder().encode(value)));
}

function base64ToText(value: string) {
  const binary = atob(value.trim());
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.codePointAt(0) ?? 0));
}

function textToUtf8Hex(value: string) {
  return Array.from(new TextEncoder().encode(value)).map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

function utf8HexToText(value: string) {
  const bytes = value.trim().split(/[\s,]+/).filter(Boolean).map((item) => Number.parseInt(item.replace(/^0x/i, ""), 16));
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

export default function StringToolsTool() {
  const [mode, setMode] = useState<ToolMode>("case");
  const [input, setInput] = useState("NexUtils\nutility tools\nUtility Tools");
  const [compareInput, setCompareInput] = useState("NexUtils\nutility tools");
  const [findValue, setFindValue] = useState("Utility");
  const [replaceValue, setReplaceValue] = useState("String");
  const [regexValue, setRegexValue] = useState("[A-Z][a-z]+");
  const [caseMode, setCaseMode] = useState("upper");
  const [sortMode, setSortMode] = useState("asc");
  const [namingMode, setNamingMode] = useState("camel");
  const [encodingType, setEncodingType] = useState("base64");
  const [encodingDirection, setEncodingDirection] = useState("encode");
  const [status, setStatus] = useState("");

  const output = useMemo(() => {
    const lines = input.split(/\r?\n/);
    try {
      if (mode === "case") return caseMode === "upper" ? input.toUpperCase() : input.toLowerCase();
      if (mode === "trim") return lines.map((line) => line.trim()).join("\n");
      if (mode === "dedupe") return Array.from(new Set(lines)).join("\n");
      if (mode === "removeBlank") return lines.filter((line) => line.trim()).join("\n");
      if (mode === "sort") return [...lines].sort((a, b) => (sortMode === "asc" ? a.localeCompare(b) : b.localeCompare(a))).join("\n");
      if (mode === "count") {
        const words = input.trim() ? input.trim().split(/\s+/).length : 0;
        return [`문자 수: ${input.length}`, `공백 제외 문자 수: ${input.replace(/\s/g, "").length}`, `단어 수: ${words}`, `줄 수: ${lines.length}`].join("\n");
      }
      if (mode === "compare") return input === compareInput ? "두 문자열이 같습니다." : "두 문자열이 다릅니다.";
      if (mode === "regex") return (input.match(new RegExp(regexValue, "gm")) ?? ["매칭 결과가 없습니다."]).join("\n");
      if (mode === "replace") return input.replaceAll(findValue, replaceValue);
      if (mode === "encoding") {
        if (encodingType === "url") return encodingDirection === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
        if (encodingType === "utf8") return encodingDirection === "encode" ? textToUtf8Hex(input) : utf8HexToText(input);
        return encodingDirection === "encode" ? textToBase64(input) : base64ToText(input);
      }
      const words = toWords(input);
      if (namingMode === "snake") return words.map((word) => word.toLowerCase()).join("_");
      if (namingMode === "kebab") return words.map((word) => word.toLowerCase()).join("-");
      return words.map((word, index) => {
        const lower = word.toLowerCase();
        return index === 0 ? lower : `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
      }).join("");
    } catch {
      return "입력값을 확인해주세요.";
    }
  }, [caseMode, compareInput, encodingDirection, encodingType, findValue, input, mode, namingMode, regexValue, replaceValue, sortMode]);

  async function copyOutput() {
    await navigator.clipboard.writeText(output).catch(() => undefined);
    setStatus("복사됐어요.");
    window.setTimeout(() => setStatus(""), 1800);
  }

  return (
    <div className="tool-form split-workspace string-workspace">
      <div className="workspace-heading">
        <div>
          <h2>문자열 도구</h2>
          <p>대소문자, 공백, 중복, 정렬, 비교, 정규식, 인코딩을 빠르게 처리합니다.</p>
        </div>
      </div>
      <div className="control-bar">
        <label><span>작업 선택</span><select onChange={(event) => setMode(event.target.value as ToolMode)} value={mode}>{toolOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        {mode === "case" ? <select onChange={(event) => setCaseMode(event.target.value)} value={caseMode}><option value="upper">대문자</option><option value="lower">소문자</option></select> : null}
        {mode === "sort" ? <select onChange={(event) => setSortMode(event.target.value)} value={sortMode}><option value="asc">오름차순</option><option value="desc">내림차순</option></select> : null}
        {mode === "naming" ? <select onChange={(event) => setNamingMode(event.target.value)} value={namingMode}><option value="camel">Camel Case</option><option value="snake">Snake Case</option><option value="kebab">Kebab Case</option></select> : null}
        {mode === "regex" ? <input onChange={(event) => setRegexValue(event.target.value)} placeholder="정규식" value={regexValue} /> : null}
        {mode === "replace" ? <><input onChange={(event) => setFindValue(event.target.value)} placeholder="찾을 값" value={findValue} /><input onChange={(event) => setReplaceValue(event.target.value)} placeholder="바꿀 값" value={replaceValue} /></> : null}
        {mode === "encoding" ? <><select onChange={(event) => setEncodingType(event.target.value)} value={encodingType}><option value="base64">Base64</option><option value="utf8">UTF-8 Hex</option><option value="url">URL</option></select><select onChange={(event) => setEncodingDirection(event.target.value)} value={encodingDirection}><option value="encode">인코딩</option><option value="decode">디코딩</option></select></> : null}
      </div>
      <label className="editor-panel"><span>입력</span><textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} /></label>
      {mode === "compare" ? <label className="editor-panel"><span>비교 대상</span><textarea onChange={(event) => setCompareInput(event.target.value)} spellCheck={false} value={compareInput} /></label> : <label className="editor-panel result-panel"><span>결과</span><textarea readOnly spellCheck={false} value={output} /></label>}
      {mode === "compare" ? <label className="editor-panel result-panel full-span"><span>결과</span><textarea readOnly spellCheck={false} value={output} /></label> : null}
      <div className="tool-actions"><button className="secondary-action" onClick={copyOutput} type="button">결과 복사</button></div>
      {status ? <p className="status-text">{status}</p> : null}
    </div>
  );
}
