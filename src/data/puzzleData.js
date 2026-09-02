export const shrinePuzzle = {
  id: "ancientShrine",
  name: "Ancient Forest Shrine",
  x: 70,
  y: 28,
  area: "forest",
  clue: "First the moon, then the river, then the tree.",
  sequence: ["moon", "river", "tree"],
  runes: [
    { id: "tree", label: "Tree", symbol: "TREE" },
    { id: "moon", label: "Moon", symbol: "MOON" },
    { id: "river", label: "River", symbol: "RIVER" },
  ],
  rewardItem: "oldForestKey",
};

export const ruinsPuzzles = [
  {
    id: "hallEchoes",
    name: "Hall of Echoes",
    x: 38,
    y: 48,
    area: "ruins",
    clue: "Repeat the lights as text: Moon, Star, River.",
    sequence: ["moon", "star", "river"],
    runes: [
      { id: "moon", label: "Moon", symbol: "MOON" },
      { id: "star", label: "Star", symbol: "STAR" },
      { id: "river", label: "River", symbol: "RIVER" },
    ],
  },
  {
    id: "floodedChamber",
    name: "Flooded Chamber",
    x: 58,
    y: 72,
    area: "ruins",
    clue: "Redirect water through Left, Center, Right switches.",
    sequence: ["left", "center", "right"],
    runes: [
      { id: "left", label: "Left Switch", symbol: "LEFT" },
      { id: "center", label: "Center Switch", symbol: "CENTER" },
      { id: "right", label: "Right Switch", symbol: "RIGHT" },
    ],
  },
];
