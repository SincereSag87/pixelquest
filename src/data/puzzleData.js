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
