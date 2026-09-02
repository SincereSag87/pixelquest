export const npcs = [
  {
    id: "mira",
    name: "Mira the Cartographer",
    icon: "M",
    x: 45,
    y: 42,
    personality: "Curious, brisk, and impossible to surprise.",
    dialogue: [
      "Something strange has been glowing in the old forest. If you're heading that way, take this map.",
      "Whisperwood paths bend around anyone who forgets to look twice.",
    ],
    givesItem: "mapFragment",
    questId: "woodsWhispers",
  },
  {
    id: "rowan",
    name: "Old Rowan",
    icon: "R",
    x: 22,
    y: 70,
    personality: "Warm, patient, and fond of impossible stories.",
    dialogue: [
      "My lantern wandered off near the old forest path. Lanterns should not wander, but Whisperwood has habits.",
      "Bring it back, Explorer, and I'll make sure the village remembers your first brave errand.",
    ],
    questId: "missingLantern",
  },
  {
    id: "pip",
    name: "Pip",
    icon: "P",
    x: 76,
    y: 74,
    personality: "Fast-talking, cheerful, and usually knee-deep in pond reeds.",
    dialogue: [
      "I saw a tiny gold spark bounce toward the ruins gate. I did not chase it. Well, not far.",
      "Moonberries are best collected before they start humming.",
    ],
    questId: "pipsMoonberries",
  },
];
