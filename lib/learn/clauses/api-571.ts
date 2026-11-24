// API RP 571 (3rd ed., 2020) clause-by-clause guide. Wording by NumSum, not the RP text.
import type { ClauseRow } from "./types";
import { P1 } from "./api-571.p1";
import { P2 } from "./api-571.p2";
import { P3 } from "./api-571.p3";
import { P4 } from "./api-571.p4";
import { P5 } from "./api-571.p5";
import { P6 } from "./api-571.p6";
import { P7 } from "./api-571.p7";
import { P8 } from "./api-571.p8";
import { P9 } from "./api-571.p9";
import { P10 } from "./api-571.p10";
import { P11 } from "./api-571.p11";
import { P12 } from "./api-571.p12";
import { P13 } from "./api-571.p13";
import { P14 } from "./api-571.p14";
import { P15 } from "./api-571.p15";
import { P16 } from "./api-571.p16";
import { P17 } from "./api-571.p17";
import { P18 } from "./api-571.p18";
import { P19 } from "./api-571.p19";
import { P20 } from "./api-571.p20";

const BASE: ClauseRow[] = [...P1, ...P2, ...P3, ...P4, ...P5, ...P6, ...P7, ...P8, ...P9, ...P10, ...P11, ...P12, ...P13, ...P14, ...P15, ...P16, ...P17, ...P18, ...P19, ...P20];

/** Each mechanism ends with a .9 References clause listing literature; summarised rather than reproduced. */
export const API571_CLAUSES: ClauseRow[] = BASE.flatMap((r) =>
  /^3\.\d+\.8$/.test(r[0])
    ? [r, [r[0].replace(/\.8$/, ".9"), "References", "The RP closes this mechanism with a numbered list of the literature it draws on (API, NACE and other technical papers and standards). Consult the licensed RP for the list; the related API and NACE documents are also gathered in Annex A."] as ClauseRow]
    : [r],
);
