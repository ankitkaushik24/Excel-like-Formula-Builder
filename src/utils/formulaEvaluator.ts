import { functions } from '../data/functions';

export class FormulaEvaluator {
  private formula: string;
  private position: number = 0;

  constructor(formula: string) {
    this.formula = formula.trim();
  }

  evaluate(): number {
    const result = this.parseExpression();
    if (this.position < this.formula.length) {
      throw new Error('Unexpected characters after expression');
    }
    return result;
  }

  private parseExpression(): number {
    let result = this.parseTerm();

    while (this.position < this.formula.length) {
      const char = this.formula[this.position];
      if (char !== '+' && char !== '-') break;
      this.position++;
      const term = this.parseTerm();
      result = char === '+' ? result + term : result - term;
    }

    return result;
  }

  private parseTerm(): number {
    let result = this.parseFactor();

    while (this.position < this.formula.length) {
      const char = this.formula[this.position];
      if (char !== '*' && char !== '/') break;
      this.position++;
      const factor = this.parseFactor();
      if (char === '*') {
        result *= factor;
      } else {
        if (factor === 0) throw new Error('Division by zero');
        result /= factor;
      }
    }

    return result;
  }

  private parseFactor(): number {
    this.skipWhitespace();
    
    if (this.position >= this.formula.length) {
      throw new Error('Unexpected end of expression');
    }

    // Handle functions
    if (this.formula[this.position] === '@') {
      return this.parseFunction();
    }

    // Handle parentheses
    if (this.formula[this.position] === '(') {
      this.position++;
      const result = this.parseExpression();
      if (this.position >= this.formula.length || this.formula[this.position] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.position++;
      return result;
    }

    // Handle numbers
    if (/[\d.]/.test(this.formula[this.position])) {
      return this.parseNumber();
    }

    // Handle field references
    if (this.formula[this.position] === '[') {
      return this.parseField();
    }

    throw new Error(`Unexpected character: ${this.formula[this.position]}`);
  }

  private parseFunction(): number {
    this.position++; // Skip @
    const functionName = this.parseFunctionName();
    const fn = functions.find(f => f.name === functionName);
    
    if (!fn) {
      throw new Error(`Unknown function: ${functionName}`);
    }

    if (this.position >= this.formula.length || this.formula[this.position] !== '(') {
      throw new Error('Expected opening parenthesis after function name');
    }
    this.position++; // Skip (

    const args: number[] = [];
    while (this.position < this.formula.length) {
      this.skipWhitespace();
      if (this.formula[this.position] === ')') {
        this.position++;
        break;
      }

      if (args.length > 0) {
        if (this.formula[this.position] !== ',') {
          throw new Error('Expected comma between function arguments');
        }
        this.position++; // Skip ,
      }

      args.push(this.parseExpression());
    }

    return fn.execute(args);
  }

  private parseFunctionName(): string {
    let name = '';
    while (this.position < this.formula.length && /[A-Z_]/.test(this.formula[this.position])) {
      name += this.formula[this.position];
      this.position++;
    }
    return name;
  }

  private parseNumber(): number {
    let numStr = '';
    while (this.position < this.formula.length && /[\d.]/.test(this.formula[this.position])) {
      numStr += this.formula[this.position];
      this.position++;
    }
    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }
    return num;
  }

  private parseField(): number {
    const start = this.position;
    while (this.position < this.formula.length && this.formula[this.position] !== ']') {
      this.position++;
    }
    if (this.position >= this.formula.length) {
      throw new Error('Unterminated field reference');
    }
    this.position++; // Skip ]
    return parseFloat(this.formula.slice(start, this.position));
  }

  private skipWhitespace(): void {
    while (this.position < this.formula.length && /\s/.test(this.formula[this.position])) {
      this.position++;
    }
  }
}