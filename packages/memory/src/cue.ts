import type { ShadowTrace } from "./shadow.ts";

export interface MemoryCue {
  traceId: string;
  gist: string;
  feltLine: string;
  noticedDetail?: string;
  certainty: number;
  useMode: "analogy" | "warning" | "comfort" | "pattern";
}

export function createMemoryCue(trace: ShadowTrace): MemoryCue {
  return {
    traceId: trace.traceId,
    gist: trace.gist,
    feltLine: trace.feltLine,
    noticedDetail: trace.noticed[0],
    certainty: trace.certainty,
    useMode: inferUseMode(trace.appraisal),
  };
}

function inferUseMode(appraisal: string): MemoryCue["useMode"] {
  const lower = appraisal.toLowerCase();
  if (lower.includes("danger") || lower.includes("risk") || lower.includes("warn")) return "warning";
  if (lower.includes("comfort") || lower.includes("support") || lower.includes("care")) return "comfort";
  if (lower.includes("remind") || lower.includes("similar") || lower.includes("analogy")) return "analogy";
  return "pattern";
}
