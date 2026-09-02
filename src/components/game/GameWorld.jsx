import { Collectible } from "./Collectible";
import { NPC } from "./NPC";
import { Player } from "./Player";

export function GameWorld({
  area,
  collectedIds,
  game,
  nearbyCollectible,
  nearbyEncounter,
  nearbyInspectable,
  nearbyNpc,
  nearbyPuzzle,
  player,
}) {
  return (
    <section className={`game-stage ${area.theme}`} aria-label={`${area.name} playable area`}>
      <div className="area-banner">
        <strong>{area.name}</strong>
        <span>{area.description}</span>
      </div>
      {area.theme === "village" ? <VillageArt /> : <ForestArt />}
      {area.inspectables?.map((item) => (
        <div className="entity inspectable" key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
          <span aria-hidden="true">?</span>
          {nearbyInspectable?.id === item.id && game.settings.showPrompts ? <span className="interaction-prompt">Press E to inspect</span> : null}
        </div>
      ))}
      {area.theme === "forest" && !game.completedPuzzles.includes("ancientShrine") ? (
        <div className="entity shrine-puzzle" style={{ left: "70%", top: "28%" }}>
          <span>RUNE</span>
          {nearbyPuzzle && game.settings.showPrompts ? <span className="interaction-prompt">Press E to solve</span> : null}
        </div>
      ) : null}
      {Object.values(game.solvedEncounters).length >= 0 && area.theme === "forest" ? (
        <>
          {!game.solvedEncounters.includes("brambleSprite") ? <EncounterMarker id="brambleSprite" isNearby={nearbyEncounter?.id === "brambleSprite"} /> : null}
          {!game.solvedEncounters.includes("mossling") ? <EncounterMarker id="mossling" isNearby={nearbyEncounter?.id === "mossling"} /> : null}
        </>
      ) : null}
      {area.theme === "village" ? [
        { id: "mira", name: "Mira the Cartographer", icon: "M", x: 45, y: 42, personality: "Curious, brisk, and impossible to surprise." },
        { id: "rowan", name: "Old Rowan", icon: "R", x: 22, y: 70, personality: "Warm, patient, and fond of impossible stories." },
        { id: "pip", name: "Pip", icon: "P", x: 76, y: 74, personality: "Fast-talking, cheerful, and usually knee-deep in pond reeds." },
      ].map((npc) => (
        <NPC isNearby={nearbyNpc?.id === npc.id} key={npc.id} npc={npc} />
      )) : null}
      {area.collectibles
        .filter((collectible) => !collectedIds.includes(collectible.id))
        .map((collectible) => (
          <Collectible
            collectible={collectible}
            isNearby={nearbyCollectible?.id === collectible.id}
            key={collectible.id}
          />
        ))}
      <Player position={player.position} />
    </section>
  );
}

function VillageArt() {
  return (
    <div className="world-layer" aria-hidden="true">
      <span className="path" /><span className="pond" /><span className="campfire" /><span className="cottage one" />
      <span className="cottage two" /><span className="ruins" /><span className="signpost" />
      <span className="tree t1" /><span className="tree t2" /><span className="tree t3" /><span className="tree t4" /><span className="tree t5" />
    </div>
  );
}

function ForestArt() {
  return (
    <div className="world-layer forest-layer" aria-hidden="true">
      <span className="forest-trail" /><span className="side-path" /><span className="creek" /><span className="broken-cart" />
      <span className="forest-shrine" /><span className="ancient-gate" /><span className="locked-ruins" /><span className="abandoned-camp" />
      {Array.from({ length: 12 }, (_, index) => <span className={`forest-tree ft${index + 1}`} key={index} />)}
      {Array.from({ length: 7 }, (_, index) => <span className={`glowcap gm${index + 1}`} key={index} />)}
      {Array.from({ length: 9 }, (_, index) => <span className={`leaf lf${index + 1}`} key={index} />)}
    </div>
  );
}

function EncounterMarker({ id, isNearby }) {
  const marker = {
    brambleSprite: { icon: "BS", x: 58, y: 50, label: "Bramble Sprite" },
    mossling: { icon: "Mo", x: 37, y: 65, label: "Mossling" },
  }[id];
  return (
    <div className="entity encounter-marker" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>
      <span>{marker.icon}</span>
      {isNearby ? <span className="interaction-prompt">Press E to encounter</span> : null}
    </div>
  );
}
