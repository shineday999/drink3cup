// 分類 → 測驗種類。內建 jewelry / incense / tea；後臺新增的分類若程式碼是 tea，
// 或簡體中文標題是「茶葉 / 茶葉」，也視為 tea（程式碼不一定是 tea）。其餘自訂分類沒有測驗。
// 這裡不 import "./db"，方便在 Node 內單元測試。
export type QuizKind = "jewelry" | "incense" | "tea";

export function kindOf(code: string, zhTitle?: string | null): QuizKind | null {
  if (code === "jewelry" || code === "incense" || code === "tea") return code;
  if (zhTitle && /^茶[葉葉]$/.test(zhTitle.trim())) return "tea";
  return null;
}
