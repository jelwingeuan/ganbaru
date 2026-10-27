# Ganbaru 頑張る

Practice for the JLPT (Japanese-Language Proficiency Test), N5 to N1, with full timed mock tests that follow the real exam, skill drills, a dictionary and grammar lessons.

## What's in it

**Mock tests.** One full test per level. Each one follows the official structure: the same sections, time limits and question types, with the same number of questions as the real test.
- **Exam mode:** each section has its own timer, and nothing is revealed until the end.
- **Reading:** passages sit above their questions.
- **Listening:** each recording plays once and can't be paused or replayed.
- **Navigation:** a question bar with flags.
- **Results:** estimated scores per section against the sectional minimums, an overall pass estimate, and a breakdown by question type.
- **Review:** every question with its explanation, translation and listening transcript.

**Skill drills.** Sets of ten kanji-reading and spelling questions at every level, with the answer and explanation after each one, and progress saved as you go.

**Dictionary.** Look up about 7,800 JLPT words and 2,400 kanji by kanji, kana, romaji or English. Filter with tags like `#n3 #verb`. Word pages show furigana example sentences, and kanji pages show readings and related words.

**Grammar.** 526 grammar points, each with its meaning, how it's formed, notes and examples.

## How the questions are made

Every question is an original written for Ganbaru in the official JLPT formats. None are real or leaked exam questions.

- **Data-built:** kanji-reading, spelling and word-in-context questions come from [OpenJLPT](https://github.com/evanclan/OpenJLPT) words and their [Tatoeba](https://tatoeba.org) example sentences.
- **AI-written:** grammar, reading and listening questions are written by AI agents.
- **Blind check:** a separate agent solves each question without the answer key. A question only ships if it reaches the same answer and finds exactly one correct option, natural Japanese and the right level. Questions that fail are rewritten.
- **Audio:** listening recordings are voiced with [VOICEVOX](https://voicevox.hiroshiba.jp/).

## Run it locally

Needs Node 24.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests: blueprints, scoring, question checks, search, the question generator |
| `npm run lint` / `npm run build` | Lint and production build |
| `npm run data:openjlpt` | Fetch the pinned OpenJLPT release into `data/openjlpt` and validate it |
| `npm run content:data` | Rebuild the data-built questions in `content/questions` |
| `npm run content:audio` | Voice listening scripts into `public/audio` (needs the VOICEVOX app open) |

## Project layout

```
app/                pages: tests, drills, dictionary, grammar
components/test/    exam player, drill player, hub
components/desk/    design system ("study desk" theme)
content/            blueprints, questions, passages, mock tests
lib/                data loading, search, scoring, question checks
scripts/            data import, question generation, audio
data/openjlpt/      dictionary data (pinned OpenJLPT release)
```

## Built with

Next.js 16, React 19, Tailwind CSS 4, shadcn/ui and [React Bits](https://reactbits.dev).

## Credits and licences

- **Words and kanji:** [OpenJLPT](https://github.com/evanclan/OpenJLPT) (CC BY-SA 4.0). It's built on JMdict and KANJIDIC2 from the [EDRDG](https://www.edrdg.org/edrdg/licence.html) and on Jonathan Waller's JLPT lists.
- **Example sentences:** [Tatoeba](https://tatoeba.org) (CC BY 2.0 FR).
- **Data-built questions:** licensed CC BY-SA 4.0. See [`content/questions/NOTICE.md`](content/questions/NOTICE.md).
- **Listening voices:** VOICEVOX:九州そら, VOICEVOX:四国めたん, VOICEVOX:玄野武宏, VOICEVOX:青山龍星.

JLPT levels in this app are community estimates; the JLPT has published no official word, kanji or grammar lists since 2010. Ganbaru is not affiliated with the Japan Foundation or JEES.
