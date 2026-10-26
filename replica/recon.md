# Recon map: Ganbaru v2, a JLPT exam-practice web app

Scope: mock tests at the centre (full, mini, skill drills) with study tools around them: dictionary, grammar, word lists, mistake review.
For: JLPT candidates N5 to N1. A product to sell (free tier plus premium), so all question content is original.
Date: 2026-10-27 (replaces the 2026-10-26 map, which centred on SRS flashcards)

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Migii JLPT, App Store | https://apps.apple.com/us/app/id1463267540 | 4.5★ from 512 ratings; 100+ mock tests; full, mini and skill tests; online trial exam with leaderboard; roadmap; subscription |
| 2 | JLPT Test with AI Sensei, App Store | https://apps.apple.com/us/app/id1500859862 | Tests by part; untested / in progress / done status; resume; AI explanations; $3.99 / $7.99 |
| 3 | JLPT N1-N5 Exam Practice (Limen), App Store | https://apps.apple.com/us/app/id6748291478 | Official Workbook questions plus original sets; explanation and translation; bookmarks; ads |
| 4 | User's App Store screenshots | (in chat, 2026-10-27) | もんだい question screen with pill options and an Explanation block; Full / Mini / Skill tabs; test rows with time, pass score, best score |
| 5 | JLPT format and scoring research | reports/JLPT tests and study methods.md | Official sections, times, question types and counts, scoring |
| 6 | Nine study sites (first recon) | git history of this file | Dictionary, grammar and drill ideas |

## Core loop

Pick a level, take a timed mock or a short drill, see an honest score estimate per section, review mistakes with explanations, and drill the weakest question type.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Landing | `/` logged out | Explain and convert | Live sample question, sign-up CTA | default |
| S02 | Auth | `/login` | Magic link, Google | Email field | empty, sent, error |
| S03 | Onboarding | `/onboarding` | Target level, exam date | Stepper, belt picker | each step |
| S04 | Home | `/` logged in | One next action | Countdown, readiness per section, continue test, today's mini test | new user, mid-test, after mock |
| S05 | Test hub | `/test/[level]` | Choose what to take | Tabs Full / Mini / Skill; rows with status, best score, time, pass mark | untested, in progress, done |
| S06 | Test player | `/test/[level]/[testId]` | Answer questions | Section header + timer, question, 4 options, question bar, flag, bookmark, audio player | exam mode, practice mode, time up, resume |
| S07 | Results | `/test/[level]/[testId]/result` | Score estimate | Section scores vs minimum, pass estimate, type breakdown | pass, fail, section fail |
| S08 | Question review | from S07 or S10 | Learn from each question | Explanation, translation, furigana, report button | correct, wrong, unanswered |
| S09 | Mistake notebook | `/mistakes` | Spaced review of mistakes | Red-sheet study card | empty, due, all done |
| S10 | Bookmarks | `/bookmarks` | Saved questions | List | empty, filled |
| S11 | Dictionary | `/dictionary` | Look up words | Search, modes, tags | built |
| S12 | Word | `/dictionary/word/[id]` | | | built |
| S13 | Kanji | `/dictionary/kanji/[char]` | | | built |
| S14 | Grammar list | `/grammar?level=` | Browse grammar points | Level filter, list | |
| S15 | Grammar point | `/grammar/[id]` | Learn one point | Pattern, formation, meaning, notes, examples, practice drill | |
| S16 | Word lists | `/words/[level]` | Learn vocab by level | List, flashcards | |
| S17 | Study roadmap | `/plan` | Daily plan to the exam date | Day list | |
| S18 | Settings | `/settings` | Level, date, theme | | |
| S19 | Licenses | `/about/licenses` | Credits | | |

## Flows

```
F01 Take a full mock test
    S05 -> S06 exam (ticket start, section timers) -> S07 -> S08
    happy path clicks: 3 to start
    edge: time runs out mid-section, tab closed mid-test (resume), listening can't play

F02 Quick practice
    S04 "Today's mini test" -> S06 practice -> S07

F03 Drill a weak question type
    S07 weakest type -> S05 skill drill -> S06 practice

F04 Resume an interrupted test
    S04 "Continue" -> S06 at the saved question and remaining time

F05 Review mistakes
    S09 red-sheet card (FSRS) -> S08 full question

F06 Learn a grammar point
    S14 -> S15 -> "Practice this point" -> S06 practice

F07 Report a problem
    S06 or S08 "Report a problem" -> reason -> saved
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Option button | practice, exam | idle, selected, correct, wrong, disabled | S06, S08 |
| Question bar | | current, answered, flagged, unanswered | S06 |
| Section timer | countdown | running, last 5 min, ended | S06 |
| Test row | full, mini, skill | untested, in progress, done (best score) | S05 |
| Score bar | per section | above minimum, below minimum | S07, S04 |
| Audio player | exam (once), practice (replay) | idle, playing, played | S06 |
| Explanation block | | | S06 practice, S08 |
| Belt, Stepper, Countdown, Tally, ExamTicket, UnitStatus, HoldToConfirm | existing design system | | various |

## Inferred data model

```
Question  id, level, type, stem, options[4], answer, explanation, translation, passageId?, audio?, source (data|ai), status (verified|reviewed), refs
          evidence: Limen question screen, Migii answer keys; confidence: design choice
Test      id, level, kind (full|mini|skill), sections[{title, minutes, questionIds}]
          evidence: Migii test rows (time, pass score); official blueprint
Attempt   user, test, mode (exam|practice), status, answers[{question, choice, flagged}], section_elapsed
          evidence: AI Sensei "keep state of test", status labels
Bookmark  user, question
Report    user, question, reason, note
Card      user, item (word or question), FSRS state
```

## Feature matrix

See `features.csv`. Must: 25, should: 10, could: 10, skip: 6.

## Out of scope (cannot or should not be cloned)

- Official Workbook questions: the JLPT Site Policy requires written permission for a paid product, and the listening audio is third-party content
- "Predicted exam" claims: the real test isn't disclosed, so the claim would mislead
- Certificates that resemble official JLPT results
- Their question banks, explanations, audio and illustrations

## Size

Screens 19, flows 7, entities 6. Hard parts: generating and checking hundreds of original questions per level (vocab, grammar, reading, listening), listening audio, timed exam mode with resume. Size: L.
