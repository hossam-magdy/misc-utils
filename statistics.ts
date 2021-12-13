interface Stats {
  avg: number;
  count: number;
  max: number;
  min: number;
  sd: number;
  total: number;
  variance: number;

  add: (newElement: number) => Stats;
  show: (pretty?: boolean) => void;
}

/**
 * Cumulatively calculate:
 * Average/Mean (μ), Max, Min, Sum/Total, Variance, and StandardDeviation (SD or σ)
 * For any kind of numbers or data points: time, temperature, dollars, … etc.
 *
 * Why calculate them? … Sometimes the average is not enough data indication, especially if few sample points diverge away.
 * Why cumulatively? … In many situations, not all points are available from the beginning.
 * What is the Standard Deviation? … https://en.wikipedia.org/wiki/Standard_deviation
 *
 * Use cases:
 * - Benchmarking heavy process or calculations
 * - Calculating render duration
 * - Analysing stream of numbers (http, stdIn, database, WebSocket, …)
 *
 * Example 1, for [1,2,0]:
 * ```
 * const myStats = statistics();
 * myStats.add(1); // myStats.avg === 1
 * myStats.add(2); // myStats.avg === 1.5
 * myStats.add(0); // myStats.avg === 0.75
 * // prints string: {"avg":1,"max":2,"min":0,"sd":0.816496580927726,"count":3,"total":3,"variance":0.6666666666666666}
 * myStats.show();
 * ```
 *
 * Example 2, for [1,0,2]:
 * ```
 * // prints string: {"avg":1,"max":2,"min":0,"sd":0.816496580927726,"count":3,"total":3,"variance":0.6666666666666666}
 * statistics(1).add(0).add(2).show();
 * ```
 */
export const statistics = (newElement?: number, oldStats?: Stats): Stats => {
  //#region initialization
  const stats: Stats = oldStats || {
    avg: 0,
    max: 0,
    min: 0,
    sd: 0,
    count: 0,
    total: 0,
    variance: 0,
    add: (elem) => statistics(elem, stats),
    show: (pretty) =>
      console.log(
        pretty ? JSON.stringify(stats, null, 4) : JSON.stringify(stats)
      ),
  };
  if (typeof newElement !== 'number') return stats;
  //#endregion

  // extracting old/current stat values
  const { avg, count, max, min, total, variance } = stats;

  //#region calculate new stat values
  stats.count++;
  stats.total = total + newElement;
  stats.min = count === 0 ? newElement : Math.min(min, newElement);
  stats.max = count === 0 ? newElement : Math.max(max, newElement);
  stats.avg = (total + newElement) / stats.count;
  stats.variance =
    (count * variance + (newElement - stats.avg) * (newElement - avg)) /
    stats.count;
  stats.sd = Math.sqrt(stats.variance);
  //#endregion

  return stats;
};
// statistics(1).add(2).show();

export const testStatistics = () => {
  const actual: any = statistics(1).add(2);
  const expected: any = {
    avg: 1.5,
    count: 2,
    max: 2,
    min: 1,
    sd: 0.5,
    total: 3,
    variance: 0.25,
  };
  for (const k in expected) {
    if (actual[k] === expected[k])
      console.log(`"${k}" is correctly calculated`);
    else
      console.error(
        `"${k}" is NOT correctly calculated; Expected "${expected[k]}", found "${actual[k]}"`
      );
  }
};
// testStatistics();
