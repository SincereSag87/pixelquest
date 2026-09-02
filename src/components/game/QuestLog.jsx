import { X } from "lucide-react";
import { quests } from "../../data/questData";

export function QuestLog({ game, onClose }) {
  const active = Object.values(game.quests).filter((quest) => !game.completedQuests.includes(quest.id));
  const completed = game.completedQuests.map((questId) => ({
    id: questId,
    completedSteps: quests[questId].steps.map((step) => step.id),
  }));

  return (
    <div className="panel-backdrop" role="presentation">
      <section aria-labelledby="quest-log-title" className="game-panel" role="dialog">
        <div className="panel-header">
          <h2 id="quest-log-title">Quest Log</h2>
          <button aria-label="Close quest log" className="close-button" onClick={onClose} type="button"><X size={20} /></button>
        </div>
        <QuestSection empty="Talk to Old Rowan at the campfire to begin." gameQuests={active} title="Active" />
        <QuestSection empty="No completed quests yet." gameQuests={completed} title="Completed" />
      </section>
    </div>
  );
}

function QuestSection({ empty, gameQuests, title }) {
  return (
    <section>
      <h3>{title}</h3>
      {gameQuests.length ? (
        gameQuests.map((gameQuest) => {
          const quest = quests[gameQuest.id];
          return (
            <article className="quest-card" key={quest.id}>
              <h4>{quest.name}</h4>
              <p>{quest.description}</p>
              <ul className="objective-list">
                {quest.steps.map((step) => {
                  const done = gameQuest.completedSteps.includes(step.id);
                  return (
                    <li className={done ? "done" : ""} key={step.id}>
                      <span aria-hidden="true">{done ? "✓" : "□"}</span>
                      <span>{step.label}</span>
                    </li>
                  );
                })}
              </ul>
              <p><strong>Reward:</strong> {quest.reward.xp} XP, {quest.reward.coins} coins, {quest.reward.badge}</p>
            </article>
          );
        })
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}
