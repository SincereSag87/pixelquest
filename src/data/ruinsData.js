export const ruinsRooms = [
  { id: "entrance", name: "Entrance Hall", x: 14, y: 54, completionWeight: 12 },
  { id: "echoes", name: "Hall of Echoes", x: 38, y: 48, completionWeight: 16 },
  { id: "gallery", name: "Rune Gallery", x: 55, y: 27, completionWeight: 14 },
  { id: "flooded", name: "Flooded Chamber", x: 58, y: 72, completionWeight: 14 },
  { id: "archivist", name: "Archivist Room", x: 34, y: 32, completionWeight: 14 },
  { id: "moonShrine", name: "Moon Shrine", x: 76, y: 43, completionWeight: 16 },
  { id: "vault", name: "Sealed Vault", x: 86, y: 72, completionWeight: 14 },
];

export const guardianTrial = {
  id: "stoneGuardian",
  name: "Stone Guardian",
  area: "ruins",
  x: 76,
  y: 45,
  pattern: ["Moon", "Tree", "River"],
  rounds: 3,
};
