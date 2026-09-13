"use client";

import { useState } from "react";

const sampleJson = '{"requesterKey":"USER001","service":"NexUtils","enabled":true}';
type Feedback = { kind: "idle" | "success" | "error"; message: string };

function describeJsonError(error: unknown, source: string) {
  const fallback = error instanceof Error ? error.message : "JSON 형식이 올바르지 않습니다.";
  const positionMatch = fallback.match(/position\s+(\d+)/i);
  if (!positionMatch) return fallback;
  const position = Number(positionMatch[1]);
  const before = source.slice(0, position);
  const line = before.split("\n").length;
  const column = position - before.lastIndexOf("\n");
  return `${fallback} (줄 ${line}, 열 ${column})`;
}

export default function JsonFormatterTool() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState(JSON.stringify(JSON.parse(sampleJson), null, 2));
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle", message: "JSON 입력 대기" });

  function transformJson(minify: boolean) {
    if (!input.trim()) {
      setOutput("");
      setFeedback({ kind: "error", message: "JSON을 입력해주세요." });
      return;
    }
    try {
      const parsed: unknown = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minify ? undefined : 2));
      setFeedback({ kind: "success", message: minify ? "압축이 완료됐어요." : "유효한 JSON입니다. 포맷이 완료됐어요." });
    } catch (error) {
      setOutput("");
      setFeedback({ kind: "error", message: describeJsonError(error, input) });
    }
  }

  async function copyOutput() {
    if (!output) {
      setFeedback({ kind: "error", message: "복사할 결과가 없습니다." });
      return;
    }
    try {
      await navigator.clipboard.writeText(output);
      setFeedback({ kind: "success", message: "결과를 복사했어요." });
    } catch {
      setFeedback({ kind: "error", message: "클립보드 복사에 실패했습니다." });
    }
  }

  function reset() {
    setInput("");
    setOutput("");
    setFeedback({ kind: "idle", message: "JSON 입력 대기" });
  }

  return (
    <div className="tool-form split-workspace json-workspace">
      <div className="workspace-heading">
        <div><h2>JSON Formatter</h2><p>JSON 유효성을 검사하고 보기 좋은 형식 또는 한 줄 형식으로 변환합니다.</p></div>
        <span className={feedback.kind === "error" ? "status-error" : feedback.kind === "success" ? "status-success" : ""}>{feedback.message}</span>
      </div>
      <label className="editor-panel">
        <span>입력 JSON</span>
        <textarea onChange={(event) => { setInput(event.target.value); setFeedback({ kind: "idle", message: "변경사항 확인 대기" }); }} placeholder={sampleJson} spellCheck={false} value={input} />
      </label>
      <label className="editor-panel result-panel">
        <span>결과</span>
        <textarea aria-label="JSON 결과" placeholder="실행 결과가 여기에 표시됩니다." readOnly spellCheck={false} value={output} />
      </label>
      <div className="tool-actions">
        <button className="tertiary-button" onClick={reset} type="button">초기화</button>
        <button onClick={() => transformJson(false)} type="button">Pretty Format</button>
        <button className="secondary-action" onClick={() => transformJson(true)} type="button">Minify</button>
        <button className="secondary-action" onClick={copyOutput} type="button">결과 복사</button>
      </div>
      {feedback.kind === "error" ? <p className="status-text error-text" role="alert">{feedback.message}</p> : null}
    </div>
  );
}
