import { assertEquals } from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { mapByXPath } from "./mapByXPath.ts";

// Using `getActual` to use typings of the input parameters of `mapByXPath`

const TEST_CASES = [
  {
    description: "changes key, by checking key",
    getActual: () => {
      return mapByXPath(
        { a: 1, b: 2, c: { d: 3 } },
        {
          "c.d": (value) => value * 1000,
          b: () => "NewValue",
        },
      );
    },
    expected: { a: 1, b: "NewValue", c: { d: 3_000 } },
  },

  {
    description:
      "updates value based on xpath transformers map, for deeply-nested values",
    getActual: () => {
      return mapByXPath(
        {
          a: 1,
          b: 2,
          c: {
            d: {
              level3: {
                level4: [
                  {
                    level6: [
                      [
                        {
                          level9: 10,
                        },
                      ],
                      [
                        {
                          level9: 10,
                        },
                      ],
                    ],
                  },
                ],
              },
            },
            e: 5,
          },
        },
        {
          "c.d.level3.level4[].level6[][].level9": (value) => value * 2,
          "c.e": (_value) => ({ addedObject: true }),
        },
      );
    },
    expected: {
      a: 1,
      b: 2,
      c: {
        d: {
          level3: {
            level4: [
              {
                level6: [
                  [
                    {
                      level9: 20,
                    },
                  ],
                  [
                    {
                      level9: 20,
                    },
                  ],
                ],
              },
            ],
          },
        },
        e: {
          addedObject: true,
        },
      },
    },
  },
];

for (const testCase of TEST_CASES) {
  Deno.test(testCase.description, () => {
    assertEquals(testCase.getActual(), testCase.expected);
  });
}
