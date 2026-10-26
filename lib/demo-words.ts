// Sample cards for the landing demo and /design until the dictionary import lands.
// Intervals are illustrative; real ones come from FSRS.
export type DemoWord = {
  word: string;
  reading: string;
  meaning: string;
  grammar: string;
  intervals: [string, string, string, string];
};

export const DEMO_WORDS: DemoWord[] = [
  { word: "食べる", reading: "たべる", meaning: "to eat", grammar: "Ichidan verb, transitive", intervals: ["10m", "1d", "3d", "8d"] },
  { word: "飲む", reading: "のむ", meaning: "to drink", grammar: "Godan verb, transitive", intervals: ["10m", "2d", "4d", "10d"] },
  { word: "勉強", reading: "べんきょう", meaning: "study", grammar: "Noun, takes する", intervals: ["10m", "1d", "2d", "6d"] },
  { word: "頑張る", reading: "がんばる", meaning: "to do your best", grammar: "Godan verb, intransitive", intervals: ["10m", "1d", "3d", "9d"] },
];
