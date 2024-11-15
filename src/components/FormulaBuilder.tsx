import React, { useState } from 'react';
import { Calculator, Function, Database, Plus } from 'lucide-react';
import { FormulaInput } from './FormulaInput';
import { FormulaError } from '../types/formula';
import { fields } from '../data/fields';
import { functions } from '../data/functions';
import { FormulaEvaluator } from '../utils/formulaEvaluator';

export function FormulaBuilder() {
  const [formula, setFormula] = useState('');
  const [error, setError] = useState<FormulaError | null>(null);
  const [calculationError, setCalculationError] = useState(null);
  const [result, setResult] = useState<number | null>(null);

  const evaluateFormula = (formula: string): number => {
    try {
      let evaluatedFormula = formula;
      fields.forEach(field => {
        const regex = new RegExp(field.id, 'g');
        evaluatedFormula = evaluatedFormula.replace(regex, field.value.toString());
      });

      return eval(evaluatedFormula);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invalid formula');
    }
  };

  const handleFormulaChange = (newFormula: string) => {
    setFormula(newFormula);
    try {
        const value = evaluateFormula(newFormula);
        setResult(isFinite(value) ? value : null);
        setCalculationError(null);
      } catch(e) {
        setResult(null);
      setCalculationError(e?.message || e);
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Calculator className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Smart Formula Builder</h2>
          <p className="mt-2 text-gray-600">Intelligent suggestions as you type</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-medium text-gray-700">Available Fields</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="bg-green-50 p-2 rounded-md text-sm border border-green-100"
                  >
                    <div className="font-medium text-green-800">{field.name}</div>
                    <div className="text-green-600">ID: {field.id}</div>
                    <div className="text-green-600">Value: {field.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-medium text-gray-700">Available Functions</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {functions.slice(0, 4).map((fn) => (
                  <div
                    key={fn.name}
                    className="bg-purple-50 p-2 rounded-md text-sm border border-purple-100"
                  >
                    <div className="font-medium text-purple-800">{fn.name}</div>
                    <div className="text-purple-600">{fn.description}</div>
                  </div>
                ))}
                <div className="bg-purple-50 p-2 rounded-md text-sm border border-purple-100 text-center">
                  <Plus className="w-4 h-4 text-purple-500 inline" />
                  <span className="text-purple-600 ml-1">{functions.length - 4} more functions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formula Editor
            </label>
            <FormulaInput
              value={formula}
              onChange={handleFormulaChange}
              onError={setError}
            />
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                Error at position {error.position}: {error.message}
              </div>
            )}
            {calculationError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                {calculationError?.toString()}
              </div>
            )}
          </div>

          {result !== null && !error && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-md">
              <div className="text-sm text-blue-700 font-medium">Result</div>
              <div className="text-2xl font-bold text-blue-900">{result}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Examples</h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { title: 'Basic Calculation', formula: 'revenue - costs' },
              { title: 'Profit Analysis', formula: 'IF(profit_margin < 0.2, "Low", "Good")' },
              { title: 'Tax Calculation', formula: 'MROUND(revenue * tax_rate, 100)' },
              { title: 'Percentage View', formula: 'TO_PERCENT(profit_margin)' }
            ].map((example) => (
              <div
                key={example.title}
                className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setFormula(example.formula)}
              >
                <div className="font-medium text-gray-800">{example.title}</div>
                <code className="text-sm text-gray-600">{example.formula}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}