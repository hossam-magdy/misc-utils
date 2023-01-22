interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  timer?: ReturnType<typeof setTimeout>;
}

export const createDeferredPromise = <T>(
  timeout?: number,
): DeferredPromise<T> => {
  const deferred: Partial<DeferredPromise<T>> = {};
  deferred.promise = new Promise<T>((resolve, reject) => {
    deferred.timer = timeout !== undefined
      ? setTimeout(() => {
        reject(undefined);
      }, timeout)
      : undefined;
    deferred.resolve = (value) => {
      clearTimeout(deferred.timer);
      return resolve(value);
    };
    deferred.reject = (value) => {
      clearTimeout(deferred.timer);
      return reject(value);
    };
  });
  return deferred as DeferredPromise<T>;
};
