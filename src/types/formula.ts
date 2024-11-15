export type Field = {
  id: string;
  name: string;
  value: number;
};

export type FormulaError = {
  message: string;
  position: number;
};

export type Suggestion = {
  label: string;
  value: string;
  type: 'function' | 'field' | 'operator';
  description: string;
};