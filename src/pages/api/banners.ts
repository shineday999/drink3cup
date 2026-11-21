import type { APIRoute } from "astro";
import { getDB } from "../../lib/db";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET: APIRoute = async (ctx) => {
  const db = getDB();
  const result = await db
    .prepare(
      "SELECT id, image_url, alt_text, sort_order FROM hero_banners WHERE active = 1 ORDER BY sort_order ASC, created_at ASC",
    )
    .all<{
      id: string;
      image_url: string;
      alt_text: string | null;
      sort_order: number;
    }>();

  return new Response(JSON.stringify({ results: result.results ?? [] }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
};
