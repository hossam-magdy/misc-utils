type AnyKey = string | number | symbol;
type AnyValue = unknown;
type MapFnParams = {
  /** `key` before transformation. If inside array iteration, the key is the item index in the array (xPath is ending with "[]") */
  key: AnyKey;
  /** `value` before transformation */
  value: AnyValue;
  /** `key[]` before transformation. If inside array iteration, xPath is ending with "[]" */
  xPath: AnyKey[];
};

interface Options {
  mapKey?: (params: MapFnParams) => AnyKey;
  mapValue?: (params: MapFnParams) => AnyValue;
  /** Whether to check array items or to stop the depth of checking at array */
  skipArrays?: boolean;
}

const getNewXPathForArrayItem = (xPath: AnyKey[]) => {
  const xPathCloned = [...xPath];
  const last = `${String(xPathCloned.pop())}[]`;
  return [...xPathCloned, last];
};

export const mapRecursive = <O, I>(
  input: I,
  { mapKey, mapValue, skipArrays }: Options,
  xPath: AnyKey[] = [],
): O => {
  if (Array.isArray(input)) {
    if (skipArrays) {
      return input as unknown as O;
    }
    const newXPath = getNewXPathForArrayItem(xPath);
    return input.map((item, index) => {
      return mapRecursive(
        mapValue
          ? mapValue({ key: index, value: item, xPath: newXPath })
          : item,
        {
          mapKey,
          mapValue,
          skipArrays,
        },
        newXPath,
      );
    }) as unknown as O;
  }

  if (typeof (input) === "object" && input !== null) {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]): [AnyKey, AnyValue] => {
        const newXPath = [...xPath, key];
        return [
          mapKey ? mapKey({ key, value, xPath: newXPath }) : key,
          mapRecursive(
            mapValue ? mapValue({ key, value, xPath: newXPath }) : value,
            {
              mapKey,
              mapValue,
              skipArrays,
            },
            newXPath,
          ),
        ];
      }),
    ) as O;
  }

  return input as unknown as O;
};
