export const throttle = <IArg>(
  wait: number = 100,
  fn: (...arg: IArg[]) => any
): ((...args: IArg[]) => void) => {
  let inThrottle: boolean;
  let lastTimeout: ReturnType<typeof setTimeout>;
  let lastTime: number;
  return function (this: any) {
    const context = this;
    const args = arguments as unknown as IArg[];
    if (!inThrottle) {
      fn.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastTimeout);
      lastTimeout = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
};
