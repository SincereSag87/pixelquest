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
};
