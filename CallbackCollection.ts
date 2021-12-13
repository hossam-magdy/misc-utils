type Callback<I = unknown, O = unknown> = (arg: I) => O;

type CallbackItem<I = unknown, O = unknown> = {
  callback: Callback<I, O>;
  onlyOnce: boolean;
};

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
export class CallbackCollection<I = undefined, O = unknown> {
  private collection = new Set<CallbackItem<I, O>>();

  add(
    callback: Callback<I, O>,
    { onlyOnce = false }: { onlyOnce?: boolean } = {},
  ) {
    this.collection.add({ callback, onlyOnce });
  }

  addOnlyOnce(callback: Callback<I, O>) {
    this.add(callback, { onlyOnce: true });
  }

  clear() {
    this.collection.clear();
  }

  delete(callback: Callback<I, O>) {
    let callbackItem;
    this.collection.forEach((i) => {
      if (i.callback === callback) {
        callbackItem = i;
      }
    });
    if (callbackItem) {
      this.collection.delete(callbackItem);
    }
  }

  invoke<T>(arg: I, self?: T) {
    this.collection.forEach((item) => {
      const returnedPossiblePromise = item.callback.call(self, arg);
      // Remove the transiet callback, if it's result is NOT boolean false
      Promise.resolve(returnedPossiblePromise).then((returnedValue) => {
        const isFulfilled = typeof returnedValue !== "boolean" ||
          returnedValue !== false;
        if (item.onlyOnce && isFulfilled) {
          this.collection.delete(item);
        }
      });
    });
  }

  get size() {
    return this.collection.size;
  }
}
