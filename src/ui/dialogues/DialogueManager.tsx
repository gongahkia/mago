import React, { useState, useCallback } from "react";
import { DialogueBox } from "./DialogueBox";

export interface DialogueEntry {
  speaker: string;
  message: string;
  portraitUrl?: string;
}

export interface DialogueChoice {
  text: string;
  onSelect: () => void;
}

interface DialogueManagerProps {
  dialogue: DialogueEntry[];
  onEnd?: () => void;
  choices?: DialogueChoice[];
}

export const DialogueManager: React.FC<DialogueManagerProps> = ({
  dialogue,
  onEnd,
  choices,
}) => {
  const [index, setIndex] = useState(0);

  const handleNext = useCallback(() => {
    if (index < dialogue.length - 1) {
      setIndex(index + 1);
    } else if (choices && choices.length > 0) {
    } else {
      onEnd?.();
    }
  }, [index, dialogue.length, onEnd, choices]);

  if (!dialogue || dialogue.length === 0) return null;

  return (
    <div className="dialogue-manager-overlay">
      <DialogueBox
        speaker={dialogue[index].speaker}
        message={dialogue[index].message}
        portraitUrl={dialogue[index].portraitUrl}
        onNext={handleNext}
        showNext={!choices || index < dialogue.length - 1}
      />
      {choices && index === dialogue.length - 1 && (
        <div className="dialogue-choices">
          {choices.map((choice, i) => (
            <button
              key={i}
              className="dialogue-choice-btn"
              onClick={choice.onSelect}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};