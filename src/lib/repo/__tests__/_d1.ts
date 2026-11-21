/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — 測試用：以 node:sqlite 模擬 D1，並套用 migrations/*.sql 建出與正式相同的結構
// 需要 Node 22.5+（node:sqlite）。不支援時 createTestDb() 回傳 null，測試會自動略過。
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

class Stmt {
  constructor(sqlite, sql, args = []) {
    this.sqlite = sqlite;
    this.sql = sql;
    this.args = args;
  }
  bind(...args) {
    return new Stmt(this.sqlite, this.sql, args);
  }
  async all() {
    const results = this.sqlite.prepare(this.sql).all(...this.args);
    return { results, success: true, meta: { changes: 0 } };
  }
  async first() {
    return this.sqlite.prepare(this.sql).get(...this.args) ?? null;
  }
  async run() {
    const r = this.sqlite.prepare(this.sql).run(...this.args);
    return { results: [], success: true, meta: { changes: Number(r.changes) } };
  }
}

export async function createTestDb() {
  // vitest 2.x 的 vite-node 不認得 node:sqlite（import 會失敗），所以優先用 getBuiltinModule 直接取內建模組
  const spec = "node:sqlite";
  let mod;
  try {
    mod =
      process.getBuiltinModule?.(spec) ??
      (await import(/* @vite-ignore */ spec));
  } catch (e) {
    console.warn(
      "[repo tests] node:sqlite 不可用，資料庫測試將略過：",
      e?.message ?? e,
    );
    return null;
  }
  if (!mod?.DatabaseSync) {
    console.warn(
      "[repo tests] node:sqlite 不可用（需要 Node 22.5+），資料庫測試將略過",
    );
    return null;
  }
  const sqlite = new mod.DatabaseSync(":memory:");
  const dir = join(process.cwd(), "migrations");
  for (const f of readdirSync(dir)
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    sqlite.exec(readFileSync(join(dir, f), "utf8"));
  }
  const db = {
    prepare: (sql) => new Stmt(sqlite, sql),
    async batch(stmts) {
      sqlite.exec("BEGIN");
      try {
        const out = [];
        for (const s of stmts) out.push(await s.run());
        sqlite.exec("COMMIT");
        return out;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
  return db;
}
