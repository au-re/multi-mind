import { describe, expect, it } from "vitest";
import { createMemoryCue } from "./cue.ts";
import type { ShadowTrace } from "./shadow.ts";

const BASE_TRACE: ShadowTrace = {
  traceId: "tr-001",
  eventId: "ev-001",
  traitId: "warmth",
  salience: 0.8,
  appraisal: "This person needs comfort and support",
  gist: "User considering quitting due to exhaustion",
  feltLine: "The exhaustion was louder than the logic.",
  noticed: ["exhaustion", "uncertainty"],
  ignored: ["career details"],
  unfinishedBusiness: [],
  lexicalImprint: [],
  certainty: 0.6,
  moodColor: {},
};

describe("createMemoryCue", () => {
  it("maps traceId, gist, feltLine, certainty", () => {
    const cue = createMemoryCue(BASE_TRACE);
    expect(cue.traceId).toBe("tr-001");
    expect(cue.gist).toBe("User considering quitting due to exhaustion");
    expect(cue.feltLine).toBe("The exhaustion was louder than the logic.");
    expect(cue.certainty).toBe(0.6);
  });

  it("picks first noticed item as noticedDetail", () => {
    const cue = createMemoryCue(BASE_TRACE);
    expect(cue.noticedDetail).toBe("exhaustion");
  });

  it("leaves noticedDetail undefined when noticed is empty", () => {
    const cue = createMemoryCue({ ...BASE_TRACE, noticed: [] });
    expect(cue.noticedDetail).toBeUndefined();
  });

  it("infers comfort useMode from comfort-related appraisal", () => {
    const cue = createMemoryCue(BASE_TRACE);
    expect(cue.useMode).toBe("comfort");
  });

  it("infers warning useMode from risk-related appraisal", () => {
    const cue = createMemoryCue({ ...BASE_TRACE, appraisal: "There is a dangerous risk here" });
    expect(cue.useMode).toBe("warning");
  });

  it("infers analogy useMode from pattern-related appraisal", () => {
    const cue = createMemoryCue({ ...BASE_TRACE, appraisal: "This reminds me of a similar pattern" });
    expect(cue.useMode).toBe("analogy");
  });

  it("defaults to pattern useMode", () => {
    const cue = createMemoryCue({ ...BASE_TRACE, appraisal: "Something happened" });
    expect(cue.useMode).toBe("pattern");
  });
});
