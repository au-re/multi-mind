export interface CanonicalEvent {
  eventId: string;
  turnId: number;
  timestamp: string;
  userMessageSummary: string;
  assistantReplySummary: string;
  domainTags: string[];
  facts: string[];
  emotionalSummary: string;
  uncertaintyNotes: string[];
  embedding?: number[];
}
