import { X } from "lucide-react";

export function DialoguePanel({ dialogue, onChoice, onClose, onNext }) {
  const { npc, index } = dialogue;
  const hasNext = index < npc.dialogue.length - 1;
  const choiceBlock = npc.choices?.[0];

  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="dialogue-title" aria-live="polite" className="game-panel" role="dialog">
        <div className="panel-header">
          <div className="dialogue-speaker">
            <span className="speaker-avatar" aria-hidden="true">{npc.icon}</span>
            <div>
              <h2 id="dialogue-title">{npc.name}</h2>
              <p className="muted">{npc.personality}</p>
            </div>
          </div>
          <button aria-label="Close dialogue" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <div className="dialogue-text">
          <p>{dialogue.response ?? npc.dialogue[index]}</p>
          {choiceBlock && !dialogue.response ? (
            <div className="choice-block">
              <p><strong>{choiceBlock.prompt}</strong></p>
              {choiceBlock.options.map((choice) => (
                <button className="quest-button ghost" key={choice.id} onClick={() => onChoice(npc.id, choice)} type="button">
                  {choice.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="dialogue-actions">
          {hasNext ? (
            <button className="quest-button" onClick={onNext} type="button">Continue dialogue</button>
          ) : null}
          <button className="quest-button secondary" onClick={onClose} type="button">Close dialogue</button>
        </div>
      </section>
    </div>
  );
}
