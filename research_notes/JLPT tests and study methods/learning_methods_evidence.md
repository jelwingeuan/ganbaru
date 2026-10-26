# Evidence-based methods for JLPT study, and realistic study hours per level

Notes for the Ganbaru JLPT web app (FSRS spaced repetition, typed recall, quizzes, mock tests, gamification). Compiled 26 Oct 2026.

**Evidence labels used throughout:**
- **[E]** evidence-based: peer-reviewed study, meta-analysis, or large open benchmark
- **[D]** official exam data or rules (jlpt.jp)
- **[P]** popular or practitioner advice, commercial claim, or self-report. Not experimentally tested.
- **[†]** a well-established paper cited from the literature with its DOI, but **not re-fetched in this session**. Web search and fetch hit the session quota after about 22 calls (it resets 01:40 MYT, 27 Oct 2026). The report writer should spot-check these before quoting exact numbers.

---

## Q1. What does learning science show about spaced repetition (FSRS vs SM-2), retrieval practice, interleaving, typed vs multiple-choice recall, mnemonics, and learning vocabulary in context?

### Takeaway
Spacing and retrieval practice are the two best-supported techniques. Dunlosky et al. rate both "high utility". Testing-effect meta-analyses find g ≈ 0.50–0.61, and the L2 spacing meta-analysis (Kim & Webb 2022) finds a medium-to-large effect. On about 350M Anki reviews, FSRS predicts recall far better than SM-2: FSRS-6 has lower log loss for 99.6% of users. However, no primary benchmark figure exists for "X% fewer reviews". Typed (productive) recall is best for spelling and production, while recognition is enough for form–meaning links. Interleaving helps learners tell similar categories apart but does not reliably help word-list learning. Evidence on kanji mnemonics consists of small, short-term studies.

### Cited Findings

**Spacing / distributed practice**
- [E] Cepeda, Vul, Rohrer, Wixted & Pashler (2008), *Psychological Science* 19(11):1095–1102. The study had more than 1,350 participants, study gaps of up to 3.5 months, and final tests up to 1 year later. Performance followed an inverted U: widening the gap first helped, then slowly hurt. The optimal gap grew in absolute terms as the test delay grew, but shrank as a proportion of it, from about **20–40% of a 1-week delay to about 5–10% of a 1-year delay**. An eScholarship abstract version phrases this as about 20% for delays of a few weeks, falling to about 5% at one year. — [PubMed](https://pubmed.ncbi.nlm.nih.gov/19076480/); [PDF](https://www.evullab.org/pdf/CepedaVulRohrerWixtedPashler-PS-2008.pdf); [eScholarship](https://escholarship.org/uc/item/0kp5q19x)
- [E][†] Cepeda et al. (2006) is a meta-analysis of distributed practice, with about 839 assessments from 317 experiments in 184 articles. Spaced practice beat massed practice, and the optimal inter-study interval increased with the retention interval. — [doi:10.1037/0033-2909.132.3.354](https://doi.org/10.1037/0033-2909.132.3.354)
- [E] Kim & Webb (2022), *Language Learning* 72(1):269–319, is a meta-analysis of spaced practice in **L2** learning. Spacing had a **medium-to-large** effect, drawing on 98 effect sizes from 48 experiments (N = 3,411), as reported in Kim's Western thesis. Shorter spacing matched longer spacing on immediate posttests but was weaker on **delayed** posttests. **Equal and expanding schedules performed about the same.** The study count is inconsistent across sources: another review describes it as covering 37 studies. — [Western thesis](https://ir.lib.uwo.ca/etd/8600/); [UB review](https://diposit.ub.edu/server/api/core/bitstreams/911f8da8-9666-4917-9411-c9ae6754cd7b/content)
- [E] In a 2018 critical review, Nakata concludes that gradually widening gaps (expanding spacing) do **not reliably** improve long-term L2 vocabulary retention, and none of the L2 vocabulary studies he examined found an expanding-spacing advantage. In non-L2 studies, the advantage appeared only under narrow conditions: high task difficulty, no feedback after retrieval, and a posttest within 24 hours. He also argues that Landauer & Bjork (1978), the usual citation for expanding spacing, has limitations for L2 vocabulary. — [Kansai Univ. repository](https://kansai-u.repo.nii.ac.jp/records/10256); [PDF](https://kansai-u.repo.nii.ac.jp/record/10256/files/KU-1100-20181000-02.pdf)
- [E] Nakata's flashcard dissertation (2013) found that a **large amount of spacing between encounters matters more than block (set) size**. Whether feedback was given immediately or after a set of words made little difference. A related study: Nakata & Webb (2016), "Does studying vocabulary in smaller sets increase learning?", *SSLA*. — [LINGUIST List abstract](https://linguistlist.org/issues/24/3797); [Cambridge SSLA](https://resolve-he.cambridge.org/core/journals/studies-in-second-language-acquisition/article/does-studying-vocabulary-in-smaller-sets-increase-learning/E17B75ABAE1300734AF014C363D59FBC)
- [E] Khoii & Fallah Abed compared equal (2-2-2), expanding (0-1-5) and massed schedules. Both spaced schedules beat massed practice, and **equal spacing performed best**. This is a small conference paper. — [ICT4LL paper](https://conference.pixel-online.net/files/ict4ll/ed0010/FP/0960-SLA2580-FP-ICT4LL10.pdf)
- [E][†] Dunlosky, Rawson, Marsh, Nathan & Willingham (2013), *Psychological Science in the Public Interest* 14(1), rated 10 techniques:
  - **High utility:** practice testing and distributed practice
  - **Moderate:** interleaved practice, elaborative interrogation, self-explanation
  - **Low:** keyword mnemonic, imagery for text, rereading, highlighting, summarization
  
  — [doi:10.1177/1529100612453266](https://doi.org/10.1177/1529100612453266)

**FSRS vs SM-2 (algorithm evidence)**
- [E/benchmark] The open-spaced-repetition **srs-benchmark** uses anki-revlogs-10k, about **727M reviews from 10,000 Anki users**. The evaluation without same-day reviews covered 9,999 collections and **349.9M reviews**. Its metrics are log loss and RMSE(bins), which measure calibration (lower is better), and AUC, which measures discrimination (higher is better). Mean results without same-day reviews:

  | Model | Log loss | RMSE(bins) | AUC |
  |---|---|---|---|
  | FSRS-7 | 0.3401 | 0.0634 | 0.7167 |
  | FSRS-6 | 0.3460 | 0.0653 | 0.7034 |
  | FSRS-5 | 0.3561 | 0.0742 | 0.7010 |
  | FSRS-4.5 | 0.3625 | 0.0764 | 0.6891 |
  | FSRS v4 | 0.3726 | 0.0838 | 0.6853 |
  | FSRS v3 | 0.4364 | 0.1097 | 0.6605 |
  | HLR (Duolingo's half-life regression) | 0.4694 | 0.1275 | 0.6369 |
  | AVG baseline | 0.3945 | 0.1034 | 0.4997 |
  | Ebisu v2 | 0.4989 | 0.1627 | 0.6051 |

  Same-day-review results are not comparable with these. — [srs-benchmark (GitHub)](https://github.com/open-spaced-repetition/srs-benchmark)
- [E/benchmark] **FSRS-6 has lower log loss than SM-2 for 99.6% of users.** Caveats from the same page:
  - SM-2 "wasn't designed to predict probabilities", so the benchmark adds an interval-to-probability converter.
  - The page states that "there is no way to have a truly fair, no caveats, comparison between FSRS and SM-2".
  - It gives **no** figure for how many fewer reviews FSRS needs for the same retention.
  
  — [Expertium benchmark write-up](https://expertium.github.io/Benchmark.html)
- [E/benchmark] Neural models (RWKV) beat FSRS on log loss and AUC: RWKV-Instant scores 0.2773 log loss and 0.8329 AUC. However, they can output unintuitive predictions, for example never predicting 100% recall. A deliberately degenerate model (RMSE-BINS-EXPLOIT) gets the "best" RMSE (0.0135) with a log loss of 4.6, which shows that RMSE alone can be gamed. — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)
- [E] FSRS's academic basis is two MaiMemo papers associated with core contributor Jarrett Ye: "A Stochastic Shortest Path Algorithm for Optimizing Spaced Repetition Scheduling" (ACM KDD 2022) and "Optimizing Spaced Repetition Schedule by Capturing the Dynamics of Memory" (IEEE TKDE 2023). FSRS is described as a community open-source project supported by MaiMemo. — [fsrs4anki wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) (the page now redirects to the awesome-fsrs wiki)
- [P] Third-party sites claim FSRS needs "15–40% fewer reviews", but the claim is **unsourced**. — [CertFuel](https://www.certfuel.com/sie/study-guides/anki-vs-fsrs-sie/)
- A Diane.app guide claims log loss of 0.354 for SM-2 vs 0.291 for FSRS-5. This **conflicts** with the primary benchmark table, which gives FSRS-5 a log loss of 0.3561, so do not use those numbers. — [Diane.app](https://www.diane.app/en/guides/fsrs-vs-sm2); contradicted by [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)

**Retrieval practice / testing effect**
- [E] Testing-effect meta-analyses report medium effects: Rowland (2014) g ≈ 0.50 and Adesope et al. (2017) g ≈ 0.61 across 272 effect sizes. **Feedback** is a reliable moderator: one secondary summary of Rowland gives g = 0.73 with feedback vs 0.39 without. The two meta-analyses **conflict on format**: Adesope found larger effects for multiple-choice (MC) than for short-answer, while Rowland found the reverse. Adesope's authors flag that their result conflicts with the effortful-retrieval account. — [Frontiers in Psychology 2018](https://frontiersin.org/articles/10.3389/fpsyg.2018.02412/full); [StudyCards summary (secondary)](https://studycardsai.com/blog/active-recall-statistics)
- [E] A primary classroom study found a short-answer testing effect in a university lecture and **no MC effect**. — [Frontiers in Psychology 2018](https://www.frontiersin.org/articles/10.3389/fpsyg.2018.02412/pdf)
- [E][†] Roediger & Karpicke (2006), *Psychological Science* 17(3), used prose passages. On a test 5 minutes later, restudying won. One week later, repeated testing won, with about 61% recall for STTT (one study period, three tests) vs about 40% for SSSS (four study periods). — [doi:10.1111/j.1467-9280.2006.01693.x](https://doi.org/10.1111/j.1467-9280.2006.01693.x)
- [E][†] Karpicke & Roediger (2008), *Science* 319:966–968, used Swahili–English word pairs. Items that kept being **tested** after first recall reached about 80% recall at one week, vs about 35% when they were dropped from testing. Continued restudy added little. — [doi:10.1126/science.1152408](https://doi.org/10.1126/science.1152408)
- [E][†] Pyc & Rawson (2009) proposed the "retrieval effort hypothesis": retrievals that are harder but still successful produce better retention. — [doi:10.1016/j.jml.2009.01.004](https://doi.org/10.1016/j.jml.2009.01.004)

**Typed (productive) vs multiple-choice (recognition) recall**
- [E] Nakata (2016), *IRAL*, tested 64 students on 60 Swahili–English pairs. He crosses recognition vs recall with receptive vs productive retrieval. **Recall formats beat recognition for productive knowledge of orthography (spelling)**, while **recognition is preferable when spelling is not required**, because recall can lower in-session performance. The materials were artificial pairs and the sample was small. — [De Gruyter](https://www.degruyterbrill.com/document/doi/10.1515/iral-2015-0022/html?lang=en); [Nakata dissertation abstract](https://linguistlist.org/issues/24/3797)
- [E][†] Kang, McDermott & Roediger (2007), *European Journal of Cognitive Psychology* 19(4–5), found that **with feedback, short-answer quizzes beat MC** on final tests. **Without feedback, MC did as well or better**, because initial short-answer success was low. — [doi:10.1080/09541440601056620](https://doi.org/10.1080/09541440601056620)
- [E][†] Roediger & Marsh (2005) found that MC tests give a positive testing effect but can also **implant lures as false knowledge**. More alternatives produced more lure intrusions on later tests. — [doi:10.1037/0278-7393.31.5.1155](https://doi.org/10.1037/0278-7393.31.5.1155)

**Interleaving**
- [E] Brunmair & Richter (2019), "Similarity matters", *Psychological Bulletin*, is a multilevel meta-analysis of 59 studies, 238 effect sizes and 158 samples. It found an overall **g = 0.42**. The effect was strongest for visual materials such as paintings (**g = 0.67**), and small but significant for mathematical tasks. The title reflects the central moderator: interleaving helps most when the categories are similar and must be told apart. — [Würzburg PDF](https://www.psychologie.uni-wuerzburg.de/fileadmin/06020400/2019/Brunmair_Richter_in_press__2019_META-ANALYSIS_OF_INTERLEAVED_LEARNING.pdf); [X-MOL record](https://www.x-mol.com/paper/1213055298318831616); [Frontiers corrigendum noting the earlier conference version](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6813467/)
- [E][†] From memory of the same meta-analysis, **not verified this session**: interleaving was **not beneficial, possibly harmful, for words** (g ≈ −0.39) and showed no benefit for expository texts. The fetch of the PDF timed out, so verify this before quoting. — [doi:10.1037/bul0000209](https://doi.org/10.1037/bul0000209)
- [E][†] Rohrer & Taylor (2007), in a mathematics study, found that interleaved practice outperformed blocked practice on a delayed test (about 63% vs 20%). — [doi:10.1007/s11251-007-9015-8](https://doi.org/10.1007/s11251-007-9015-8)

**Mnemonics for kanji (keyword / component / Heisig-style)**
- [E, weak] Two small controlled studies come from Indonesia. In the first, the method of loci with 36 high-school students (18 control, 18 experimental) gave a significant gain in recall of basic kanji (t = 2.94). In the second, "mnemonic + happyou" with 34 university students per group raised the post-test mean to 89, vs 71 for the control group (pre-tests 79 vs 77.5). Both studies are short-term, and the second is a conference paper. — [UPI IJAL](https://ejournal.upi.edu/index.php/IJAL/article/download/15256/8830); [EUDL (EAI conference)](https://eudl.eu/doi/10.4108/eai.5-8-2019.2289811)
- [E] According to a search summary (full text not fetched), the keyword method is generally effective in lab studies, but results are **inconclusive for classroom use, older or experienced learners, and long-term retention**. — [e-FLT (NUS) 2006](https://e-flt.nus.edu.sg/?p=2012)
- [P] There is **no head-to-head RCT at scale of *Remembering the Kanji* (Heisig) against conventional instruction**. The often-quoted Atkinson & Raugh result (about 72% vs 46%) came from **Russian** vocabulary, not kanji. This point comes from a commercial blog. — [Mojimori blog](https://mojimori.app/blog/science-of-efficient-kanji-learning-strategies/download)
- [E][†] Dunlosky et al. (2013) rate the keyword mnemonic as **low utility**: it works best for short-term learning of concrete, keyword-friendly items, and its benefits may fade at longer delays. — [doi:10.1177/1529100612453266](https://doi.org/10.1177/1529100612453266)

**Vocabulary in context / example sentences**
- [E][†] Prince (1996), *Modern Language Journal* 80(4), found that learning with L1 translations produced more words recalled than learning from context. Context learning transferred better to use in new sentences, but mainly for more proficient learners. — [doi:10.1111/j.1540-4781.1996.tb05468.x](https://doi.org/10.1111/j.1540-4781.1996.tb05468.x)
- [E][†] Webb (2007), *Language Teaching Research* 11(1), found that adding **one glossed example sentence** to word-pair learning gave little measurable gain across knowledge aspects. A single context is weak; multiple encounters matter more. — [doi:10.1177/1362168806072463](https://doi.org/10.1177/1362168806072463)
- [E][†] Elgort (2011), *Language Learning* 61(2), found that deliberate flashcard-style learning of L2 pseudowords produced form and semantic priming, i.e. **lexicalised, quasi-automatic representations**. Decontextualised deliberate learning therefore does build "real" lexical knowledge. — [doi:10.1111/j.1467-9922.2010.00613.x](https://doi.org/10.1111/j.1467-9922.2010.00613.x)

### Inferences
These are design inferences for the app, drawn from the findings above.
- **Scheduler.** FSRS is the right default. Its advantage is better *prediction* of recall, which lets the app hit a target retention with less over- or under-reviewing. Do not advertise a specific "% fewer reviews" figure, because the primary benchmark does not provide one. Expanding vs equal spacing barely matters for L2 vocabulary (Nakata 2018; Kim & Webb 2022), so the **amount** of spacing and the timing of each review relative to forgetting are what count. That supports a model-based scheduler over hand-tuned interval ladders.
- **Do not retire items after one correct answer.** Karpicke & Roediger (2008) show that continued retrieval of known items is what drives long-term retention. Keep "mastered" kanji and words in the FSRS queue at long intervals rather than deleting them.
- **Typed recall vs MC.**
  - Use MC for the first exposure, for meaning recognition, and for JLPT-format familiarity, since the JLPT itself is MC.
  - Graduate items to **typed recall** for readings (kana input) and for production. Productive recall is what builds orthographic and reading knowledge (Nakata 2016), and harder successful retrieval yields more retention (Pyc & Rawson 2009).
  - Always show **corrective feedback** after MC, so lures do not become false memories (Roediger & Marsh 2005). Feedback also makes short-answer formats pay off (Kang et al. 2007).
- **Interleaving where discrimination is the skill.** Mix look-alike kanji (e.g. 待/持/特), near-synonym words, confusable grammar points (e.g. は/が, に/で, ～ように/～ために) and listening question types in quizzes. Do not expect interleaving to speed up raw vocabulary-list learning.
- **Mnemonics.** Offer component-based (radical/keyword) hints as an optional encoding aid at first exposure. The evidence suggests they help initial meaning learning but are not a substitute for spaced retrieval. Label them "aid", not "method".
- **Context.** Flashcards with translations are efficient for form–meaning links (Prince 1996; Elgort 2011). Example sentences add value mainly as *multiple, varied* encounters and for usage and collocation (Webb 2007), not as one static sentence. Rotate several example sentences per word, and use sentence-level cloze for grammar points.

### Gaps
- The exact Brunmair & Richter (2019) effect sizes for words and expository texts could not be verified (the PDF fetch timed out).
- Forum posts relay further FSRS-vs-SM-2 "win rates": FSRS-5 vs Anki-SM-2 at 89.9% of users with default parameters, 98.1% with optimized parameters, and 77.0% for default FSRS vs optimized SM-2. These are **not** verified against the primary benchmark images.
- I found no primary, published estimate of the review-count savings of FSRS over SM-2 at equal retention. The MaiMemo KDD 2022 paper's reported cost reductions could not be retrieved.
- FSRS-6 internals (21 parameters, a trainable power-law decay, default desired retention of 0.90) are from prior knowledge and were not re-verified. The awesome-fsrs wiki page "The-Algorithm" is the place to confirm them.
- I found no controlled study comparing **typed kana input vs MC specifically for Japanese readings**. The Nakata evidence uses Swahili–English pairs.
- I found no large or long-term controlled study of component-based kanji mnemonics (e.g. WaniKani or Heisig style) vs rote or standard study.

---

## Q2. How many study hours does each level N5–N1 take, for learners with and without kanji knowledge?

### Takeaway
The only widely reproduced structured data is a "Japanese Language Education Center" table (2010–2015), which gives **cumulative** hours from zero:
- **N5:** 325–600 hours without kanji knowledge, 250–450 with it
- **N1:** 3,000–4,800 hours without kanji knowledge, 1,700–2,600 with it

Kanji-background learners (Chinese, and per the source Korean) need roughly 55–77% of the hours, and the advantage widens at higher levels. JEES / Japan Foundation publish **no** official hour estimates. The methodology behind the table (classroom vs self-study hours, sample) is undocumented, so treat it as order-of-magnitude.

### Cited Findings
- [D?/P] "JLPT Study Hour Comparison Data 2010–2015", attributed to the Japanese Language Education Center (retrieved by Wikibooks 2021-11-18). Hours are **cumulative**:

  | Level | With kanji knowledge (e.g. Chinese/Korean speakers) | Without kanji knowledge |
  |---|---|---|
  | N5 | 250–450 h | 325–600 h |
  | N4 | 400–700 h | 575–1,000 h |
  | N3 | 700–1,100 h | 950–1,700 h |
  | N2 | 1,150–1,800 h | 1,600–2,800 h |
  | N1 | 1,700–2,600 h | 3,000–4,800 h |

  — [Wikibooks JLPT Guide](https://en.wikibooks.org/wiki/JLPT_Guide/About_JLPT); same table on [Japanese Language Wiki (Fandom)](https://japanese.fandom.com/wiki/JLPT)
- [P] Coto Academy, a commercial school, gives similar but differently rounded figures, e.g. 350 h for N5, or 400–500 h without kanji knowledge. It says Chinese and Korean speakers need fewer hours because of shared kanji or grammar. — [Coto Academy](https://cotoacademy.com/study-hours-needed-pass-jlpt-comparison-levels/)
- [P] Other commercial guides (Migaku, Japonin) give **higher** ranges, e.g. about 1,000–1,700 h for N3, which is less consistent with the JLEC table. — [Migaku](https://migaku.com/blog/japanese/jlpt-study-schedule-guide); [Japonin](https://japonin.com/articles/jlpt-levels-and-estimated-study-time/)
- [D] The official JLPT FAQ gives **no recommended study hours**. — [jlpt.jp FAQ](https://www.jlpt.jp/e/faq/)
- [D][†] The US Foreign Service Institute lists Japanese as a Category IV ("super-hard") language for native English speakers, at about 88 weeks / 2,200 class hours to reach professional working proficiency. That target is a different scale (ILR), not JLPT. — [US State Dept FSI](https://www.state.gov/foreign-language-training/)

### Inferences
- **Kanji-background ratio**, computed from the JLEC table (with-kanji hours ÷ without-kanji hours):

  | Level | Low end | High end |
  |---|---|---|
  | N5 | 0.77 | 0.75 |
  | N4 | 0.70 | 0.70 |
  | N3 | 0.74 | 0.65 |
  | N2 | 0.72 | 0.64 |
  | N1 | 0.57 | 0.54 |

  The kanji advantage grows with level, consistent with N2–N1 being kanji- and vocabulary-heavy.
- **Incremental hours** between levels (non-kanji learners, range midpoints):

  | Step | Hours |
  |---|---|
  | 0→N5 | ~460 |
  | N5→N4 | ~325 |
  | N4→N3 | ~540 |
  | N3→N2 | ~875 |
  | N2→N1 | ~1,700 |

  The N2→N1 step costs about as much as everything up to N3. An app's "time-to-level" estimates should be strongly non-linear.
- **Calendar time** at 1 h/day: about 11–20 months to N5 and 8–13 years to N1 for non-kanji learners. N5 looks high compared with common learner reports of passing N5 after a few months. That suggests the table reflects broader proficiency (or classroom-hour accounting) rather than minimal test-pass preparation. Present ranges with an explicit uncertainty note, not point estimates.
- The FSI figure of 2,200 class hours for professional proficiency sits between the JLEC N2 and N1 ranges for non-kanji learners, which is loosely consistent.
- For the app, let users declare a kanji background (Chinese/Korean/none) and adjust forecasts. Calibrate per user from real FSRS review logs over time instead of relying on static tables.

### Gaps
- The identity and methodology of the "Japanese Language Education Center" (sample size, school vs self-study, how "hours" were counted, pass vs attempt) could not be verified. The original page was not fetched.
- I found no JEES / Japan Foundation survey linking self-reported study hours to pass rates. JLPT summary reports may contain examinee questionnaires, but these were not retrievable this session.
- I found no figures specific to Korean speakers vs Chinese speakers. The table lumps them together, though Korean speakers' kanji knowledge varies widely.

---

## Q3. How many words, kanji and grammar points are commonly cited per level?

### Takeaway
There have been **no official lists since the 2010 revision**. Commonly cited figures are estimates extrapolated from the pre-2010 (4-level) Test Content Specifications:
- N5 ≈ 100 kanji / 800 words
- N4 ≈ 300 / 1,500
- N3 ≈ 650 / 3,750
- N2 ≈ 1,000 / 6,000
- N1 ≈ 2,000 / 10,000

Grammar-point counts vary widely between textbooks and lists.

### Cited Findings
- [D] The JLPT FAQ states that "publishing a list of vocabulary, kanji and grammar items was not necessarily appropriate". Official lists were dropped with the 2010 revision. They were replaced by the "Summary of Linguistic Competence Required for Each Level", "Composition of test items" and sample questions. Two Official Practice Workbooks (2012, and Vol. 2 in 2018) contain questions drawn from tests since 2010. — [jlpt.jp FAQ](https://www.jlpt.jp/e/faq/)
- [D] The **2004 Test Content Specification** (old levels) gives exact counts of about 1,023 kanji and 5,035 words for Level 2, and about 103 kanji and 728 words for Level 4. — [Tanos (via search summary)](https://www.tanos.co.uk/jlpt/aboutjlpt)
- [P] Estimates for the new levels, "estimated from released JEES documentation", include **N1 ≈ 2,000 kanji / 10,000 words** and **N3 ≈ 650 kanji / 3,750 words**. N3 is the least reliable because it has no old-level equivalent. The old Level 2 list's 739 additional kanji have no clean split between N3 and N2. — [Tanos (via search summary)](https://www.tanos.co.uk/jlpt/aboutjlpt); [Tanos N3](https://www.tanos.co.uk/jlpt/jlpt3)
- [P] The new N1 roughly maps to old Level 1, and N4/N5 to old Levels 3/4. N2 and N3 have to be interpolated. — [Tanos (via search summary)](https://www.tanos.co.uk/jlpt/aboutjlpt)
- [P] NAT-TEST, a separate exam that claims JLPT equivalence, lists its Level 1 at about **1,850 kanji / 10,000 words**. — [NAT-TEST comparison](https://www.nat-test.jp/en/comparison.html)

### Inferences
- A commonly circulated full table is N5 ~100/800, N4 ~300/1,500, N3 ~650/3,750, N2 ~1,000/6,000, N1 ~2,000/10,000 (kanji/words). It is consistent with the cited N1, N3, old Level 2 and old Level 4 figures. Treat it as a planning target, not a syllabus.
- The app's level decks should state that they are **community-derived**, e.g. from Tanos or JLPT Sensei lists built on the old specs. Expect test content outside any list, especially at N2–N1. Coverage targets such as "know 90% of list X" are proxies.
- The jump from N3 (~3,750 words) to N1 (~10,000) implies about 6,000+ new words. At 10–20 new cards per day under FSRS, that is roughly 1–2 years of daily new-card intake for vocabulary alone. This is consistent with the large N2→N1 hour gap in Q2.

### Gaps
- The exact old Level 1 and Level 3 counts from the 2004 specification could not be fetched (the Tanos site was unreachable).
- I found no reliable consensus on **grammar-point counts** per level; textbook and list counts vary widely. I could not source specific numbers this session.
- I found no research validating that list coverage predicts JLPT pass probability.

---

## Q4. What strategies work for each JLPT section, and what common mistakes or failure reasons are reported?

### Takeaway
The official structure makes **sectional minimums** the key failure mode: a strong overall score still fails if any one section is below its minimum. For N1–N3 the minimum is 19/60 in each of the three sections. For N4–N5 it is 38/120 in the combined language knowledge and reading section and 19/60 in listening. Experimentally tested evidence for JLPT-specific test-taking strategies is essentially absent. Most section-strategy advice is practitioner lore, though the evidence from Q1 (practice testing, spacing, interleaving) supports regular timed mock tests.

### Cited Findings
- [D] **Pass rules.** Candidates must sit all sections, reach the overall pass mark, **and** clear every sectional pass mark.

  | Level | Overall pass mark (out of 180) | Sectional pass marks |
  |---|---|---|
  | N1 | 100 | Language Knowledge 19/60, Reading 19/60, Listening 19/60 |
  | N2 | 90 | Language Knowledge 19/60, Reading 19/60, Listening 19/60 |
  | N3 | 95 | Language Knowledge 19/60, Reading 19/60, Listening 19/60 |
  | N4 | 90 | Language Knowledge + Reading 38/120, Listening 19/60 |
  | N5 | 80 | Language Knowledge + Reading 38/120, Listening 19/60 |

  — [jlpt.jp FAQ](https://www.jlpt.jp/e/faq/)
- [D] **Format.** The test uses multiple-choice, computer-scored answer sheets. Most questions have four choices; some listening questions have three. Scores are **scaled with Item Response Theory**, not raw totals. — [jlpt.jp FAQ](https://www.jlpt.jp/e/faq/)
- [D] **Section structure.** N1 and N2 combine "Language Knowledge (Vocabulary/Grammar)・Reading" into one timed section. N3–N5 split vocabulary into its own section, because at those levels the items could "inadvertently provide hints for answers". Since December 2020 the N4/N5 vocabulary and grammar/reading sections have fewer questions, and since December 2022 so does N1 listening, "no change in the difficulty". — [jlpt.jp FAQ](https://www.jlpt.jp/e/faq/)
- [D] **Test dates in 2026** were 5 July and 6 December in Japan. Some overseas cities hold the test only once a year. — [jlpt.jp FAQ](https://www.jlpt.jp/e/faq/)
- [D] The **JLPT Can-do Self-Evaluation List** describes what successful examinees *think* they can do, based on self-evaluation. It is explicitly **not** a level standard. — [jlpt.jp FAQ](https://www.jlpt.jp/e/faq/)
- [E][†] Supporting evidence from Q1 for mock-test features:
  - **Practice testing** with feedback is a high-utility technique (Dunlosky et al. 2013; testing-effect g ≈ 0.5–0.6).
  - **Interleaving** helps discrimination between similar categories, which applies to confusable grammar items and mixed question types.
  
  — [doi:10.1177/1529100612453266](https://doi.org/10.1177/1529100612453266); [Frontiers 2018](https://frontiersin.org/articles/10.3389/fpsyg.2018.02412/full)

### Inferences
- **Sectional-minimum risk.**
  - Learners who rely on kanji recognition (often Chinese-background learners) can pass vocabulary and reading comfortably yet fail **listening**, because kanji knowledge gives no help there. This is an inference from the scoring rules plus the kanji-advantage pattern in Q2. The app should report a **per-section predicted score vs the 19/60 line**, not just a total.
  - For N1/N2, time spent on vocabulary and grammar items comes out of reading time, since they share one section. Mock tests should replicate the combined timer and show a pace marker (e.g. "you should be starting reading by mm:ss").
- **Guessing.** Answer sheets are MC and the FAQ mentions no penalty for wrong answers, so leaving items blank cannot help. Advice to always answer is reasonable, but it is [P]: the FAQ does not state scoring details beyond IRT scaling.
- **Mock tests.** These should be timed, use official section groupings and per-section timing, give item-level corrective feedback afterward (feedback raises testing-effect size), and resurface missed items into the FSRS queue.
- **Listening practice.** This should be single-play, since the test does not replay audio, with no transcript until after answering. It should mix question types (task-based, point comprehension, quick response, integrated comprehension), following the interleaving rationale. This is [P]-level design advice.
- **Commonly repeated practitioner advice** that I could not source this session, so it should be treated as [P]:
  - Read questions before the passage.
  - Don't get stuck on one item; skip and return.
  - Transfer answers to the sheet as you go.
  - Pre-read listening answer choices during the instructions.
  - In quick-response listening (即時応答), choose immediately and move on.
  - Drill grammar with full sentences and the "sentence-ordering ★" format.
  - Common failure reasons: running out of time in reading; neglecting listening; over-relying on word lists without reading practice; studying only with apps and never doing timed full mocks.

### Gaps
- Searches for teacher and learner sources on section strategies and failure reasons (Tofugu, Japan Foundation teaching materials, NHK, university programs) could not be completed because of the session quota. No section-strategy claim above beyond the official rules is sourced.
- I found no peer-reviewed study of JLPT-specific test-taking strategies or of the reasons candidates fail.
- **Pass rates** by level and year (published on jlpt.jp "Data") were not retrieved.
- Official section times per level ("Test Sections and Test Times" page) were not retrieved.

---

## Q5. What does research say about gamification (streaks, XP, badges) and its effect on retention and long-term learning?

### Takeaway
Meta-analytic evidence shows **small-to-moderate positive** effects of gamification. In Sailer & Homner (2020) the effects were g = 0.49 on cognitive outcomes, g = 0.36 on motivation and g = 0.25 on behaviour, and only the cognitive effect was robust in high-rigor studies. Specific mechanics can backfire:
- Mandatory badges and leaderboards lowered intrinsic motivation and satisfaction in a 16-week class (Hanus & Fox 2015).
- **Broken streaks reduce future engagement**, even when the break was not the person's fault. Allowing a streak to be "repaired" softens this (Silverman & Barasch 2023).

Duolingo's own efficacy studies show reading and listening gains but are company-authored and face selection-bias critiques.

### Cited Findings
- [E] Sailer & Homner (2020), "The Gamification of Learning: a Meta-analysis", *Educational Psychology Review* 32(1):77–112, used random-effects models:

  | Outcome | g | k (studies) | N |
  |---|---|---|---|
  | Cognitive | 0.49 | 19 | 1,686 |
  | Motivational | 0.36 | 16 | 2,246 |
  | Behavioral | 0.25 | 9 | 951 |

  The **cognitive effect was stable** in a high-rigor subsplit; **motivational and behavioral effects were less stable**. Effects were heterogeneous, and moderators included game fiction and social interaction. — [Springer](https://link.springer.com/article/10.1007/s10648-019-09498-w); [Augsburg OPUS](https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/index/index/docId/109056)
- [E] A 2026 meta-analysis of higher-education gamification (22 studies) reports a large pooled effect (d = 1.12) with very high heterogeneity. It is not a replication of Sailer & Homner, and the large effect plus heterogeneity suggest publication or design bias. — [SAGE Open 2026](https://journals.sagepub.com/doi/10.1177/21582440261421375)
- [E] Hanus & Fox (2015), *Computers & Education* 80:152–161, ran a 16-week longitudinal study comparing a course with **mandatory badges and a leaderboard** to an otherwise identical non-gamified course. The gamified group reported **lower intrinsic motivation and satisfaction**. The authors point to social comparison and reduced autonomy. Reviews report **lower final-exam grades** for the gamified group, but the exact figures were not verified. — [UCLA SMHP review PDF](https://www.smhp.psych.ucla.edu/pdfdocs/gamil.pdf); [Critical review table, *IJETHE*](https://educationaltechnologyjournal.springeropen.com/articles/10.1186/s41239-017-0042-5/tables/13)
- [E] In other online courses, badges and leaderboards did **not** affect academic performance, so effects depend on context. — [Arizona ITET](https://journals.uair.arizona.edu/index.php/itet/article/download/18661/18409)
- [E] Silverman & Barasch (2023), "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", *Journal of Consumer Research* (doi 10.1093/jcr/ucac029), ran seven studies:
  - A **broken streak makes people less likely to continue the behavior**, even when the break was caused externally.
  - Making streaks salient helps people keep intact streaks but **magnifies the harm when a streak breaks**.
  - The harm is **amplified when people blame themselves**, **reduced when the streak can be "repaired"**, and **persists regardless of streak length**.
  
  — [UDel UDaily](https://udel.edu/udaily/2024/march/power-of-streaks-motivation-jackie-silverman); [UDSpace](https://udspace.udel.edu/items/42ce576b-8e1f-429a-8541-e29e48dbcfbb/full); [Psychology Today](https://www.psychologytoday.com/us/blog/ulterior-motives/202306/how-broken-streaks-sap-motivation)
- [E, company-authored] Jiang et al. (2021), *Foreign Language Annals* (an ACTFL journal), studied 225 US learners with little or no prior proficiency who used only Duolingo. Learners who **completed 5 units** of Spanish or French reached Intermediate Low in reading and Novice High in listening, comparable to 4 university semesters. Duolingo claims this took less than half the time. Other skills were **not assessed**. — [Duolingo IR press release](https://investors.duolingo.com/news-releases/news-release-details/leading-language-research-journal-publishes-study-showing); [NAU Experts record](https://experts.nau.edu/en/publications/evaluating-the-reading-and-listening-outcomes-of-beginning-level-/)
- [E] **Critique:** an independent paper notes that Duolingo's efficacy studies were largely written by Duolingo employees, and identifies **selection bias** (only completers were analysed) and validity problems. — [CALL-EJ](https://callej.org/index.php/journal/article/download/419/347/1013)
- [E, company-affiliated] A 2024 study of 48 independent Spanish learners found significant gains in all receptive and productive measures after about 27 hours. — [Avant Assessment PDF](https://rebrand.avantassessment.com/wp-content/uploads/The-effectiveness-of-Duolingo-in-developing-receptive-and-productive-language-knowledge-and-proficiency.pdf)
- [P/weak E] In a small Duolingo user study (18 questionnaire respondents, 5 interviews), the **streak** was rated the most useful feature for vocabulary retention, because it drives daily repeated exposure. **Competitive features caused pressure or anxiety** for some users. — [UKWMS repository](https://repositori.ukwms.ac.id/id/eprint/47113/)
- [P] Duolingo's streak experiments (e.g. streak app icons, "Perfect Streak Week") are described only by a third-party blogger, and only in terms of their aims. No learning outcomes are reported. — [Lazyweb](https://lazyweb.com/research/duolingo-retention-experiments)
- [E][†] Deci, Koestner & Ryan (1999), a meta-analysis of 128 studies, found that **expected, tangible, performance-contingent rewards undermine free-choice intrinsic motivation**, while positive verbal feedback tends to enhance it. — [doi:10.1037/0033-2909.125.6.627](https://doi.org/10.1037/0033-2909.125.6.627)
- [E] Duolingo's own half-life regression (HLR) model underperforms FSRS on the srs-benchmark: log loss 0.4694 vs 0.3460, and AUC 0.6369 vs 0.7034. Gamified platforms' scheduling is not necessarily state of the art. — [srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)

### Inferences
- **Engagement is not learning.** Gamification reliably moves engagement and motivation somewhat, and the robust cognitive effect is moderate. Its job in the app is to get users to show up for **due FSRS reviews** and **retrieval-heavy** activities. It should not reward volume of easy activity.
- **XP design.**
  - Award XP for *completed due reviews* and *successful effortful recalls* (typed recall above MC), echoing the retrieval effort hypothesis.
  - Do not award XP for re-reading or for pumping through new cards. That would inflate the backlog and undermine FSRS's desired-retention target.
  - Cap or taper XP for new cards per day.
- **Streaks.**
  - Use streaks, which give strong motivation for intact runs, but build in **streak repair or freeze** and avoid self-blaming copy when a streak breaks. Both follow from Silverman & Barasch.
  - Consider defining a "streak day" as clearing due reviews, or doing a minimum of N reviews, so the streak aligns with spacing rather than with opening the app.
- **Leaderboards and badges.** Make them **optional**, not mandatory, and favor badges for mastery milestones (e.g. "all N4 kanji at >90% retrievability"). Avoid forced social comparison, which is linked to lower intrinsic motivation (Hanus & Fox 2015) and anxiety (Duolingo user study).
- **Feedback over rewards.** Informational feedback (retention stats, forecast "days to N3", per-section mock scores against the 19/60 line) is more motivation-safe than tangible contingent rewards (Deci et al. 1999).

### Gaps
- I found no large controlled study that isolates the effect of **streaks** specifically on **language-learning retention**. Silverman & Barasch measure behaviour continuation, not learning.
- Exact final-exam effect sizes in Hanus & Fox (2015) were not verified.
- Duolingo has published no peer-reviewed RCT comparing gamified with non-gamified versions of the same course on learning outcomes. Its A/B results are proprietary.
- I found no studies of gamification specifically in Japanese/JLPT or kanji apps (e.g. WaniKani levels, Bunpro streaks).
