export const WORLD_BOUNDS = { width: 100, height: 100, padding: 4 };

export const areas = {
  village: {
    id: "village",
    name: "Whisperwood Village",
    description: "A peaceful forest village on the edge of an ancient woodland.",
    entry: { x: 50, y: 62 },
    returnPoint: { x: 84, y: 50 },
    theme: "village",
    obstacles: [
      { id: "cottage-one", x: 18, y: 23, width: 15, height: 18 },
      { id: "cottage-two", x: 64, y: 22, width: 14, height: 16 },
      { id: "pond", x: 79, y: 80, width: 18, height: 12 },
      { id: "ruins", x: 83, y: 42, width: 12, height: 16 },
      { id: "campfire", x: 20, y: 76, width: 8, height: 8 },
    ],
    transitionZones: [
      { id: "to-forest", to: "forest", x: 92, y: 51, width: 8, height: 20, label: "Old Forest Path" },
    ],
    collectibles: [
      { id: "coin-village", itemId: "coin", x: 49, y: 50, quantity: 5, label: "+5 Coins" },
      { id: "moonberry-pond", itemId: "moonberry", x: 74, y: 70, quantity: 1, label: "+1 Moonberry" },
      { id: "old-key", itemId: "oldKey", x: 31, y: 34, quantity: 1, label: "Old Key" },
      { id: "map-fragment", itemId: "mapFragment", x: 58, y: 47, quantity: 1, label: "Map Fragment" },
      { id: "rowan-lantern", itemId: "lantern", x: 87, y: 55, quantity: 1, label: "Rowan's Lantern" },
    ],
    inspectables: [
      {
        id: "village-sign",
        x: 44,
        y: 39,
        title: "Weathered Signpost",
        text: "The sign points east: Old Forest Path. Someone has scratched three tiny runes beneath the arrow.",
      },
    ],
  },
  forest: {
    id: "forest",
    name: "Old Forest Path",
    description: "An ancient woodland trail where moss, ruins, and quiet lights twist between the trees.",
    entry: { x: 10, y: 52 },
    returnPoint: { x: 10, y: 52 },
    theme: "forest",
    obstacles: [
      { id: "forest-creek", x: 45, y: 72, width: 34, height: 8 },
      { id: "broken-cart", x: 28, y: 40, width: 12, height: 10 },
      { id: "ancient-gate", x: 86, y: 31, width: 13, height: 20 },
      { id: "locked-ruins", x: 82, y: 76, width: 16, height: 14 },
    ],
    transitionZones: [
      { id: "to-village", to: "village", x: 4, y: 52, width: 8, height: 22, label: "Whisperwood Village" },
    ],
    collectibles: [
      { id: "forest-marker-1", itemId: "forestRune", x: 25, y: 57, quantity: 1, label: "Trail Marker 1", marker: true },
      { id: "forest-marker-2", itemId: "forestRune", x: 51, y: 39, quantity: 1, label: "Trail Marker 2", marker: true },
      { id: "forest-marker-3", itemId: "forestRune", x: 71, y: 55, quantity: 1, label: "Trail Marker 3", marker: true },
      { id: "forest-moonberry-1", itemId: "moonberry", x: 32, y: 72, quantity: 2, label: "+2 Moonberries" },
      { id: "forest-moonberry-2", itemId: "moonberry", x: 66, y: 67, quantity: 2, label: "+2 Moonberries" },
      { id: "forest-moonberry-3", itemId: "moonberry", x: 18, y: 84, quantity: 1, label: "+1 Moonberry" },
      { id: "forest-glowcap", itemId: "glowcapMushroom", x: 76, y: 43, quantity: 1, label: "Glowcap Mushroom" },
      { id: "traveler-note", itemId: "travelersNote", x: 39, y: 27, quantity: 1, label: "Traveler's Note" },
      { id: "hidden-ancient-coin", itemId: "ancientCoin", x: 88, y: 61, quantity: 1, label: "Hidden Ancient Coin", secret: true },
    ],
    inspectables: [
      {
        id: "broken-cart-story",
        x: 28,
        y: 40,
        title: "Broken Cart",
        text: "A wheel is buried in moss. The cargo is gone, but blue wax drips point toward the old camp.",
      },
      {
        id: "abandoned-camp",
        x: 43,
        y: 28,
        title: "Abandoned Camp",
        text: "Cold ash circles a stack of careful stones. Mira's lights passed through here recently.",
        questStep: { questId: "woodsWhispers", stepId: "camp" },
      },
      {
        id: "carved-tree",
        x: 19,
        y: 72,
        title: "Carved Tree Symbol",
        text: "Moon, river, tree. The same order repeats in shallow cuts across the bark.",
      },
      {
        id: "shrine-inscription",
        x: 70,
        y: 28,
        title: "Shrine Inscription",
        text: "First the moon, then the river, then the tree.",
      },
    ],
  },
};

export const mapLocations = [
  { id: "village", area: "village", name: "Whisperwood Village", status: "discovered", x: 24, y: 52 },
  { id: "forest", area: "forest", name: "Old Forest Path", status: "undiscovered", x: 48, y: 50 },
  { id: "shrine", area: "forest", name: "Ancient Shrine", status: "undiscovered", x: 70, y: 28 },
  { id: "camp", area: "forest", name: "Abandoned Camp", status: "undiscovered", x: 43, y: 28 },
  { id: "creek", area: "forest", name: "Creek Crossing", status: "undiscovered", x: 45, y: 72 },
  { id: "ruins", area: "forest", name: "Ruins Gate", status: "locked", x: 84, y: 76 },
];
