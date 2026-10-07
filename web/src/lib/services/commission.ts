import { PlatformSetting, ServiceCategory } from "../models";

export interface CommissionFeeResult {
  platformFee: number;
  feeRatePercent: number;
  workerEarning: number;
}

/**
 * Resolves the platform commission fee dynamically based on PlatformSetting.commissionRules
 * matching against the service category.
 */
export async function resolvePlatformFee(
  categoryId: any,
  totalAmount: number
): Promise<CommissionFeeResult> {
  const safeTotal = Math.max(0, Math.round(totalAmount));
  try {
    const [settings, category] = await Promise.all([
      PlatformSetting.findOne().lean(),
      categoryId ? ServiceCategory.findById(categoryId).select("name").lean() : null,
    ]);

    const categoryName = category?.name?.toLowerCase().trim() || "";
    const rules = (settings as any)?.commissionRules || [];

    const matchedRule = rules.find((r: any) => {
      const ruleCat = r.category?.toLowerCase().trim() || "";
      return ruleCat && (ruleCat === categoryName || categoryName.includes(ruleCat) || ruleCat.includes(categoryName));
    });

    if (matchedRule) {
      if (matchedRule.type === "fixed") {
        const fee = Math.min(safeTotal, Math.max(0, Math.round(matchedRule.value)));
        return {
          platformFee: fee,
          feeRatePercent: safeTotal > 0 ? (fee / safeTotal) * 100 : 0,
          workerEarning: Math.max(0, safeTotal - fee),
        };
      } else {
        const percent = Math.max(0, Number(matchedRule.value) || 10);
        const fee = Math.round((safeTotal * percent) / 100);
        return {
          platformFee: fee,
          feeRatePercent: percent,
          workerEarning: Math.max(0, safeTotal - fee),
        };
      }
    }

    const defaultPercent = 10;
    const defaultFee = Math.round((safeTotal * defaultPercent) / 100);
    return {
      platformFee: defaultFee,
      feeRatePercent: defaultPercent,
      workerEarning: Math.max(0, safeTotal - defaultFee),
    };
  } catch (err) {
    console.error("Error calculating platform fee:", err);
    const fallbackFee = Math.round(safeTotal * 0.1);
    return {
      platformFee: fallbackFee,
      feeRatePercent: 10,
      workerEarning: Math.max(0, safeTotal - fallbackFee),
    };
  }
}
