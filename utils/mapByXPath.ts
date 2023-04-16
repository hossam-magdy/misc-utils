import { mapRecursive } from "./mapRecursive.ts";

// deno-lint-ignore no-explicit-any
type AnyObject = Record<any, any>;
// deno-lint-ignore no-explicit-any
type AnyArray = Array<any>;

type Join<K, P> = K extends string | number
  ? P extends string | number ? `${K}${"" extends P
      //
      ? ""
      : P extends `[]${string}` ? ""
      : "" extends K ? ""
      : "."}${P}`
  : never
  : never;

type XPaths<T, PrevPath extends string | number = ""> =
  | PrevPath
  | (NonNullable<T> extends Array<infer Item>
    ? Join<Join<PrevPath, `[]`>, XPaths<NonNullable<Item>>>
    : T extends AnyObject ? {
        [K in keyof T]: K extends string | number ? K | Join<K, XPaths<T[K]>>
          : never;
      }[keyof T]
    : never);

type GetValueByXPath<
  T,
  SearchXPath extends string,
  CurXPath extends string = ``,
> = T extends Array<infer Item>
  // exact items match
  ? SearchXPath extends Join<CurXPath, "[]"> ? Item
  : GetValueByXPath<Item, SearchXPath, Join<CurXPath, "[]">>
  : T extends AnyObject ? {
      [K in keyof T]: K extends string
        // exact match
        ? SearchXPath extends Join<CurXPath, K> ? T[K]
          // any match
        : ExtractPossibleXPaths<SearchXPath, K> extends string
          // is array
          ? NonNullable<T[K]> extends AnyArray ? GetValueByXPath<
              Extract<T[K], AnyArray>,
              SearchXPath,
              Join<CurXPath, K>
            >
            // is object
          : NonNullable<T[K]> extends AnyObject ? GetValueByXPath<
              Extract<T[K], AnyObject>,
              SearchXPath,
              Join<CurXPath, K>
            >
          : never
        : never
        : never;
    }[keyof T]
  : unknown;

type SetValueByXPathTransformerFnMap<
  T,
  // deno-lint-ignore no-explicit-any
  XPathTransformerFnMap extends Partial<Record<string, (a: any) => unknown>>,
  CurXPath extends string | undefined = "",
> = T extends Array<infer Item>
  ? (Join<CurXPath, "[]"> extends keyof XPathTransformerFnMap
    // exact match of array item
    ? XPathTransformerFnMap[Join<CurXPath, "[]">] extends // deno-lint-ignore no-explicit-any
    (a: any) => infer NewValue ? NewValue
    : Item
    : 
      | Exclude<Item, Extract<Item, AnyObject | AnyArray>>
      | SetValueByXPathTransformerFnMap<
        Extract<Item, AnyObject | AnyArray>,
        XPathTransformerFnMap,
        Join<CurXPath, "[]">
      >)[]
  : T extends AnyObject ? {
      [K in keyof T]: K extends string
        // exact match
        ? Join<CurXPath, K> extends keyof XPathTransformerFnMap
          ? XPathTransformerFnMap[Join<CurXPath, K>] extends // deno-lint-ignore no-explicit-any
          (a: any) => infer NewValue ? NewValue
          : T[K]
          // any match
        : ExtractPossibleXPaths<keyof XPathTransformerFnMap, K> extends string
          ? 
            | Exclude<T[K], Extract<T[K], AnyObject | AnyArray>>
            | SetValueByXPathTransformerFnMap<
              Extract<T[K], AnyObject | AnyArray>,
              XPathTransformerFnMap,
              Join<CurXPath, K>
            >
        : T[K]
        : T[K];
    }
  : T;

type ExtractPossibleXPaths<FromXPaths, Key extends string> = Extract<
  FromXPaths,
  `${Key}${string}`
>;

/** With strict-type for input and result */
export const mapByXPath = <
  T extends AnyObject,
  TransformersMap extends {
    [K in XPaths<T>]?: (v: GetValueByXPath<T, K>) => unknown;
  },
>(
  object: T,
  transformers: TransformersMap,
) => {
  type ResultType = SetValueByXPathTransformerFnMap<T, TransformersMap>;
  return mapRecursive(object, {
    mapValue: ({ value, xPath }) => {
      const transformer = transformers[xPath.join(".") as XPaths<T>];
      return transformer
        ? transformer(value as Parameters<typeof transformer>[0])
        : value;
    },
  }) as ResultType;
};

// //
// // Other possible usages of `mapRecursive`
// //

// import type { SnakeCase } from "https://cdn.skypack.dev/type-fest";
// import { snakeCase } from "https://deno.land/x/lodash_es";

// type NullToUndefined<T> = T extends null ? undefined
//   : T extends AnyObject ? { [K in keyof T]: NullToUndefined<T[K]> }
//   : T;

// /** With strict-type for input and result */
// export const transformNullToUndefined = <T extends AnyObject>(object: T) => {
//   type ResultType = NullToUndefined<T>;
//   return mapRecursive(object, {
//     mapValue: ({ value }) => (value === null ? undefined : value),
//   }) as ResultType;
// };

// //

// /** With strict-type for input and result */
// export const transformKeysToSnakeCase = <T extends AnyObject>(object: T) => {
//   type ResultType = SnakeCase<T>;
//   return mapRecursive(object, {
//     mapKey: ({ key }) => (typeof key === "string" ? snakeCase(key) : key),
//   }) as ResultType;
// };
