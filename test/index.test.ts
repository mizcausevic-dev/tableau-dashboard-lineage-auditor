import { describe, expect, it } from "vitest";
import sample from "../fixtures/tableau-lineage-sample.json" with { type: "json" };
import { auditWorkbook, buildAudit, classifyTier, renderMarkdown } from "../src/index.js";

describe("tableau dashboard lineage auditor", () => {
  it("classifies lineage audit tiers", () => {
    expect(classifyTier(91)).toBe("CERTIFIED");
    expect(classifyTier(74)).toBe("WATCH");
    expect(classifyTier(59)).toBe("REVIEW");
    expect(classifyTier(41)).toBe("BLOCKED");
  });

  it("audits workbooks from Tableau lineage posture", () => {
    const workbook = auditWorkbook(sample.workbooks[0]);
    expect(workbook.lineageTrustScore).toBeLessThan(70);
    expect(workbook.route).toContain("Tableau");
  });

  it("sorts weakest Tableau workbooks first", () => {
    const audit = buildAudit(sample);
    expect(audit.summary.workbookCount).toBe(4);
    expect(audit.workbooks[0].lineageTrustScore).toBeLessThanOrEqual(audit.workbooks[1].lineageTrustScore);
    expect(audit.summary.primaryRecommendation).toContain(audit.summary.weakestWorkbook);
  });

  it("renders markdown output", () => {
    const markdown = renderMarkdown(buildAudit(sample));
    expect(markdown).toContain("| Workbook | Tier | Lineage trust |");
    expect(markdown).toContain("Board finance workbook");
  });
});
