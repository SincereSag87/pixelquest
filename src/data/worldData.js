export const WORLD_BOUNDS = { width: 100, height: 100, padding: 4 };

export const obstacles = [
  { id: "cottage-one", x: 18, y: 23, width: 15, height: 18 },
  { id: "cottage-two", x: 64, y: 22, width: 14, height: 16 },
  { id: "pond", x: 79, y: 80, width: 18, height: 12 },
  { id: "ruins", x: 83, y: 42, width: 12, height: 16 },
  { id: "campfire", x: 20, y: 76, width: 8, height: 8 },
];

export const collectibles = [
  { id: "coin-village", itemId: "coin", x: 49, y: 50, quantity: 5, label: "+5 Coins" },
  { id: "moonberry-pond", itemId: "moonberry", x: 74, y: 70, quantity: 1, label: "+1 Moonberry" },
  { id: "old-key", itemId: "oldKey", x: 31, y: 34, quantity: 1, label: "Old Key" },
  { id: "map-fragment", itemId: "mapFragment", x: 58, y: 47, quantity: 1, label: "Map Fragment" },
  { id: "rowan-lantern", itemId: "lantern", x: 87, y: 55, quantity: 1, label: "Rowan's Lantern" },
];

export const mapLocations = [
  { id: "village", name: "Whisperwood Village", status: "Current", x: 48, y: 52 },
  { id: "forest-path", name: "Old Forest Path", status: "Coming Soon", x: 78, y: 48 },
  { id: "pond", name: "Pond", status: "Discovered", x: 81, y: 82 },
  { id: "ruins", name: "Ruins Gate", status: "Locked", x: 86, y: 42 },
  { id: "campfire", name: "Campfire", status: "Discovered", x: 22, y: 78 },
];

export const starterArea = {
  name: "Whisperwood Village",
  description: "A peaceful forest village on the edge of an ancient woodland.",
};
