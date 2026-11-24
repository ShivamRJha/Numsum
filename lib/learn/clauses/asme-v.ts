// ASME BPVC Section V (2017) clause-by-clause guide. Wording by NumSum, not the Code text.
import type { ClauseRow } from "./types";
import { P1 } from "./asme-v.p1";
import { P2 } from "./asme-v.p2";
import { P3 } from "./asme-v.p3";
import { P4 } from "./asme-v.p4";
import { P5 } from "./asme-v.p5";
import { P6 } from "./asme-v.p6";
import { P7 } from "./asme-v.p7";

export const ASMEV_CLAUSES: ClauseRow[] = [...P1, ...P2, ...P3, ...P4, ...P5, ...P6, ...P7];
