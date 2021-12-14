type AnyFunction = (...args: any[]) => any;

type CallbackItem<Fn extends AnyFunction> = {
  callback: Fn;
  onlyOnce: boolean;
};

type CallbackOptions = { onlyOnce?: boolean };

/**
 * Stores collection of callbacks to be all invoked when needed.
 * Each callback can be configured to be invoked "onlyOnce" or not
 *
 * Example:
 * ```ts
 * const myEventCallbacks = new CallbackCollection();
 *
 * myEventCallbacks.add(function someCallback1(arg) {});
 * myEventCallbacks.add(function someCallback2(arg) {}, { onlyOnce: true });
 * myEventCallbacks.add(function someCallback3(arg) {});
 *
 * // ... In some event
 * myEventCallbacks.invoke(arg); // Calls all 3: `someCallback1`, `someCallback2`, and `someCallback3`
 *
 * // If the same event happens again, or `.invoke` was called again,
 * //  `someCallback2` will NOT be called again, because it is configured "onlyOnce"
 * ```
 */
export class CallbackCollection<Fn extends AnyFunction> {
  private collection = new Set<CallbackItem<Fn>>();

  constructor(initialCb?: Fn, options?: CallbackOptions) {
    if (initialCb) {
      this.add(initialCb, options);
    }
  }

  add = (callback: Fn, { onlyOnce = false }: CallbackOptions = {}) =>
    this.collection.add({ callback, onlyOnce });

  addOnlyOnce = (callback: Fn) => this.add(callback, { onlyOnce: true });

  clear = () => this.collection.clear();

  delete = (callback: Fn) => {
    let callbackItem;
    this.collection.forEach((i) => {
      if (i.callback === callback) {
        callbackItem = i;
      }
    });
    if (callbackItem) {
      this.collection.delete(callbackItem);
    }
  };

  invoke = (...args: Parameters<Fn>): ReturnType<Fn>[] => {
    const returnVals = [] as ReturnType<Fn>[];
    this.collection.forEach((item) => {
      const returnedPossiblePromise = item.callback(...args);
      // Remove the transiet callback, if it's result is NOT boolean false
      Promise.resolve(returnedPossiblePromise).then((returnVal) => {
        returnVals.push(returnVal);
        const isFulfilled =
          typeof returnVal !== 'boolean' || returnVal !== false;
        if (item.onlyOnce && isFulfilled) {
          this.collection.delete(item);
        }
      });
    });
    return returnVals;
  };

  get size() {
    return this.collection.size;
  }
}
