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
    choices: [
      {
        prompt: "The ruins were sealed long before Whisperwood existed. Why do you think they opened now?",
        options: [
          { id: "forest-wanted", label: "Maybe the forest wanted us to find them.", response: "Then we should listen carefully. Forests rarely speak twice." },
          { id: "someone-opened", label: "Someone could have opened them.", response: "A practical worry. Look for marks that do not belong to age or weather." },
          { id: "inside", label: "I'm more interested in what's inside.", response: "Curiosity is useful. Bring caution with it." },
        ],
      },
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
  {
    id: "elyra",
    name: "Elyra the Archivist",
    icon: "E",
    area: "ruins",
    x: 34,
    y: 32,
    personality: "Curious, calm, and slightly mysterious.",
    dialogue: [
      "These halls remember every footstep. Yours is kinder than most.",
      "Bring me lost inscriptions, and I will tell you which memories still matter.",
    ],
    questId: "memoryFragments",
  },
];
