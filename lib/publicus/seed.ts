export { initialWorkspace, SAMPLE_DATE, SCENARIOS, applyScenario, preparedAnswer } from "@/supabase/functions/_shared/fixtures";
import type { ProcurementRecord, Source } from "@/supabase/functions/_shared/domain";
import publicData from "./public-records.json";
export const PUBLIC_SNAPSHOT = publicData as { records: ProcurementRecord[]; sources: Source[]; capturedAt: string };
