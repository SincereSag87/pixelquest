import { HelpCircle, Play, RotateCcw } from "lucide-react";

export function TitleScreen({ hasSave, onStart, onContinue, onHelp, saveSummary }) {
  return (
    <main className="title-screen" aria-labelledby="pixelquest-title">
      <div className="title-cloud one" />
      <div className="title-cloud two" />
      {Array.from({ length: 12 }, (_, index) => (
        <span
          className="firefly"
          key={index}
          style={{
            left: `${10 + ((index * 17) % 82)}%`,
            top: `${14 + ((index * 23) % 72)}%`,
            animationDelay: `${index * -0.38}s`,
          }}
        />
      ))}
      <section className="title-card">
        <div className="pixel-logo" aria-hidden="true">
          <span className="pixel-logo-mark" />
        </div>
        <h1 className="pixel-title" id="pixelquest-title">PIXELQUEST</h1>
        <p className="subtitle">A tiny world full of big adventures.</p>
        <div className="world-preview" aria-hidden="true">
          <span className="preview-village" />
          <span className="preview-forest" />
          <span className="preview-trail" />
          <span className="preview-player" />
        </div>
        {hasSave && saveSummary ? (
          <div className="continue-summary">
            <strong>Continue Adventure</strong>
            <span>Level {saveSummary.level} Explorer</span>
            <span>{saveSummary.area}{saveSummary.room ? ` - ${saveSummary.room}` : ""}</span>
            <span>{saveSummary.questsCompleted} quests completed</span>
            <span>{saveSummary.worldPercent}% world discovered</span>
            <span>{saveSummary.secrets} / 6 secrets found</span>
          </div>
        ) : null}
        <div className="title-actions">
          <button className="quest-button" onClick={onStart} type="button">
            <Play size={19} /> Start Adventure
          </button>
          <button className="quest-button secondary" disabled={!hasSave} onClick={onContinue} type="button">
            <RotateCcw size={19} /> Continue
          </button>
          <button className="quest-button ghost" onClick={onHelp} type="button">
            <HelpCircle size={19} /> How to Play
          </button>
        </div>
      </section>
    </main>
  );
}
