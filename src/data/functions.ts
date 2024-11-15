export const functions = [
  {
    name: 'SUM',
    description: 'Adds all the numbers',
    example: 'SUM(revenue, costs)',
    execute: (...args: number[]) => args.reduce((a, b) => a + b, 0),
  },
  {
    name: 'AVERAGE',
    description: 'Calculates the arithmetic mean',
    example: 'AVERAGE(revenue, costs, profit_margin)',
    execute: (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
  },
  {
    name: 'MAX',
    description: 'Returns the largest value',
    example: 'MAX(revenue, costs)',
    execute: (...args: number[]) => Math.max(...args),
  },
  {
    name: 'MIN',
    description: 'Returns the smallest value',
    example: 'MIN(revenue, costs)',
    execute: (...args: number[]) => Math.min(...args),
  },
  {
    name: 'ROUND',
    description: 'Rounds a number to specified decimals',
    example: 'ROUND(profit_margin, 2)',
    execute: (...args: number[]) => Number(args[0].toFixed(args[1] || 0)),
  },
  {
    name: 'IF',
    description: 'Returns value1 if condition is true, value2 if false',
    example: 'IF(profit_margin > 0.2, 100, 50)',
    execute: (...args: number[]) => args[0] ? args[1] : args[2],
  },
  {
    name: 'MROUND',
    description: 'Rounds to the nearest multiple',
    example: 'MROUND(revenue, 1000)',
    execute: (...args: number[]) => {
      const [number, multiple] = args;
      if (multiple === 0) return 0;
      const ratio = number / multiple;
      return Math.round(ratio) * multiple;
    },
  },
  {
    name: 'TO_PERCENT',
    description: 'Converts decimal to percentage',
    example: 'TO_PERCENT(profit_margin)',
    execute: (...args: number[]) => args[0] * 100,
  },
  {
    name: 'LOOKUP',
    description: 'Returns value from a range based on index',
    example: 'LOOKUP(1, revenue, costs, profit_margin)',
    execute: (...args: number[]) => {
      const [index, ...values] = args;
      const lookupIndex = Math.floor(index);
      if (lookupIndex < 0 || lookupIndex >= values.length) {
        throw new Error('LOOKUP index out of range');
      }
      return values[lookupIndex];
    },
  },
  {
    name: 'DATEDIF',
    description: 'Calculates difference between dates in specified unit',
    example: 'DATEDIF(1677648000000, 1693526400000, "M")',
    execute: (...args: number[]) => {
      const [start, end, unit = 'D'] = args;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      
      switch (String(unit).toUpperCase()) {
        case 'Y':
          return endDate.getFullYear() - startDate.getFullYear();
        case 'M':
          return (
            (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth())
          );
        case 'D':
        default:
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    },
  },
];

functions.forEach(fn => {
  window[fn.name] = fn.execute;
});

export const operators = [
  { symbol: '+', precedence: 1 },
  { symbol: '-', precedence: 1 },
  { symbol: '*', precedence: 2 },
  { symbol: '/', precedence: 2 },
  { symbol: '^', precedence: 3 },
];