export const sanctuaryRooms = [
  { id: "vaultPassage", name: "Vault Passage", x: 12, y: 54 },
  { id: "celestialBridge", name: "Celestial Bridge", x: 34, y: 48 },
  { id: "sanctuaryGarden", name: "Sanctuary Garden", x: 52, y: 67 },
  { id: "starChamber", name: "Star Chamber", x: 62, y: 38 },
  { id: "observatory", name: "Observatory", x: 78, y: 31 },
  { id: "heart", name: "Heart of Whisperwood", x: 84, y: 62 },
];

export const constellationTrial = {
  id: "constellationTrial",
  name: "Constellation Trial",
  area: "sanctuary",
  x: 84,
  y: 62,
  stages: [
    { clue: "Mira mapped the sky first: Moon, River, Tree.", sequence: ["Moon", "River", "Tree"] },
    { clue: "Elyra's walls remember: Tree, Star, Moon.", sequence: ["Tree", "Star", "Moon"] },
    { clue: "The Star Compass settles on: Star, Moon, River.", sequence: ["Star", "Moon", "River"] },
  ],
};
