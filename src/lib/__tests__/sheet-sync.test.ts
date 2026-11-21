import { describe, expect, it } from "vitest";
import { findProductRow, parseCsv } from "../sheet-sync";

describe("parseCsv", () => {
  it("handles quotes, commas and newlines inside cells", () => {
    const rows = parseCsv('a,b\n1,"x,y"\n2,"line1\nline2"\n3,"say ""hi"""\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["1", "x,y"],
      ["2", "line1\nline2"],
      ["3", 'say "hi"'],
    ]);
  });

  it("handles CRLF, BOM and a missing trailing newline", () => {
    expect(parseCsv("\uFEFFa,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps empty cells", () => {
    expect(parseCsv("a,b,c\n1,,3\n")).toEqual([
      ["a", "b", "c"],
      ["1", "", "3"],
    ]);
  });
});

const HEADER = "slug,名稱（僅供參考）,zh-Hant 簡介,zh-Hant 描述";

describe("findProductRow", () => {
  it("fills the supported locale and skips blank cells", () => {
    const rows = parseCsv(`${HEADER}\nring-1,戒指,簡介一,"描述一\n第二行"\n`);
    const r = findProductRow(rows, "ring-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fills["zh-Hant"]).toEqual({
      short_description: "簡介一",
      description: "描述一\n第二行",
    });
    expect(r.filled).toBe(2);
    expect(r.missing).toEqual([]);
  });

  it("matches slug with surrounding spaces and any column order", () => {
    const rows = parseCsv("zh-Hant 描述,slug\nhello, ring-2 \n");
    const r = findProductRow(rows, "ring-2");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fills["zh-Hant"]).toEqual({ description: "hello" });
    expect(r.missing).toContain("zh-Hant 簡介");
  });

  it("reports not found / no slug column / empty", () => {
    expect(findProductRow(parseCsv(`${HEADER}\na,,,\n`), "b")).toEqual({
      ok: false,
      error: "not_found",
    });
    expect(findProductRow(parseCsv("name\nx\n"), "x")).toEqual({
      ok: false,
      error: "no_slug_column",
    });
    expect(findProductRow([], "x")).toEqual({ ok: false, error: "empty" });
  });
});
