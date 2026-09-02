export const quests = {
  missingLantern: {
    id: "missingLantern",
    name: "The Missing Lantern",
    description: "Find Rowan's missing lantern near the old forest path.",
    reward: { xp: 50, coins: 25, badge: "Forest Explorer Badge" },
    steps: [
      { id: "talk-rowan", label: "Talk to Old Rowan" },
      { id: "search-path", label: "Search the forest path" },
      { id: "find-lantern", label: "Find the lantern" },
      { id: "return-rowan", label: "Return to Rowan" },
    ],
  },
  woodsWhispers: {
    id: "woodsWhispers",
    name: "Whispers in the Woods",
    description: "Investigate the strange lights Mira detected along the Old Forest Path.",
    reward: { xp: 100, coins: 40, badge: "Woodland Guide", perk: "Explorer's Eye" },
    steps: [
      { id: "enter-forest", label: "Enter Old Forest Path" },
      { id: "markers", label: "Find 3 glowing trail markers", target: 3 },
      { id: "camp", label: "Investigate the abandoned camp" },
      { id: "sprite", label: "Calm the Bramble Sprite" },
      { id: "return-mira", label: "Return to Mira" },
    ],
  },
  pipsMoonberries: {
    id: "pipsMoonberries",
    name: "Pip's Moonberries",
    description: "Collect 5 Moonberries in the forest for Pip's latest pond experiment.",
    reward: { xp: 40, coins: 15, item: "moonberryCharm" },
    steps: [
      { id: "moonberries", label: "Collect 5 Moonberries in the forest", target: 5 },
      { id: "return-pip", label: "Return to Pip" },
    ],
  },
};
