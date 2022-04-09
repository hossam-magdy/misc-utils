import { statistics } from './statistics.ts';

/**
 * Example: benchmark(someFunction, 100_000).show();
 */
export const benchmark = (cb: (...args: unknown[]) => unknown, times = 1000) => {
  const stats = statistics();
  for (let i = 0; i < times; i++) {
    const start = window.performance.now();
    cb();
    const end = window.performance.now();
    stats.add(end - start);
  }
  return stats;
};
