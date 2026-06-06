import { readFile } from "node:fs/promises";

export type AuditTier = "CERTIFIED" | "WATCH" | "REVIEW" | "BLOCKED";

export interface TableauWorkbook {
  name: string;
  owner: string;
  audience: string;
  site: string;
  businessCriticality: number;
  datasourceCertification: number;
  lineageCompleteness: number;
  extractFreshnessHours: number;
  refreshSuccessRate: number;
  rowLevelSecurityCoverage: number;
  brokenCalculationCount: number;
  permissionExceptionCount: number;
  ownerSignoffAgeDays: number;
  narrative: string;
  nextAction: string;
}

export interface LineageInput {
  generatedAt: string;
  organization: string;
  workbooks: TableauWorkbook[];
}

export interface AuditedWorkbook extends TableauWorkbook {
  lineageTrustScore: number;
  exposureScore: number;
  tier: AuditTier;
  route: string;
}

export interface LineageAudit {
  generatedAt: string;
  organization: string;
  workbooks: AuditedWorkbook[];
  summary: {
    workbookCount: number;
    certifiedCount: number;
    blockedCount: number;
    weakestWorkbook: string;
    meanLineageTrustScore: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifyTier(lineageTrustScore: number): AuditTier {
  if (lineageTrustScore >= 84) return "CERTIFIED";
  if (lineageTrustScore >= 70) return "WATCH";
  if (lineageTrustScore >= 52) return "REVIEW";
  return "BLOCKED";
}

export function auditWorkbook(workbook: TableauWorkbook): AuditedWorkbook {
  const freshnessScore = 100 - clamp(workbook.extractFreshnessHours * 3);
  const calculationPenalty = clamp(workbook.brokenCalculationCount * 12);
  const permissionPenalty = clamp(workbook.permissionExceptionCount * 9);
  const signoffFreshness = 100 - clamp(workbook.ownerSignoffAgeDays * 2);

  const lineageTrustScore = Math.round(
    clamp(
      workbook.datasourceCertification * 0.18 +
        workbook.lineageCompleteness * 0.2 +
        freshnessScore * 0.12 +
        workbook.refreshSuccessRate * 0.14 +
        workbook.rowLevelSecurityCoverage * 0.14 +
        (100 - calculationPenalty) * 0.1 +
        (100 - permissionPenalty) * 0.07 +
        signoffFreshness * 0.03 +
        workbook.businessCriticality * 0.02
    )
  );

  const exposureScore = 100 - lineageTrustScore;
  const tier = classifyTier(lineageTrustScore);
  const route =
    tier === "BLOCKED"
      ? "Block executive reuse until certified datasource, extract, calculation, and permission evidence are repaired."
      : tier === "REVIEW"
        ? "Route to Tableau governance review with lineage, RLS, and workbook owner evidence attached."
        : tier === "WATCH"
          ? "Keep in the board packet with watch conditions and refresh evidence before the next cycle."
          : "Certified for executive use with current lineage, extract, permission, and owner evidence.";

  return { ...workbook, lineageTrustScore, exposureScore, tier, route };
}

export function buildAudit(input: LineageInput): LineageAudit {
  const workbooks = input.workbooks.map(auditWorkbook).sort((a, b) => a.lineageTrustScore - b.lineageTrustScore);
  const meanLineageTrustScore = Math.round(
    workbooks.reduce((sum, workbook) => sum + workbook.lineageTrustScore, 0) / Math.max(workbooks.length, 1)
  );
  const weakestWorkbook = workbooks[0]?.name ?? "No workbooks";
  const certifiedCount = workbooks.filter((workbook) => workbook.tier === "CERTIFIED").length;
  const blockedCount = workbooks.filter((workbook) => workbook.tier === "BLOCKED").length;

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    workbooks,
    summary: {
      workbookCount: workbooks.length,
      certifiedCount,
      blockedCount,
      weakestWorkbook,
      meanLineageTrustScore,
      primaryRecommendation: `Fix ${weakestWorkbook} first; it has the weakest Tableau lineage posture for executive use.`
    }
  };
}

export async function loadAudit(path: string): Promise<LineageAudit> {
  return buildAudit(JSON.parse(await readFile(path, "utf8")) as LineageInput);
}

export function renderMarkdown(audit: LineageAudit): string {
  const rows = audit.workbooks
    .map(
      (workbook) =>
        `| ${workbook.name} | ${workbook.tier} | ${workbook.lineageTrustScore} | ${workbook.site} | ${workbook.datasourceCertification}% | ${workbook.lineageCompleteness}% | ${workbook.nextAction} |`
    )
    .join("\n");

  return [
    "# Tableau Dashboard Lineage Auditor",
    "",
    `Organization: ${audit.organization}`,
    "",
    `Primary recommendation: ${audit.summary.primaryRecommendation}`,
    "",
    "| Workbook | Tier | Lineage trust | Site | Certified datasource | Lineage | Next action |",
    "| --- | --- | ---: | --- | ---: | ---: | --- |",
    rows
  ].join("\n");
}
