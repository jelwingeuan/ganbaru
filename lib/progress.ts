// Drill progress kept in the browser until accounts exist. Every read and write tolerates blocked storage.
export type DrillProgress = { answers: (number | null)[]; finished: boolean; best?: number };

const key = (level: string, setId: string) => `ganbaru:v1:drill:${level}:${setId}`;

export function loadProgress(level: string, setId: string): DrillProgress | null {
  try {
    const raw = localStorage.getItem(key(level, setId));
    return raw ? (JSON.parse(raw) as DrillProgress) : null;
  } catch {
    return null;
  }
}

export function saveProgress(level: string, setId: string, progress: DrillProgress) {
  try {
    localStorage.setItem(key(level, setId), JSON.stringify(progress));
  } catch {}
}
