// ASME BPVC Section V (2017) clause-by-clause guide. Wording by NumSum, not the Code text.
import type { ClauseRow } from "./types";
import { P1 } from "./asme-v.p1";
import { P2 } from "./asme-v.p2";
import { P3 } from "./asme-v.p3";
import { P4 } from "./asme-v.p4";
import { P5 } from "./asme-v.p5";
import { P6 } from "./asme-v.p6";
import { P7 } from "./asme-v.p7";
import { P8 } from "./asme-v.p8";
import { P9 } from "./asme-v.p9";
import { P10 } from "./asme-v.p10";
import { P11 } from "./asme-v.p11";
import { P12 } from "./asme-v.p12";
import { P13 } from "./asme-v.p13";
import { P14 } from "./asme-v.p14";

export const ASMEV_CLAUSES: ClauseRow[] = [...P1, ...P2, ...P3, ...P4, ...P5, ...P6, ...P7, ...P8, ...P9, ...P10, ...P11, ...P12, ...P13, ...P14];
