import type { TraitId } from "@multi-mind/shared";
import type { CanonicalEvent } from "./canonical.ts";
import type { ShadowTrace } from "./shadow.ts";

export class InMemoryMemoryStore {
  private canonical: CanonicalEvent[] = [];
  private shadowByTrait: Partial<Record<TraitId, ShadowTrace[]>> = {};

  addCanonicalEvent(event: CanonicalEvent) {
    this.canonical.push(event);
  }

  getCanonicalEvents() {
    return this.canonical;
  }

  getCanonicalEvent(eventId: string) {
    return this.canonical.find((e) => e.eventId === eventId) ?? null;
  }

  addShadowTrace(trace: ShadowTrace) {
    const existing = this.shadowByTrait[trace.traitId];
    if (existing) {
      existing.push(trace);
    } else {
      this.shadowByTrait[trace.traitId] = [trace];
    }
  }

  getShadowTraces(traitId: TraitId) {
    return this.shadowByTrait[traitId] ?? [];
  }

  getAllShadowTraces() {
    return Object.values(this.shadowByTrait).flat();
  }
}
