"use client";

import { useState } from "react";

const sampleJson = '{"requesterKey":"USER001","service":"NexUtils","enabled":true}';

export default function JsonFormatterTool() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState(JSON.stringify(JSON.parse(sampleJson), null, 2));
  const [status, setStatus] = useState("");

  function formatJson() {
    try {
      setOutput(JSON.stringify(JSON.parse(input), null, 2));
      setStatus("포맷이 완료됐어요.");
    } catch {
      setStatus("JSON 형식을 확인해주세요.");
    }
  }

  async function copyOutput() {
    if (!output) {
      setStatus("복사할 결과가 없습니다.");
      return;
    }
    await navigator.clipboard.writeText(output);
    setStatus("복사됐어요.");
    window.setTimeout(() => setStatus(""), 1800);
  }

  return (
    <div className="tool-form editor-workspace json-workspace">
      <div className="workspace-heading">
        <div>
          <h2>JSON Formatter</h2>
          <p>JSON을 보기 좋게 정렬하고 유효성을 확인합니다.</p>
        </div>
        <span>{status || "JSON 입력 대기"}</span>
      </div>
      <label className="editor-panel wide-editor">
        <span>JSON 편집기</span>
        <textarea onChange={(event) => setInput(event.target.value)} placeholder={sampleJson} spellCheck={false} value={input} />
      </label>
      <div className="tool-actions">
        <button onClick={formatJson} type="button">포맷</button>
        <button className="secondary-action" onClick={copyOutput} type="button">결과 복사</button>
        <button className="tertiary-button" onClick={() => { setInput(""); setOutput(""); setStatus(""); }} type="button">초기화</button>
      </div>
      <label className="editor-panel result-panel wide-editor">
        <span>결과</span>
        <textarea readOnly spellCheck={false} value={output} />
      </label>
      {status ? <p className="status-text">{status}</p> : null}
    </div>
  );
}
