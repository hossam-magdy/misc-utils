import { formatNumber } from "./formatNumber.ts";
import { assertEquals } from "https://deno.land/std@0.117.0/testing/asserts.ts";

Deno.test("Adds thousand separator for integers", () => {
  const actual = formatNumber(2_500);
  const expected = "2,500";
  assertEquals(actual, expected);
});

Deno.test("Adds multiple thousand separators for huge integers", () => {
  const actual = formatNumber(2_500_000_090);
  const expected = "2,500,000,090";
  assertEquals(actual, expected);
});

Deno.test("Adds thousand separator for floats", () => {
  const actual = formatNumber(2_500.001);
  const expected = "2,500.001";
  assertEquals(actual, expected);
});

Deno.test({
  ignore: true, // TODO: currently "2,500,000,000.1,234,565"
  name: "Adds multiple thousand separators for huge floats",
  fn: () => {
    const actual = formatNumber(2_500_000_000.1234567);
    const expected = "2,500,000,000.1234567";
    assertEquals(actual, expected);
  },
});

Deno.test("Rounds to the decimal places requested, ceil", () => {
  const actual = formatNumber(2_500.424741, 3);
  const expected = "2,500.425";
  assertEquals(actual, expected);
});

Deno.test("Rounds to the decimal places requested, floor", () => {
  const actual = formatNumber(2_500.424381, 3);
  const expected = "2,500.424";
  assertEquals(actual, expected);
});
