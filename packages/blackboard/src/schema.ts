export interface ClaimNode {
  id: string;
  claimText: string;
  support: number;
  oppose: number;
  qualify: number;
  question: number;
  provenance: string[];
  sourceMix: string[];
}

export interface TensionBridge {
  id: string;
  left: string;
  right: string;
  kind: "concession" | "sequence" | "contrast" | "scope_split";
  strength: number;
}

export interface VetoRecord {
  id: string;
  targetId: string;
  cause: string;
  traitId: string;
  power: number;
}

export interface ActionRecord {
  id: string;
  traitId: string;
  type: string;
  power: number;
  params: Record<string, unknown>;
  status: "applied" | "suppressed" | "failed" | "tension";
}

export interface MemoryCue {
  traceId: string;
  gist: string;
  feltLine: string;
  noticedDetail?: string;
  certainty: number;
  useMode: "analogy" | "warning" | "comfort" | "pattern";
}

export interface RoundBlackboard {
  roundId: string;
  salienceMap: Record<string, number>;
  uncertaintyMap: Record<string, number>;
  memoryPool: MemoryCue[];
  frameScores: Record<string, number>;
  modeScores: Record<string, number>;
  slotPriorities: Record<string, number>;
  claimGraph: Record<string, ClaimNode>;
  styleField: Record<string, number>;
  lexicalPool: Record<string, number>;
  bridgePool: TensionBridge[];
  vetoRecords: VetoRecord[];
  actionLog: ActionRecord[];
}
