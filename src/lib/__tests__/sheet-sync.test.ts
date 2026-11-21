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

const HEADER =
  "slug,名称（仅供参考）,zh-Hans 简介,zh-Hans 描述,en 简介,en 描述,ms-MY 简介,ms-MY 描述,id-ID 简介,id-ID 描述";

describe("findProductRow", () => {
  it("fills four locales and skips blank cells", () => {
    const rows = parseCsv(
      `${HEADER}\nring-1,戒指,简介一,"描述一\n第二行",short en,desc en,,desc ms,,\n`,
    );
    const r = findProductRow(rows, "ring-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fills["zh-Hans"]).toEqual({
      short_description: "简介一",
      description: "描述一\n第二行",
    });
    expect(r.fills.en).toEqual({
      short_description: "short en",
      description: "desc en",
    });
    expect(r.fills["ms-MY"]).toEqual({ description: "desc ms" });
    expect(r.fills["id-ID"]).toBeUndefined();
    expect(r.filled).toBe(5);
    expect(r.missing).toEqual([]);
  });

  it("matches slug with surrounding spaces and any column order", () => {
    const rows = parseCsv("zh-Hans 描述,slug\nhello, ring-2 \n");
    const r = findProductRow(rows, "ring-2");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fills["zh-Hans"]).toEqual({ description: "hello" });
    expect(r.missing).toContain("en 描述");
  });

  it("reports not found / no slug column / empty", () => {
    expect(findProductRow(parseCsv(`${HEADER}\na,,,,,,,,,\n`), "b")).toEqual({
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
