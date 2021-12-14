import { statistics } from "./statistics.ts";
import { assertObjectMatch } from "https://deno.land/std@0.117.0/testing/asserts.ts";

Deno.test("Calculates stats (avg, sd, var, … etc), for [1,2]", () => {
  const actual = statistics(1).add(2);
  const expected = {
    avg: 1.5,
    count: 2,
    max: 2,
    min: 1,
    sd: 0.5,
    total: 3,
    variance: 0.25,
  };

  assertObjectMatch(actual, expected);
});

Deno.test("Calculates stats (avg, sd, var, … etc), for [1,2,0]", () => {
  const actual = statistics();
  actual.add(1);
  actual.add(2);
  actual.add(0);
  const expected = {
    avg: 1,
    count: 3,
    max: 2,
    min: 0,
    sd: 0.816496580927726,
    total: 3,
    variance: 0.6666666666666666,
  };

  assertObjectMatch(actual, expected);
});
