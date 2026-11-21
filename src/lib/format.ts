/**
 * Locale-aware price formatter with currency conversion.
 *
 * 價格以新台幣（TWD）記錄：D1 product_prices 的 TWD 列（單位：分）是商品的唯一售價。
 * 各語言前台再依匯率表換算成當地熟悉的貨幣顯示：
 *   zh-Hant -> TWD (新台幣 NT$)
 *
 * 匯率存在 D1 exchange_rates（後台「汇率」頁維護），由 middleware 經 lib/rates.ts
 * 載入並呼叫 setRates()；讀不到時使用下方預設值。
 * Falls back to raw "CUR amount" if Intl.NumberFormat rejects the locale.
 */

/** 1 新台幣 = 多少該幣別 */
export type RateTable = Record<string, number>;

export const DEFAULT_RATES_PER_CNY: RateTable = {
  TWD: 1,
  USD: 0.03125,
  MYR: 0.14375,
  IDR: 490.626,
  AED: 0.114687,
  SAR: 0.117187,
};

let ratesPerCny: RateTable = { ...DEFAULT_RATES_PER_CNY };

export function getRates(): RateTable {
  return ratesPerCny;
}

/** 以資料庫的值覆蓋預設；非正數或非數字的列忽略；TWD 永遠是 1。 */
export function setRates(next: RateTable): void {
  const merged: RateTable = { ...DEFAULT_RATES_PER_CNY };
  for (const [currency, rate] of Object.entries(next)) {
    if (Number.isFinite(rate) && rate > 0) merged[currency] = rate;
  }
  merged.TWD = 1;
  ratesPerCny = merged;
}

export const LOCALE_CURRENCY: Record<string, string> = {
  "zh-Hant": "TWD",
  zh: "TWD",
};

export function formatPrice(
  amountCents: number,
  fromCurrency: string,
  locale: string,
): string {
  const targetCurrency = LOCALE_CURRENCY[locale] ?? "USD";
  const fromRate = ratesPerCny[fromCurrency] ?? 1;
  const targetRate = ratesPerCny[targetCurrency] ?? 1;
  const amount = (amountCents / 100) * (targetRate / fromRate);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: targetCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${targetCurrency} ${Math.round(amount)}`;
  }
}
