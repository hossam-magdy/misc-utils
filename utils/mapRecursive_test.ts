import { assertEquals } from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { mapRecursive } from "./mapRecursive.ts";

type TestCase = {
  description: string;
  in: Record<string, unknown>;
  out: Record<string, unknown>;
  options: Parameters<typeof mapRecursive>[1];
};

const TEST_CASES: TestCase[] = [
  {
    description: "changes key, by checking key",
    in: { oldKey: 1, z: 2 },
    out: { newKey: 1, z: 2 },
    options: {
      mapKey: ({ key }) => (key === "oldKey" ? "newKey" : key),
    },
  },
  {
    description: "changes key, by checking value",
    in: { oldKey: 1, z: 2 },
    out: { newKey: 1, z: 2 },
    options: {
      mapKey: ({ key, value }) => (value === 1 ? "newKey" : key),
    },
  },
  {
    description: "changes key, by checking xPath",
    in: { a: { oldKey: 1, b: 3 }, z: 2 },
    out: { a: { newKey: 1, b: 3 }, z: 2 },
    options: {
      mapKey: (
        { key, xPath },
      ) => (xPath.join(".") === "a.oldKey" ? "newKey" : key),
    },
  },

  {
    description: "changes value, by checking key",
    in: { a: "oldValue", z: 2 },
    out: { a: "newValue", z: 2 },
    options: {
      mapValue: ({ key, value }) => (key === "a" ? "newValue" : value),
    },
  },
  {
    description: "changes value, by checking value",
    in: { a: "oldValue", z: 2 },
    out: { a: "newValue", z: 2 },
    options: {
      mapValue: ({ value }) => (value === "oldValue" ? "newValue" : value),
    },
  },
  {
    description: "changes value, by checking xPath",
    in: { a: { a: "oldValue", b: 3 }, z: 2 },
    out: { a: { a: "newValue", b: 3 }, z: 2 },
    options: {
      mapValue: (
        { value, xPath },
      ) => (xPath.join(".") === "a.a" ? "newValue" : value),
    },
  },

  {
    description: "changes both key and value, by checking key",
    in: { oldKey: "oldValue", z: 2 },
    options: {
      mapKey: ({ key }) => (key === "oldKey" ? "newKey" : key),
      mapValue: ({ key, value }) => (key === "oldKey" ? "newValue" : value),
    },
    out: { newKey: "newValue", z: 2 },
  },
  {
    description: "changes both key and value, by checking value",
    in: { oldKey: "oldValue", z: 2 },
    out: { newKey: "newValue", z: 2 },
    options: {
      mapKey: ({ key, value }) => (value === "oldValue" ? "newKey" : key),
      mapValue: ({ value }) => (value === "oldValue" ? "newValue" : value),
    },
  },
  {
    description: "changes both key and value, by checking xPath",
    in: {
      a: {
        oldKey: "oldValue",
        b: 3,
      },
      z: 2,
    },
    out: {
      a: {
        newKey: "newValue",
        b: 3,
      },
      z: 2,
    },
    options: {
      mapKey: (
        { key, xPath },
      ) => (xPath.join(".") === "a.oldKey" ? "newKey" : key),
      mapValue: (
        { value, xPath },
      ) => (xPath.join(".") === "a.oldKey" ? "newValue" : value),
    },
  },

  {
    description: "changes keys and values for deeply nested items inside array",
    in: {
      a: {
        b: [
          {
            c: 1,
            oldKey: "someValue",
            d: "oldValue",
            dynamicValue: 10,
          },
          {
            c: 1,
            oldKey: "someValue",
            d: "oldValue",
            dynamicValue: 20,
          },
        ],
      },
      z: 2,
    },
    out: {
      a: {
        b: [
          {
            c: 1,
            newKey: "someValue",
            d: "newValue",
            dynamicValue: 10_000,
          },
          {
            c: 1,
            newKey: "someValue",
            d: "newValue",
            dynamicValue: 20_000,
          },
        ],
      },
      z: 2,
    },
    options: {
      mapKey: (
        { key, xPath },
      ) => (xPath.join(".") === "a.b[].oldKey" ? "newKey" : key),
      mapValue: ({ value, xPath }) =>
        value === "oldValue"
          ? "newValue"
          : xPath.join(".") === "a.b[].dynamicValue"
          ? (value as number) * 1000
          : value,
    },
  },

  {
    description: "can replace primitive array items",
    in: {
      a: {
        b: [1, 2],
      },
      z: 2,
    },
    out: {
      a: {
        b: [1_000, 2_000],
      },
      z: 2,
    },
    options: {
      mapValue: ({ value, xPath }) => {
        return xPath.join(".") === "a.b[]" ? (value as number) * 1000 : value;
      },
    },
  },

  {
    description: "can replace object array items with nested objects",
    in: { a: { b: [{ a: 10 }, { b: 10 }] }, z: 2 },
    out: { a: { b: [{ c: 0 }, { c: 1 }] }, z: 2 },
    options: {
      mapValue: ({ key, value, xPath }) => {
        return xPath.join(".") === "a.b[]" ? { c: key } : value;
      },
    },
  },

  {
    description: "can replace object array items with primitive values",
    in: { a: { b: [{ a: 10 }, { b: 10 }] }, z: 2 },
    out: { a: { b: ["ITEM_0", "ITEM_1"] }, z: 2 },
    options: {
      mapValue: ({ key, value, xPath }) => {
        return xPath.join(".") === "a.b[]" ? `ITEM_${String(key)}` : value;
      },
    },
  },

  {
    description: "can replace object array items with primitive values",
    in: { a: { b: [{ a: 10 }, { b: 10 }] }, z: 2 },
    out: { a: { b: ["REMOVED_ITEM", { b: 10 }] }, z: 2 },
    options: {
      mapValue: ({ key, value, xPath }) => {
        return xPath.join(".") === "a.b[]" && key === 0
          ? "REMOVED_ITEM"
          : value;
      },
    },
  },

  {
    description: "can replace items in nested arrays",
    in: {
      a: {
        b: [
          [1, 2],
          [3, 4],
        ],
      },
      z: 2,
    },
    out: {
      a: {
        b: [
          [2, 4],
          [6, 8],
        ],
      },
      z: 2,
    },
    options: {
      mapValue: ({ value, xPath }) => {
        return xPath.join(".") === "a.b[][]" ? (value as number) * 2 : value;
      },
    },
  },

  {
    description: "can remove full object",
    in: {
      a: [
        {
          b: {
            c: "theWholeObjectShouldBeRemoved 1",
          },
          d: 2,
        },
        {
          b: {
            c: "theWholeObjectShouldBeRemoved 2",
          },
          d: 3,
        },
      ],
      z: 2,
    },
    out: {
      a: [
        {
          b: undefined,
          d: 2,
        },
        {
          b: undefined,
          d: 3,
        },
      ],
      z: 2,
    },
    options: {
      mapValue: ({ key, value }) => (key === "b" ? undefined : value),
    },
  },

  {
    description: "can add full object, and iterate over it",
    in: {
      a: [
        {
          b: undefined,
          d: 2,
        },
        {
          b: undefined,
          d: 3,
        },
      ],
      z: 2,
    },
    out: {
      a: [
        {
          b: {
            c: "theWholeObjectShouldBeAdded_andModified",
          },
          d: 2,
        },
        {
          b: {
            c: "theWholeObjectShouldBeAdded_andModified",
          },
          d: 3,
        },
      ],
      z: 2,
    },
    options: {
      mapValue: ({ key, value }) =>
        key === "b"
          ? { c: "theWholeObjectShouldBeAdded" }
          : value === "theWholeObjectShouldBeAdded"
          ? "theWholeObjectShouldBeAdded_andModified"
          : value,
    },
  },

  {
    description: "does not change items inside array, if `skipArrays` is true",
    in: {
      a: [
        { b: 1, d: 2 },
        { b: 1, d: 3 },
      ],
      b: undefined,
      z: 2,
    },
    out: {
      a: [
        { b: 1, d: 2 },
        { b: 1, d: 3 },
      ],
      b: "newValue",
      z: 2,
    },
    options: {
      mapValue: ({ key, value }) => (key === "b" ? "newValue" : value),
      skipArrays: true,
    },
  },
];

for (const testCase of TEST_CASES) {
  Deno.test(testCase.description, () => {
    assertEquals(mapRecursive(testCase.in, testCase.options), testCase.out);
  });
}
