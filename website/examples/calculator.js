import { html } from 'uhtml';
import { val, calc, register, hydrate } from '../front.esm.js';

/**
 * Calculator Component
 * Demonstrates:
 * - Fine-grained reactivity with val()
 * - Derived state with calc()
 * - Event handling without eval
 * - Security: No string-to-code conversion
 */
function Calculator(props) {
  // State
  const display = val(props.initialValue || '0');
  const previousValue = val(null);
  const operation = val(null);
  const shouldResetDisplay = val(false);
  
  // Computed state: Check if display is valid
  const isError = calc(() => display() === 'Error');
  
  // Helper: Clear all state
  const clear = () => {
    display('0');
    previousValue(null);
    operation(null);
    shouldResetDisplay(false);
  };
  
  // Helper: Append digit or decimal
  const appendDigit = (digit) => {
    if (isError()) {
      clear();
    }
    
    if (shouldResetDisplay()) {
      display(digit);
      shouldResetDisplay(false);
    } else {
      const current = display();
      // Prevent multiple decimals
      if (digit === '.' && current.includes('.')) return;
      // Replace leading zero
      if (current === '0' && digit !== '.') {
        display(digit);
      } else {
        display(current + digit);
      }
    }
  };
  
  // Helper: Perform calculation
  const calculate = (a, b, op) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    if (isNaN(numA) || isNaN(numB)) return 'Error';
    
    switch (op) {
      case '+': return String(numA + numB);
      case '-': return String(numA - numB);
      case '×': return String(numA * numB);
      case '÷': 
        if (numB === 0) return 'Error';
        return String(numA / numB);
      default: return b;
    }
  };
  
  // Handle operation button (+, -, ×, ÷)
  const handleOperation = (op) => {
    if (isError()) {
      clear();
      return;
    }
    
    const current = display();
    
    // If we have a previous operation, calculate it first
    if (previousValue() !== null && operation() !== null && !shouldResetDisplay()) {
      const result = calculate(previousValue(), current, operation());
      display(result);
      previousValue(result);
    } else {
      previousValue(current);
    }
    
    operation(op);
    shouldResetDisplay(true);
  };
  
  // Handle equals button
  const handleEquals = () => {
    if (isError()) {
      clear();
      return;
    }
    
    if (previousValue() !== null && operation() !== null) {
      const result = calculate(previousValue(), display(), operation());
      display(result);
      previousValue(null);
      operation(null);
      shouldResetDisplay(true);
    }
  };
  
  // Handle backspace
  const handleBackspace = () => {
    if (isError() || shouldResetDisplay()) {
      clear();
      return;
    }
    
    const current = display();
    if (current.length === 1) {
      display('0');
    } else {
      display(current.slice(0, -1));
    }
  };
  
  // Handle +/- toggle
  const handleToggleSign = () => {
    if (isError()) return;
    
    const current = display();
    if (current === '0') return;
    
    if (current.startsWith('-')) {
      display(current.slice(1));
    } else {
      display('-' + current);
    }
  };
  
  // Render function
  return () => html`
    <div class="calculator">
      <div class="display">${display()}</div>
      
      <div class="buttons">
        <button class="btn btn-clear" onclick=${clear}>C</button>
        <button class="btn btn-operation" onclick=${handleToggleSign}>+/-</button>
        <button class="btn btn-operation" onclick=${handleBackspace}>⌫</button>
        <button class="btn btn-operation" onclick=${() => handleOperation('÷')}>÷</button>
        
        <button class="btn" onclick=${() => appendDigit('7')}>7</button>
        <button class="btn" onclick=${() => appendDigit('8')}>8</button>
        <button class="btn" onclick=${() => appendDigit('9')}>9</button>
        <button class="btn btn-operation" onclick=${() => handleOperation('×')}>×</button>
        
        <button class="btn" onclick=${() => appendDigit('4')}>4</button>
        <button class="btn" onclick=${() => appendDigit('5')}>5</button>
        <button class="btn" onclick=${() => appendDigit('6')}>6</button>
        <button class="btn btn-operation" onclick=${() => handleOperation('-')}>-</button>
        
        <button class="btn" onclick=${() => appendDigit('1')}>1</button>
        <button class="btn" onclick=${() => appendDigit('2')}>2</button>
        <button class="btn" onclick=${() => appendDigit('3')}>3</button>
        <button class="btn btn-operation" onclick=${() => handleOperation('+')}>+</button>
        
        <button class="btn btn-zero" onclick=${() => appendDigit('0')}>0</button>
        <button class="btn" onclick=${() => appendDigit('.')}>.</button>
        <button class="btn btn-equals" onclick=${handleEquals}>=</button>
      </div>
    </div>
  `;
}

// Register component
register('Calculator', Calculator);

// Hydrate all islands on page load
hydrate();
