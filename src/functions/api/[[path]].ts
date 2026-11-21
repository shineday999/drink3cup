import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
  I18N: KVNamespace;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      if (!origin) return "*";
      if (c.env?.ASSETS) {
        const allowed = ["https://mycafe.de5.net", "https://mycafe.pages.dev"];
        return allowed.includes(origin) ? origin : null;
      }
      return origin;
    },
    credentials: true,
  }),
);

app.get("/api/health", (c) =>
  c.json({ ok: true, service: "mycafe", ts: Date.now() }),
);

app.get("/api/i18n/:locale", async (c) => {
  const locale = c.req.param("locale");
  const allowed = ["zh-Hant"];
  if (!allowed.includes(locale)) {
    return c.json({ error: "unsupported_locale" }, 400);
  }
  const messages = await import(`../../i18n/messages/${locale}.json`);
  return c.json({ locale, messages: messages.default ?? messages });
});

app.notFound((c) => c.json({ error: "not_found" }, 404));

app.onError((err, c) => {
  console.error("[api error]", err);
  return c.json({ error: "internal_error", message: String(err) }, 500);
});

export const onRequest = app.fetch;
