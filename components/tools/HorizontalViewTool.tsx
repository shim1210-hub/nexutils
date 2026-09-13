"use client";

import { useMemo, useState } from "react";

function buildHorizontalValue(input: string) {
  return input
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => `'${value.replaceAll("'", "\\'")}'`)
    .join(", ");
}

export default function HorizontalViewTool() {
  const [input, setInput] = useState("alpha\nbeta\ngamma");
  const [output, setOutput] = useState("('alpha', 'beta', 'gamma')");
  const [status, setStatus] = useState("");
  const inputCount = useMemo(() => input.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).length, [input]);

  function convertToHorizontal() {
    const convertedValue = buildHorizontalValue(input);
    setOutput(convertedValue ? `(${convertedValue})` : "");
    setStatus(convertedValue ? "변환이 완료됐어요." : "변환할 내용을 입력해주세요.");
  }

  async function copyOutput() {
    if (!output) {
      setStatus("복사할 결과가 없습니다.");
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setStatus("복사됐어요.");
    } catch {
      setStatus("클립보드 복사에 실패했습니다.");
    }
    window.setTimeout(() => setStatus(""), 1800);
  }

  function reset() {
    setInput("");
    setOutput("");
    setStatus("");
  }

  return (
    <div className="tool-form split-workspace horizontal-workspace">
      <div className="workspace-heading">
        <div>
          <h2>Horizontal View</h2>
          <p>세로 목록을 가로 값 목록으로 빠르게 변환합니다.</p>
        </div>
        <span>{inputCount}개 항목</span>
      </div>
      <label className="editor-panel">
        <span>입력</span>
        <textarea onChange={(event) => setInput(event.target.value)} placeholder={"alpha\nbeta\ngamma"} spellCheck={false} value={input} />
      </label>
      <label className="editor-panel result-panel">
        <span>결과</span>
        <textarea aria-label="가로 변환 결과" placeholder="변환 결과가 여기에 표시됩니다." readOnly spellCheck={false} value={output} wrap="off" />
      </label>
      <div className="tool-actions">
        <button className="tertiary-button" onClick={reset} type="button">초기화</button>
        <button onClick={convertToHorizontal} type="button">변환</button>
        <button className="secondary-action" onClick={copyOutput} type="button">결과 복사</button>
      </div>
      {status ? <p className={`status-text ${status.includes("입력") || status.includes("실패") || status.includes("없습니다") ? "error-text" : ""}`} role="status">{status}</p> : null}
    </div>
  );
}
