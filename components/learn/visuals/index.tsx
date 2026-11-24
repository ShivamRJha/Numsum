import type { VisualKey } from "@/lib/learn/codes-types";
import { CodeFlow } from "../code-flow";
import { AllowableStress } from "./allowable-stress";
import { CorrosionTimeline } from "./corrosion-timeline";
import { DmFamilies } from "./dm-families";
import { FfsPartMap } from "./ffs-part-map";
import { HeatTreatment } from "./heat-treatment";
import { LtaRsf } from "./lta-rsf";
import { MtDirections } from "./mt-directions";
import { NdeSelector } from "./nde-selector";
import { ParentSpecs } from "./parent-specs";
import { PipingCircuit } from "./piping-circuit";
import { PofBuilder } from "./pof-builder";
import { PtTimeline } from "./pt-timeline";
import { RiskMatrix } from "./risk-matrix";
import { RtGeometry } from "./rt-geometry";
import { SpecAnatomy } from "./spec-anatomy";
import { UtSkip } from "./ut-skip";
import { VizFrame } from "./frame";

const MAP: Partial<Record<VisualKey, () => React.ReactNode>> = {
  "corrosion-timeline": () => <CorrosionTimeline />, "interval-compare": () => <CorrosionTimeline />, "risk-matrix": () => <RiskMatrix />, "pof-builder": () => <PofBuilder />,
  "lta-rsf": () => <LtaRsf />, "piping-circuit": () => <PipingCircuit />, "ffs-part-map": () => <FfsPartMap />, "dm-families": () => <DmFamilies />,
  "spec-anatomy": () => <SpecAnatomy />, "parent-specs": () => <ParentSpecs />, "heat-treatment": () => <HeatTreatment />, "allowable-stress": () => <AllowableStress />,
  "nde-selector": () => <NdeSelector />, "rt-geometry": () => <RtGeometry />, "ut-skip": () => <UtSkip />, "pt-timeline": () => <PtTimeline />, "mt-directions": () => <MtDirections />,
  "code-flow": () => <VizFrame title="How the codes fit together"><CodeFlow /></VizFrame>,
};
export function Visual({ k }: { k?: VisualKey }) { const C = k ? MAP[k] : undefined; return C ? <>{C()}</> : null; }
