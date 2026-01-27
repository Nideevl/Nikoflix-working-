const adjectives = [
  // original + previous additions
  "cool", "silent", "brave", "fast", "dark", "epic", "wild", "shadow", "ghost", "iron",
  "storm", "frozen", "blaze", "neon", "toxic", "void", "lunar", "solar", "phantom", "savage",
  "mystic", "chaos", "eternal", "blood", "night", "thunder", "viper", "raven", "titan", "ninja",
  "cyber", "pixel", "quantum", "stealth", "inferno", "arctic", "venom", "legend", "rogue", "fatal",
  
  "void", "cosmic", "necro", "astral", "feral", "primal", "vortex", "abyssal", "radiant", "obsidian",
  "spectral", "dread", "blitz", "ruthless", "wicked", "divine", "cursed", "glacial", "molten", "eclipse",
  "nova", "plasma", "cryptic", "warped", "sinister", "valiant", "ferocious", "unholy", "celestial", "doomed",
  "savage", "tundra", "ember", "neural", "glitch", "echo", "phantom", "apex", "renegade", "outlaw",
  "barbaric", "mythic", "arcane", "vengeful", "berserk", "corrupted", "eternal", "forgotten", "haunted", "immortal",
  "jubilant", "kinetic", "lurking", "merciless", "noble", "ominous", "psychotic", "quicksilver", "rebel", "shattered",
  "tortured", "unseen", "volatile", "wraithlike", "xeno", "yearning", "zealous"
];

const nouns = [
  // original + previous additions
  "lion", "wolf", "eagle", "dragon", "tiger", "ninja", "hawk", "bear", "falcon", "cobra",
  "shark", "panther", "raven", "phoenix", "viper", "samurai", "ghost", "reaper", "knight", "vortex",
  "blade", "storm", "hunter", "slayer", "legend", "wraith", "specter", "titan", "demon", "angel",
  "fox", "scorpion", "sparrow", "lynx", "jaguar", "python", "bison", "griffin", "kraken", "hydra",
  
  "serpent", "rune", "oracle", "banshee", "golem", "minotaur", "centaur", "leviathan", "chimera", "gargoyle",
  "warlord", "assassin", "berserker", "druid", "sorcerer", "warlock", "necromancer", "paladin", "barbarian", "rogue",
  "vanguard", "sentinel", "overlord", "executioner", "ravager", "predator", "devourer", "conqueror", "heretic", "outcast",
  "renegade", "cyborg", "drone", "hacker", "phantom", "echo", "glitch", "avatar", "spectre", " revenant",
  "behemoth", "colossus", "juggernaut", "monolith", "tempest", "maelstrom", "abyss", "nebula", "comet", "meteor",
  "voidwalker", "starlord", "shadowblade", "bloodfang", "ironclad", "deathclaw", "nightshade", "stormcaller", "flamewraith", "frostbite",
  "soulreaver", "dreadlord", "bonecrusher", "skullsplitter", "doombringer", "hellspawn", "chaosbringer", "fateshaper", "dreamreaver", "timebreaker"
];

// Optional: you can also increase the number range if you want more uniqueness
export default function generateUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // You can mix formats — here are a few popular styles:
  // Option A: your current style (cleanest)
  const num = Math.floor(Math.random() * 990) + 10;           // 10–999
  return `${adj}_${noun}${num}`;

}