// Cart helpers — 用 cookie 存 server-readable 購物車
// 簡化版:Phase 4 用 cookie-based cart(避免 localStorage SSR 漂移)

const CART_COOKIE = "cnamber_cart";

export interface CartItem {
  slug: string;
  qty: number;
  sku?: string;
  addedAt: number;
}

export function readCart(cookieHeader: string | null): CartItem[] {
  if (!cookieHeader) return [];
  const match = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith(`${CART_COOKIE}=`));
  if (!match) return [];
  try {
    const raw = match.split("=")[1] ?? "";
    const json = decodeURIComponent(raw);
    const parsed = JSON.parse(atob(json)) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]): string {
  const json = JSON.stringify(items);
  const b64 = btoa(json);
  return b64;
}

export function addToCart(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find(
    (i) => i.slug === item.slug && i.sku === item.sku,
  );
  if (existing) {
    return items.map((i) =>
      i === existing ? { ...i, qty: i.qty + item.qty } : i,
    );
  }
  return [...items, item];
}

export function removeFromCart(
  items: CartItem[],
  slug: string,
  sku?: string,
): CartItem[] {
  return items.filter(
    (i) => !(i.slug === slug && (sku ? i.sku === sku : true)),
  );
}

export function clearCart(): CartItem[] {
  return [];
}
