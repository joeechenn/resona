// any prompt can go in any position slot
// layout handles rendering: positions 0 & 1 are smaller (left), position 2 is featured (right)

export type EntityType = "track" | "album" | "artist";
export type PromptType = EntityType | "any";

export interface ProfilePrompt {
  text: string;
  type: PromptType;
}

export const PROFILE_PROMPTS: ProfilePrompt[] = [
  // general prompts, user picks any entity type
  { text: "Most overrated", type: "any" },
  { text: "Most underrated", type: "any" },
  { text: "Greatest of all time", type: "any" },
  { text: "Tried to get into it but couldn't", type: "any" },

  // track prompts
  { text: "A song I will never skip", type: "track" },
  { text: "My most embarrassing 10/10", type: "track" },
  { text: "I could bump this no matter the situation or time", type: "track" },
  { text: "Performative but amazing", type: "track" },
  { text: "Most random out of my lineup", type: "track" },

  // artist prompts
  { text: "I would see them in any city, any price", type: "artist" },
  { text: "The artist that got me into music", type: "artist" },
  { text: "Found them before anyone else", type: "artist" },
  { text: "A guilty pleasure", type: "artist" },
  { text: "An artist that changed how I hear music", type: "artist" },

  // album prompts
  { text: "No skips", type: "album" },
  { text: "Greatest album out of their discography", type: "album" },
  { text: "The album I recommend to everyone", type: "album" },
  { text: "Most influential album on my life", type: "album" },
  { text: "The album that made me fall in love with the genre", type: "album" },
];

// max prompts a user can have on their profile
export const MAX_PROFILE_PROMPTS = 3;

// helper to find a prompt's type by text, for server-side validation
export function getPromptType(text: string): PromptType | null {
  return PROFILE_PROMPTS.find(p => p.text === text)?.type ?? null;
}
