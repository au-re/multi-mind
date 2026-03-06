import type { ActionRecord, ClaimNode, RoundBlackboard, TensionBridge, VetoRecord } from "./schema.ts";

export function createEmptyBlackboard(roundId: string): RoundBlackboard {
  return {
    roundId,
    salienceMap: {},
    uncertaintyMap: {},
    memoryPool: [],
    frameScores: {},
    modeScores: {},
    slotPriorities: {},
    claimGraph: {},
    styleField: {},
    lexicalPool: {},
    bridgePool: [],
    vetoRecords: [],
    actionLog: [],
  };
}

export class BlackboardStore {
  private bb: RoundBlackboard;

  constructor(roundId: string) {
    this.bb = createEmptyBlackboard(roundId);
  }

  getBlackboard() {
    return this.bb;
  }

  // Claims
  getClaims() {
    return Object.values(this.bb.claimGraph);
  }

  addClaim(claim: ClaimNode) {
    this.bb.claimGraph[claim.id] = claim;
  }

  updateClaim(id: string, update: Partial<ClaimNode>) {
    const existing = this.bb.claimGraph[id];
    if (existing) {
      Object.assign(existing, update);
    }
  }

  // Style
  getStyleField() {
    return this.bb.styleField;
  }

  shiftStyle(dimension: string, delta: number) {
    this.bb.styleField[dimension] = (this.bb.styleField[dimension] ?? 0) + delta;
  }

  // Vetoes
  getVetoes() {
    return this.bb.vetoRecords;
  }

  addVeto(veto: VetoRecord) {
    this.bb.vetoRecords.push(veto);
  }

  // Actions
  getActionLog() {
    return this.bb.actionLog;
  }

  logAction(record: ActionRecord) {
    this.bb.actionLog.push(record);
  }

  // Bridges
  getBridges() {
    return this.bb.bridgePool;
  }

  addBridge(bridge: TensionBridge) {
    this.bb.bridgePool.push(bridge);
  }

  // Salience
  getSalienceMap() {
    return this.bb.salienceMap;
  }

  setSalience(key: string, value: number) {
    this.bb.salienceMap[key] = value;
  }
}
