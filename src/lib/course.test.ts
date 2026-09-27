import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  gradeAnswers,
  isLessonOpen,
  isModuleUnlocked,
  isQuizOpen,
  nextStep,
  type ProgressRecord,
} from "./course";
import { modules } from "./content";

const done = (moduleId: number, lessonId: string): ProgressRecord => ({
  moduleId,
  lessonId,
  completed: true,
  quizScore: null,
});

describe("module unlock", () => {
  it("opens module 1 with an empty record", () => {
    assert.equal(isModuleUnlocked(1, []), true);
    assert.equal(isModuleUnlocked(2, []), false);
  });

  it("opens the next module only after 70%", () => {
    const almost: ProgressRecord[] = [
      { moduleId: 1, lessonId: "", completed: false, quizScore: 0.5 },
    ];
    const passed: ProgressRecord[] = [
      { moduleId: 1, lessonId: "", completed: true, quizScore: 0.75 },
    ];
    assert.equal(isModuleUnlocked(2, almost), false);
    assert.equal(isModuleUnlocked(2, passed), true);
    assert.equal(isModuleUnlocked(3, passed), false);
  });
});

describe("lesson and quiz gates", () => {
  it("requires the previous lesson inside an open module", () => {
    assert.equal(isLessonOpen("m1-l1", []), true);
    assert.equal(isLessonOpen("m1-l2", []), false);
    assert.equal(isLessonOpen("m1-l2", [done(1, "m1-l1")]), true);
    assert.equal(isQuizOpen(1, [done(1, "m1-l1"), done(1, "m1-l2")]), false);
    assert.equal(
      isQuizOpen(1, [done(1, "m1-l1"), done(1, "m1-l2"), done(1, "m1-l3")]),
      true,
    );
  });

  it("keeps module 2 closed until module 1 is passed", () => {
    const lessons = [done(2, "m2-l1")];
    assert.equal(isLessonOpen("m2-l1", lessons), false);
  });
});

describe("gradeAnswers", () => {
  it("passes at 3 of 4 and fails at 2 of 4", () => {
    const pass = gradeAnswers(1, { m1q1: "b", m1q2: "c", m1q3: "b", m1q4: "a" });
    assert.ok(pass);
    assert.equal(pass?.correctCount, 3);
    assert.equal(pass?.passed, true);
    assert.ok((pass?.score ?? 0) >= 0.7);

    const fail = gradeAnswers(1, { m1q1: "b", m1q2: "c", m1q3: "a", m1q4: "a" });
    assert.equal(fail?.correctCount, 2);
    assert.equal(fail?.passed, false);
  });

  it("grades the R calculation in module 2", () => {
    const result = gradeAnswers(2, {
      m2q1: "b",
      m2q2: "b",
      m2q3: "b",
      m2q4: "b",
    });
    assert.equal(result?.correctCount, 4);
    assert.equal(result?.passed, true);
  });

  it("grades expectancy, recovery, and position size", () => {
    const expectancy = gradeAnswers(3, { m3q1: "b", m3q2: "c", m3q3: "b", m3q4: "b" });
    assert.equal(expectancy?.correctCount, 4);
    assert.equal(expectancy?.passed, true);

    const recovery = gradeAnswers(4, { m4q1: "b", m4q2: "c", m4q3: "b", m4q4: "b" });
    assert.equal(recovery?.correctCount, 4);

    const size = gradeAnswers(5, { m5q1: "b", m5q2: "b", m5q3: "b", m5q4: "b" });
    assert.equal(size?.correctCount, 4);

    const lab = gradeAnswers(6, { m6q1: "b", m6q2: "b", m6q3: "b", m6q4: "b" });
    assert.equal(lab?.passed, true);

    const journal = gradeAnswers(7, { m7q1: "b", m7q2: "b", m7q3: "b", m7q4: "a" });
    assert.equal(journal?.correctCount, 3);
    assert.equal(journal?.passed, true);
  });
});

describe("modules 3–7", () => {
  it("ships ready lessons and a quiz on every module", () => {
    assert.equal(modules.length, 7);
    for (const mod of modules) {
      assert.ok(mod.lessons.length >= 2 && mod.lessons.length <= 3);
      assert.ok(mod.lessons.every((lesson) => lesson.status === "ready" && lesson.paragraphs.length >= 2));
      assert.ok(mod.quiz && mod.quiz.length >= 3 && mod.quiz.length <= 5);
      for (const question of mod.quiz ?? []) {
        const correct = question.options.filter((option) => option.correct);
        assert.equal(correct.length, 1);
      }
    }
  });

  it("unlocks the next module only after the previous quiz", () => {
    const records: ProgressRecord[] = [];
    for (let moduleId = 1; moduleId <= 6; moduleId++) {
      assert.equal(isModuleUnlocked(moduleId + 1, records), false);
      records.push({ moduleId, lessonId: "", completed: true, quizScore: 0.75 });
      assert.equal(isModuleUnlocked(moduleId + 1, records), true);
    }
  });

  it("opens the module 3 quiz after its three lessons", () => {
    const passed2: ProgressRecord = {
      moduleId: 2,
      lessonId: "",
      completed: true,
      quizScore: 1,
    };
    assert.equal(isLessonOpen("m3-l1", [passed2]), true);
    assert.equal(isQuizOpen(3, [passed2, done(3, "m3-l1"), done(3, "m3-l2")]), false);
    const ready = [passed2, done(3, "m3-l1"), done(3, "m3-l2"), done(3, "m3-l3")];
    assert.equal(isQuizOpen(3, ready), true);
    assert.equal(isModuleUnlocked(4, ready), false);
    const throughModule3 = [
      done(1, "m1-l1"),
      done(1, "m1-l2"),
      done(1, "m1-l3"),
      { moduleId: 1, lessonId: "", completed: true, quizScore: 1 },
      done(2, "m2-l1"),
      done(2, "m2-l2"),
      done(2, "m2-l3"),
      ...ready,
    ];
    assert.equal(nextStep(throughModule3)?.href, "/app/quiz/3");
  });
});
