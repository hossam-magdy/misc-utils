// This implementation is faster than `.toLocaleString()`, 'numeral' package, and other regexes
// This function used to be the bottleneck of JS execution
export const formatNumber = (n: number, decimalPlaces?: number) => {
  return (
    decimalPlaces === undefined
      ? `${n}`
      : decimalPlaces === 0
      ? `${Math.round(n)}`
      : n.toFixed(decimalPlaces)
  ).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
