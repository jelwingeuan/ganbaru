/** Splits OpenJLPT's {漢字|かんじ} notation into plain and ruby segments. Safe to use in the browser. */
export function furiganaParts(furigana: string): { text: string; ruby?: string }[] {
  return furigana.split(/(\{[^|{}]+\|[^{}]+\})/).filter(Boolean).map((part) => {
    const m = part.match(/^\{([^|]+)\|(.+)\}$/);
    // OpenJLPT 0.3.0 has ~95 groups holding a JMdict id instead of a reading ({前|#1392580}); show those as plain text.
    return m && /^[ぁ-ゖァ-ヺー]+$/.test(m[2]) ? { text: m[1], ruby: m[2] } : { text: m ? m[1] : part };
  });
}
