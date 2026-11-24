// API 579-1/ASME FFS-1 (2016) clause-by-clause guide. Wording by NumSum, not the Standard's text.
import type { ClauseRow } from "./types";
import { P1 } from "./api-579.p1";
import { P2 } from "./api-579.p2";
import { P3 } from "./api-579.p3";
import { P4 } from "./api-579.p4";
import { P5 } from "./api-579.p5";
import { P6 } from "./api-579.p6";
import { P7 } from "./api-579.p7";
import { P8 } from "./api-579.p8";
import { P9 } from "./api-579.p9";
import { P10 } from "./api-579.p10";

export const API579_CLAUSES: ClauseRow[] = [...P1, ...P2, ...P3, ...P4, ...P5, ...P6, ...P7, ...P8, ...P9, ...P10];
