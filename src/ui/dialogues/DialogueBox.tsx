import React, { useEffect, useRef, useState } from "react";

interface DialogueBoxProps {
  speaker: string;
  message: string;
  onNext: () => void;
  showNext?: boolean;
  portraitUrl?: string;
  typewriter?: boolean;
}

const Typewriter: React.FC<{ text: string; onDone?: () => void }> = ({ text, onDone }) => {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed("");
    idx.current = 0;
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[idx.current]);
      idx.current += 1;
      if (idx.current >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return <span>{displayed}</span>;
};

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  speaker,
  message,
  onNext,
  showNext = true,
  portraitUrl,
  typewriter = true,
}) => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(false);
  }, [message]);

  return (
    <div className="dialogue-window">
      <div className="dialogue-header">
        {portraitUrl && <img src={portraitUrl} alt={speaker} className="dialogue-portrait" />}
        <span className="dialogue-speaker">{speaker}</span>
      </div>
      <div className="dialogue-message">
        {typewriter ? (
          <Typewriter text={message} onDone={() => setDone(true)} />
        ) : (
          <span>{message}</span>
        )}
      </div>
      {showNext && (
        <div
          className={`dialogue-footer${done ? " dialogue-footer--active" : ""}`}
          onClick={() => done && onNext()}
          tabIndex={0}
          onKeyDown={e => done && (e.key === "Enter" || e.key === " ") && onNext()}
          style={{ cursor: done ? "pointer" : "not-allowed" }}
        >
          {done ? "Next ▶" : <span style={{ opacity: 0.3 }}>…</span>}
        </div>
      )}
    </div>
  );
};