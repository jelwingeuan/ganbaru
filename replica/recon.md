# Recon map: Ganbaru, from 9 Japanese-learning sites (web)

Scope: an original JLPT study app (dictionary, SRS, grammar, quizzes, mock tests, gamification). The sources below are inspiration for features and flows only. No text, quiz items, images, audio or code from them is used.
For: self-studying JLPT learners, N5 to N1, mostly on phones in short daily sessions
Date: 2026-10-26

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Jisho | https://jisho.org/ | EDRDG dictionary; romaji→kana, `#jlpt-n3 #verb` tags, wildcards, radical picker, kanji pivots |
| 2 | Weblio | https://www.weblio.jp/ | native dictionary; search modes, word of the day, rankings, "A と B の違い" |
| 3 | JLPT Sensei | https://jlptsensei.com/ | grammar by level; pattern by part of speech; JP/romaji/EN toggles per example |
| 4 | TUFS language modules | https://www.coelang.tufs.ac.jp/ja/zt/ | fixed lesson order card → explanation → examples → exercises; must-know vs extra |
| 5 | TUFS grammar module | https://www.coelang.tufs.ac.jp/ja/zt/gmod/ | 24/48-week pacing |
| 6 | Sigure | https://www.sigure.tw/learn-japanese/grammar/ | confusable "A vs B" pages, conjugation and kana drills, themed difficulty ladder |
| 7 | 3A Network | https://www.3anet.co.jp/ | ★ core words, perfect score unlocks a collectible, repeat-until-correct |
| 8 | 日本語NET | https://nihongokyoshi-net.com/ | can-do lines per lesson, confusable pairs, quiz packs by level × type |
| 9 | Tanoshii Japanese | https://www.tanoshiijapanese.com/dictionary/ | returned 403; not read |

## Core loop

Open Today, clear the due reviews with the red sheet, learn the next 10 new items, keep the streak.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Landing | `/` logged out | explain and convert | live red-sheet demo card, sign-up CTA | default |
| S02 | Auth | `/login` | magic link, Google | email field, provider button | empty, sent, error |
| S03 | Onboarding | `/onboarding` | level, exam date, daily goal | Stepper, belt picker, date picker | each step, skip |
| S04 | Today | `/` logged in | one primary action | Counter (countdown), ink-bottle goal, due count, word of the day | new user, due > 0, all done, behind plan |
| S05 | Study session | `/study` | SRS reviews and new cards | study card, red sheet, typed answer, grade buttons, Swipe Toast | loading, review, new, correct, wrong, session done |
| S06 | Dictionary search | `/dictionary?q=` | find words and kanji | search field, Rubber Segment modes, tag pills, results list | empty, typing, results, no results |
| S07 | Word detail | `/dictionary/word/[id]` | meanings, readings, examples | ruby furigana, peek toggles, add-to-deck | not in deck, in deck |
| S08 | Kanji detail | `/dictionary/kanji/[char]` | readings, strokes, components | stroke-order SVG, pivots (starts/ends/contains) | default |
| S09 | Radical picker | overlay on S06 | search kanji by parts | radical grid by stroke count | none picked, narrowed |
| S10 | Level browser | `/levels/[n]` | units of 10 items | Status Mark per unit, Stack preview | not started, in progress, done |
| S11 | Grammar list | `/grammar?level=` | browse points | filters by level and POS | default |
| S12 | Grammar point (Dojo) | `/grammar/[slug]` | learn one point | pattern card, two-tier explanation, examples, 3 practice items, vs link | draft badge, reviewed |
| S13 | Confusable Duel | `/duel/[pair]` | minimal-pair drill | 2-choice quick fire, timer | playing, result |
| S14 | Quiz | `/quiz` | 10-question rounds | question types, Count Up XP | question, feedback, summary |
| S15 | Mock test | `/test/[level]` | timed JLPT-style test | Tear Ticket start, section timer, Hold Button end | ticket, in section, time up |
| S16 | Test results | `/test/[level]/result/[id]` | score breakdown | section bars, weak areas, add mistakes to SRS | pass, fail |
| S17 | Drills | `/drills` | conjugation and kana | typed input, streak counter | default |
| S18 | Stamp book & achievements | `/stamps` | collectibles | Flip Card stamps, badge grid | empty, partial, full |
| S19 | Stats | `/stats` | progress | heatmap, retention, Rubber Segment range | no data, data |
| S20 | Settings | `/settings` | goals, theme, exam date | form controls | default |
| S21 | Licenses | `/about/licenses` | data attribution | text | default |

## Flows

```
F01 New learner gets to the first review
    S01 -> S02 -> S03 (3 steps) -> S04 -> S05
    happy path clicks: 6
    edge: magic link opened on another device, no exam date picked

F02 Daily review
    S04 -> S05 -> session done -> S04
    happy path clicks: 1 + one keypress per card
    edge: 0 due, mistaken grade (undo), offline mid-session

F03 Look up a word and add it
    S06 (type) -> S07 -> add to deck
    happy path clicks: 2
    edge: romaji input, no results, wildcard query

F04 Find a kanji by its parts
    S06 -> S09 -> S08 -> pivot -> S07

F05 Learn a grammar point
    S11 -> S12 -> practice -> add to SRS -> S13 (vs pair)

F06 Quick quiz
    S04 or S14 -> 10 questions -> summary -> mistakes into SRS

F07 Mock test
    S15 ticket -> sections -> S16 -> add mistakes to SRS

F08 Earn a stamp
    finish a unit with 100% -> stamp animation -> S18
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary (ink), secondary (outline), danger (red), ghost | default, hover, focus, disabled, loading | all |
| Study card | review, new, kanji, grammar | prompt, answering, revealed, correct, wrong | S05, S01 |
| Red sheet | light (multiply), dark (opaque) | covering, peeked | S05, S07 examples, S01 |
| Grade bar | 4 grades with interval and key hint | disabled, enabled | S05 |
| Search field | with mode segment and tag pills | empty, typing, results | S06 |
| Belt pill | N5–N1 | default, current | S03, S04, S10 |
| Ink-bottle gauge | daily goal | empty, partial, full | S04 |
| Toast | undo, info | with fuse | S05, global |
| Hold button | destructive confirm | idle, holding, done | S15, S20 |
| Stamp | earned, partial, locked | front, back | S18 |
| Command palette | global search and navigation | open, results | all |

## Inferred data model

```
Word        id, jmdict_id, kanji[], readings[], senses[] (pos, glosses), jlpt_level, common, core
            evidence: Jisho entry layout, JMdict structure   confidence: high
Kanji       char, meanings, on[], kun[], strokes, jlpt_level, components[], stroke_svg
            evidence: Jisho kanji page, KANJIDIC2            confidence: high
Sentence    id, ja, en, tokens (with readings), source=tatoeba
GrammarPoint slug, level, pattern, pos, explanation_core, explanation_extra, examples[], practice[], confusable_with[], status (draft|reviewed)
            evidence: JLPT Sensei, TUFS module order, Sigure badges   confidence: design choice
Card        user_id, item_type, item_id, card_type, fsrs fields (due, stability, difficulty, reps, lapses, state)
ReviewLog   card_id, rating, reviewed_at, elapsed, scheduled
Unit        level, topic, items[], can_do
Stamp       user_id, unit_id, skill (vocab|kanji|grammar), earned_at
Profile     user_id, target_level, exam_date, daily_goal, xp, belt, streak, tz
```

Relationships: User 1-n Card, Card 1-n ReviewLog, Unit n-n Word/Kanji/GrammarPoint, User 1-n Stamp, Word n-n Sentence.

## Feature matrix

See `features.csv`. Must: 22, should: 6, could: 18, skip: 4. v1 (cut 2026-10-27) is the core study loop plus a timed vocabulary-section mock test; grammar lessons, the other mock sections and collectibles come after v1.

## Out of scope (cannot or should not be cloned)

- Any site's grammar explanations, example sentences, quiz items, audio or illustrations (copyrighted; Ganbaru writes its own grammar content)
- Official JLPT past papers (copyrighted by JEES/Japan Foundation; mock tests are original)
- Minna no Nihongo lesson order and vocabulary lists (textbook content)
- Weblio's licensed dictionaries (Ganbaru uses open EDRDG data instead)

## Size

Screens 21, flows 8, entities 9. Hard parts: the dictionary import and search at JMdict scale, writing and checking original grammar content, a mock-test generator that produces believable JLPT-style questions. Size: L.
