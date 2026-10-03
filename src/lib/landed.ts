export type LandedInputs = {
  currency: string; units: number; unitPrice: number; toolingCost: number; inspectionCost: number;
  freightCost: number; insuranceCost: number; dutyRate: number; vatRate: number; customsClearance: number;
  lastMilePerUnit: number; otherCosts: number; targetMargin: number;
};

export const defaultLanded: LandedInputs = {
  currency: "USD", units: 500, unitPrice: 0, toolingCost: 0, inspectionCost: 0, freightCost: 0,
  insuranceCost: 0, dutyRate: 0, vatRate: 0, customsClearance: 0, lastMilePerUnit: 0, otherCosts: 0, targetMargin: 45,
};

const n = (v: number) => (Number.isFinite(v) ? v : 0);

export function computeLanded(e: LandedInputs) {
  const units = Math.max(1, Math.floor(n(e.units)));
  const goodsValue = n(e.unitPrice) * units;
  const freightTotal = n(e.freightCost) + n(e.insuranceCost);
  const dutiableValue = goodsValue + freightTotal;
  const duty = dutiableValue * (n(e.dutyRate) / 100);
  const vat = (dutiableValue + duty) * (n(e.vatRate) / 100);
  const otherFixed = n(e.toolingCost) + n(e.inspectionCost) + n(e.customsClearance) + n(e.otherCosts);
  const lastMileTotal = n(e.lastMilePerUnit) * units;
  const totalLandedCost = goodsValue + freightTotal + duty + vat + otherFixed + lastMileTotal;
  const landedCostPerUnit = totalLandedCost / units;
  const margin = Math.min(95, Math.max(0, n(e.targetMargin)));
  const suggestedRetail = margin > 0 ? landedCostPerUnit / (1 - margin / 100) : landedCostPerUnit;
  const grossProfitPerUnit = suggestedRetail - landedCostPerUnit;
  return {
    goodsValue, freightTotal, dutiableValue, duty, vat, otherFixed, lastMileTotal, totalLandedCost,
    landedCostPerUnit, suggestedRetail, grossProfitPerUnit,
    grossMarginAtRetail: suggestedRetail > 0 ? (grossProfitPerUnit / suggestedRetail) * 100 : 0,
    breakEvenUnits: grossProfitPerUnit > 0 ? Math.ceil((otherFixed + freightTotal) / grossProfitPerUnit) : null,
  };
}

export const money = (v: number, currency: string) => {
  try { return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(v); }
  catch { return `${currency} ${v.toFixed(2)}`; }
};

export function landedToMarkdown(title: string, i: LandedInputs, r: ReturnType<typeof computeLanded>) {
  const m = (v: number) => money(v, i.currency);
  return [
    `# ${title || "Untitled scenario"}`, "",
    "Computed by ProcenAI's calculator from the figures entered by your team. Inputs are your assumptions; confirm duty and freight with your broker and forwarder.", "",
    `- Units: ${i.units}`, `- Unit price: ${m(i.unitPrice)}`, `- Tooling / setup: ${m(i.toolingCost)}`,
    `- Inspection / QC: ${m(i.inspectionCost)}`, `- Freight: ${m(i.freightCost)}`, `- Insurance: ${m(i.insuranceCost)}`,
    `- Duty rate: ${i.dutyRate}%`, `- VAT / import tax rate: ${i.vatRate}%`, `- Customs clearance: ${m(i.customsClearance)}`,
    `- Last mile per unit: ${m(i.lastMilePerUnit)}`, `- Other costs: ${m(i.otherCosts)}`, `- Target margin: ${i.targetMargin}%`, "",
    `- Goods value: ${m(r.goodsValue)}`, `- Freight + insurance: ${m(r.freightTotal)}`, `- Dutiable value: ${m(r.dutiableValue)}`,
    `- Duty: ${m(r.duty)}`, `- VAT / import tax: ${m(r.vat)}`, `- Fixed costs: ${m(r.otherFixed)}`, `- Last mile total: ${m(r.lastMileTotal)}`,
    `- **Total landed cost: ${m(r.totalLandedCost)}**`, `- **Landed cost per unit: ${m(r.landedCostPerUnit)}**`,
    `- Suggested retail at ${i.targetMargin}% margin: ${m(r.suggestedRetail)}`, `- Gross profit per unit: ${m(r.grossProfitPerUnit)}`,
    `- Break-even units: ${r.breakEvenUnits ?? "n/a"}`,
  ].join("\n");
}
