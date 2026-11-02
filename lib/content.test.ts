import assert from "node:assert/strict";
import { test } from "node:test";
import { BLUEPRINTS } from "../content/blueprints.ts";
import { questionById, tests } from "./content.ts";

test("every mock test uses each question once, in a section that holds its type", () => {
  assert.ok(tests.length > 0);
  for (const t of tests) {
    const ids = t.sections.flatMap((s) => s.questionIds);
    assert.equal(new Set(ids).size, ids.length, `${t.id} repeats a question`);
    for (const s of t.sections) {
      const section = BLUEPRINTS[t.level].sections.find((b) => b.id === s.id);
      assert.ok(section, `${t.id} has an unknown section ${s.id}`);
      const types = new Set(section.parts.map((p) => p.type));
      for (const id of s.questionIds) {
        const q = questionById.get(id);
        assert.ok(q, `${t.id} points at missing question ${id}`);
        assert.ok(types.has(q.type), `${t.id} puts ${q.type} question ${id} in ${s.id}`);
      }
    }
  }
});
