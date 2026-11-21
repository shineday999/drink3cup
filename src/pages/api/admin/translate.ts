import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

// 後台「自動翻譯」：簡體中文 → 英文 / 马来文 / 印尼文。
// 使用 Cloudflare Workers AI（m2m100-1.2b），Workers Free 每天有 10,000 Neurons 免費額度，用完只會失敗、不會收費。
const MODEL = "@cf/meta/m2m100-1.2b";
const LANG: Record<string, string> = {
  "zh-Hans": "zh",
  en: "en",
  "ms-MY": "ms",
  "id-ID": "id",
};
const MAX_CHARS = 12000;
const MAX_PIECES = 45; // 一次請求最多翻幾段（避免超過子請求上限）
const CONCURRENCY = 4;

interface AiBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// 一行 → Markdown 前綴（標題 / 清單 / 引用）+ 內文；圖片、網址、HTML 標籤、程式碼區塊原樣保留
const PREFIX_RE = /^(\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s+)*)(.*)$/;
const SKIP_LINE_RE = /^\s*(?:!\[[^\]]*\]\([^)]*\)|https?:\/\/\S+|<[^>]+>)\s*$/;

type Piece =
  | { kind: "raw"; text: string }
  | { kind: "tr"; prefix: string; parts: string[] };

function splitLong(body: string): string[] {
  if (body.length <= 300) return [body];
  const sentences = body.split(/(?<=[。！？!?；;])/);
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && cur.length + s.length > 300) {
      out.push(cur);
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function plan(text: string): Piece[] {
  let fence = false;
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line): Piece => {
      if (/^\s*```/.test(line)) {
        fence = !fence;
        return { kind: "raw", text: line };
      }
      if (fence || !line.trim() || SKIP_LINE_RE.test(line)) {
        return { kind: "raw", text: line };
      }
      const m = PREFIX_RE.exec(line);
      const prefix = m?.[1] ?? "";
      const body = (m?.[2] ?? line).trim();
      if (!body) return { kind: "raw", text: line };
      return { kind: "tr", prefix, parts: splitLong(body) };
    });
}

async function translateAll(
  ai: AiBinding,
  texts: string[],
  from: string,
  to: string,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const queue = [...new Set(texts)];
  let next = 0;
  async function worker(): Promise<void> {
    while (next < queue.length) {
      const mine = queue[next++]!;
      const out = (await ai.run(MODEL, {
        text: mine,
        source_lang: from,
        target_lang: to,
      })) as { translated_text?: string } | null;
      const tr = out?.translated_text;
      if (typeof tr !== "string") throw new Error("模型没有回传翻译结果");
      result.set(mine, tr.trim());
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker),
  );
  return result;
}

export const POST: APIRoute = async (ctx) => {
  if (!ctx.locals.admin) return json({ error: "Unauthorized" }, 401);

  const ai = (env as unknown as { AI?: AiBinding }).AI;
  if (!ai) return json({ error: "AI 翻译尚未启用（缺少 AI 绑定）" }, 503);

  let body: Record<string, unknown>;
  try {
    body = (await ctx.request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Bad JSON" }, 400);
  }
  const text = typeof body.text === "string" ? body.text : "";
  const from = LANG[String(body.from ?? "zh-Hans")];
  const to = LANG[String(body.to ?? "")];
  if (!text.trim() || !from || !to || from === to) {
    return json({ error: "Bad request" }, 400);
  }
  if (text.length > MAX_CHARS) {
    return json({ error: "内容太长，请分段翻译" }, 413);
  }

  const pieces = plan(text);
  const all = pieces.flatMap((p) => (p.kind === "tr" ? p.parts : []));
  if (new Set(all).size > MAX_PIECES) {
    return json({ error: "内容太长，请分段翻译" }, 413);
  }

  let map: Map<string, string>;
  try {
    map = await translateAll(ai, all, from, to);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: `翻译失败：${msg}` }, 502);
  }

  const out = pieces
    .map((p) =>
      p.kind === "raw"
        ? p.text
        : p.prefix + p.parts.map((s) => map.get(s) ?? s).join(" "),
    )
    .join("\n");
  return json({ text: out });
};
