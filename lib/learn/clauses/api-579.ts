// API 579-1/ASME FFS-1 (2016) clause-by-clause guide. Wording by NumSum, not the Standard's text.
import type { ClauseRow } from "./types";
import { P1 } from "./api-579.p1";
import { P2 } from "./api-579.p2";
import { P3 } from "./api-579.p3";
import { P4 } from "./api-579.p4";

export const API579_CLAUSES: ClauseRow[] = [...P1, ...P2, ...P3, ...P4];
