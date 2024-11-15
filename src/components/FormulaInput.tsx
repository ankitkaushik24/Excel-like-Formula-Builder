import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown, HelpCircle } from 'lucide-react';
import { Field, Suggestion, FormulaError } from '../types/formula';
import { fields } from '../data/fields';
import { functions, operators } from '../data/functions';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onError: (error: FormulaError | null) => void;
}

export function FormulaInput({ value, onChange, onError }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionStart, setSuggestionStart] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const getSuggestions = (text: string, position: number): [Suggestion[], number] => {
    const beforeCursor = text.slice(0, position);
    const currentWord = getCurrentWord(beforeCursor);
    const suggestions: Suggestion[] = [];
    const start = position - currentWord.length;

    if (!currentWord) return [[], start];

    const searchTerm = currentWord.toLowerCase();

    // Add function suggestions
    functions.forEach(fn => {
      if (fn.name.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          label: fn.name,
          value: fn.example,
          type: 'function',
          description: fn.description
        });
      }
    });

    // Add field suggestions
    fields.forEach(field => {
      if (field.name.toLowerCase().includes(searchTerm) || 
          field.id.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          label: field.name,
          value: field.id,
          type: 'field',
          description: `Current value: ${field.value}`
        });
      }
    });

    // Add operator suggestions
    operators.forEach(op => {
      if (op.symbol.includes(searchTerm)) {
        suggestions.push({
          label: op.symbol,
          value: op.symbol,
          type: 'operator',
          description: `Operator (precedence: ${op.precedence})`
        });
      }
    });

    return [suggestions, start];
  };

  const getCurrentWord = (text: string): string => {
    const words = text.split(/[\s(),+\-*/^]/);
    return words[words.length - 1];
  };

  const updateSignature = (text: string, position: number) => {
    const beforeCursor = text.slice(0, position);
    const match = beforeCursor.match(/(\w+)\s*\([^)]*$/);
    
    if (match) {
      const fnName = match[1];
      const fn = functions.find(f => f.name === fnName);
      if (fn) {
        setSignature(`${fn.name}: ${fn.description}\nExample: ${fn.example}`);
        return;
      }
    }
    setSignature(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((selectedIndex + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((selectedIndex - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    }
  };

  const insertSuggestion = (suggestion: Suggestion) => {
    const beforeSuggestion = value.slice(0, suggestionStart);
    const afterCursor = value.slice(cursorPosition);
    const newValue = beforeSuggestion + suggestion.value + afterCursor;
    onChange(newValue);
    setSuggestions([]);
    
    const newPosition = suggestionStart + suggestion.value.length;
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = newPosition;
        inputRef.current.selectionEnd = newPosition;
        inputRef.current.focus();
      }
    }, 0);
  };

  const validateFormula = (formula: string) => {
    try {
      let brackets = 0;
      
      for (let i = 0; i < formula.length; i++) {
        const char = formula[i];
        if (char === '(') brackets++;
        if (char === ')') brackets--;

        if (brackets < 0) {
          onError({ message: 'Unexpected closing bracket', position: i });
          return;
        }
      }

      if (brackets > 0) {
        onError({ message: 'Missing closing bracket', position: formula.length });
        return;
      }

      onError(null);
    } catch (error) {
      onError({ message: 'Invalid formula', position: 0 });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart;
    onChange(newValue);
    setCursorPosition(newPosition);
    
    const [newSuggestions, suggestionStartPos] = getSuggestions(newValue, newPosition);
    setSuggestions(newSuggestions);
    setSuggestionStart(suggestionStartPos);
    setSelectedIndex(0);
    updateSignature(newValue, newPosition);
  };

  useEffect(() => {
    validateFormula(value);
  }, [value]);

  useEffect(() => {
    if (highlightRef.current) {
      const highlighted = Prism.highlight(value, Prism.languages.javascript, 'javascript');
      highlightRef.current.innerHTML = highlighted;
    }
  }, [value]);

  return (
    <div className="relative">
      <div className="relative font-mono">
        <pre
          ref={highlightRef}
          className="absolute top-0 left-0 right-0 bottom-0 p-3 pointer-events-none overflow-hidden whitespace-normal text-sm bg-transparent"
          aria-hidden="true"
        />
        <textarea
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full h-24 p-3 font-mono text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-transparent bg-transparent relative"
          placeholder="Start typing to see suggestions..."
          style={{ caretColor: 'black' }}
        />
      </div>

      {signature && (
        <div className="absolute right-0 top-full mt-2 bg-gray-800 text-white p-3 rounded-lg shadow-lg z-20 max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span className="font-medium">Function Signature</span>
          </div>
          <pre className="text-sm whitespace-pre-wrap">{signature}</pre>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.label}`}
              className={`p-2 cursor-pointer hover:bg-blue-50 ${
                index === selectedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => insertSuggestion(suggestion)}
            >
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  suggestion.type === 'function' ? 'bg-purple-100 text-purple-800' :
                  suggestion.type === 'field' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {suggestion.type}
                </span>
                <span className="font-medium">{suggestion.label}</span>
                <span className="text-sm text-gray-500">{suggestion.description}</span>
              </div>
              {index === selectedIndex && <ArrowDown className="w-4 h-4 text-blue-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}