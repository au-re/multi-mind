import type { TraitId } from "@multi-mind/shared";

export interface ShadowTrace {
  traceId: string;
  eventId: string;
  traitId: TraitId;
  salience: number;
  appraisal: string;
  gist: string;
  feltLine: string;
  noticed: string[];
  ignored: string[];
  unfinishedBusiness: string[];
  lexicalImprint: string[];
  certainty: number;
  moodColor: Record<string, number>;
  embedding?: number[];
}
