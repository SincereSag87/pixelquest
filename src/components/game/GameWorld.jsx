import { collectibles, starterArea } from "../../data/worldData";
import { npcs } from "../../data/npcData";
import { Collectible } from "./Collectible";
import { NPC } from "./NPC";
import { Player } from "./Player";

export function GameWorld({ collectedIds, nearbyCollectible, nearbyNpc, player }) {
  return (
    <section className="game-stage" aria-label="Whisperwood Village playable area">
      <div className="area-banner">
        <strong>{starterArea.name}</strong>
        <span>{starterArea.description}</span>
      </div>
      <div className="world-layer" aria-hidden="true">
        <span className="path" />
        <span className="pond" />
        <span className="campfire" />
        <span className="cottage one" />
        <span className="cottage two" />
        <span className="ruins" />
        <span className="signpost" />
        <span className="tree t1" />
        <span className="tree t2" />
        <span className="tree t3" />
        <span className="tree t4" />
        <span className="tree t5" />
      </div>
      {npcs.map((npc) => (
        <NPC isNearby={nearbyNpc?.id === npc.id} key={npc.id} npc={npc} />
      ))}
      {collectibles
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
