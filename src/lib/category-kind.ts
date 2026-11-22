// 分類 → 測驗種類。資料庫分類代碼 jewelry / beans 都是咖啡豆測驗,incense / brewing 都是器具測驗(S06 分類改名前後通用);
// 後臺新增的分類若程式碼是 tea,或繁體中文標題是「茶葉」,也視為 tea。其餘自訂分類沒有測驗。
// 這裡不 import "./db",方便在 Node 內單元測試。
export type QuizKind = "beans" | "brewing" | "tea";

export function kindOf(code: string, zhTitle?: string | null): QuizKind | null {
  if (code === "jewelry" || code === "beans") return "beans";
  if (code === "incense" || code === "brewing") return "brewing";
  if (code === "tea") return "tea";
  if (zhTitle && /^茶[葉叶]$/.test(zhTitle.trim())) return "tea";
  return null;
}
