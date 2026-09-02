import { Collectible } from "./Collectible";
import { NPC } from "./NPC";
import { Player } from "./Player";

export function GameWorld({
  area,
  areaNpcs,
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
      {area.theme === "village" ? <VillageArt /> : null}
      {area.theme === "forest" ? <ForestArt gateUnlocked={game.gateUnlocked} /> : null}
      {area.theme === "ruins" ? <RuinsArt game={game} /> : null}
      {area.inspectables?.map((item) => (
        <div className="entity inspectable" key={item.id} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
          <span aria-hidden="true">?</span>
          {nearbyInspectable?.id === item.id && game.settings.showPrompts ? <span className="interaction-prompt">Press E to inspect</span> : null}
        </div>
      ))}
      {nearbyPuzzle || area.theme === "forest" || area.theme === "ruins" ? <PuzzleMarkers area={area} game={game} nearbyPuzzle={nearbyPuzzle} /> : null}
      {area.theme === "ruins" && !game.dungeonProgress.vaultOpen ? (
        <div className="entity encounter-marker guardian-marker" style={{ left: "76%", top: "45%" }}>
          <span>SG</span>
          {game.settings.showPrompts ? <span className="interaction-prompt">Press E for trial</span> : null}
        </div>
      ) : null}
      {Object.values(game.solvedEncounters).length >= 0 && area.theme === "forest" ? (
        <>
          {!game.solvedEncounters.includes("brambleSprite") ? <EncounterMarker id="brambleSprite" isNearby={nearbyEncounter?.id === "brambleSprite"} /> : null}
          {!game.solvedEncounters.includes("mossling") ? <EncounterMarker id="mossling" isNearby={nearbyEncounter?.id === "mossling"} /> : null}
        </>
      ) : null}
      {areaNpcs.map((npc) => (
        <NPC isNearby={nearbyNpc?.id === npc.id} key={npc.id} npc={npc} />
      ))}
      {area.collectibles
        .filter((collectible) => !collectedIds.includes(collectible.id))
        .filter((collectible) => !collectible.nightOnly || game.timeState === "Night")
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

function ForestArt({ gateUnlocked }) {
  return (
    <div className="world-layer forest-layer" aria-hidden="true">
      <span className="forest-trail" /><span className="side-path" /><span className="creek" /><span className="broken-cart" />
      <span className="forest-shrine" /><span className="ancient-gate" /><span className={`locked-ruins ${gateUnlocked ? "unlocked" : ""}`} /><span className="abandoned-camp" />
      {Array.from({ length: 12 }, (_, index) => <span className={`forest-tree ft${index + 1}`} key={index} />)}
      {Array.from({ length: 7 }, (_, index) => <span className={`glowcap gm${index + 1}`} key={index} />)}
      {Array.from({ length: 9 }, (_, index) => <span className={`leaf lf${index + 1}`} key={index} />)}
    </div>
  );
}

function RuinsArt({ game }) {
  return (
    <div className={`world-layer ruins-layer ${game.timeState.toLowerCase()}`} aria-hidden="true">
      <span className="ruins-floor" /><span className="light-shaft one" /><span className="light-shaft two" />
      <span className="ruins-room entrance" /><span className="ruins-room echoes" /><span className="ruins-room gallery" />
      <span className="ruins-room flooded" /><span className="ruins-room archivist" /><span className="ruins-room moon" />
      <span className={`ruins-room vault ${game.dungeonProgress.vaultOpen ? "open" : ""}`} />
      <span className="underground-pool" /><span className="column c1" /><span className="column c2" /><span className="column c3" />
      <span className="statue s1" /><span className="statue s2" />
      {Array.from({ length: 8 }, (_, index) => <span className={`ruin-rune rr${index + 1}`} key={index} />)}
    </div>
  );
}

function PuzzleMarkers({ area, game, nearbyPuzzle }) {
  const markers = [
    area.theme === "forest" && !game.completedPuzzles.includes("ancientShrine") ? { id: "ancientShrine", x: 70, y: 28, label: "RUNE" } : null,
    area.theme === "ruins" && !game.completedPuzzles.includes("hallEchoes") ? { id: "hallEchoes", x: 38, y: 48, label: "ECHO" } : null,
    area.theme === "ruins" && !game.completedPuzzles.includes("floodedChamber") ? { id: "floodedChamber", x: 58, y: 72, label: "FLOW" } : null,
  ].filter(Boolean);

  return markers.map((marker) => (
    <div className="entity shrine-puzzle" key={marker.id} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>
      <span>{marker.label}</span>
      {nearbyPuzzle?.id === marker.id && game.settings.showPrompts ? <span className="interaction-prompt">Press E to solve</span> : null}
    </div>
  ));
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
