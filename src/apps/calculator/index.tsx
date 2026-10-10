import { useState } from 'react';
import { AppFrame } from '../shared';
type Operator = '+' | '−' | '×' | '÷';
export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [left, setLeft] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [fresh, setFresh] = useState(false);
  const [expression, setExpression] = useState('Standard');
  const calculate = (a: number, b: number, op: Operator) => op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b;
  const format = (value: number) => Number.isFinite(value) ? String(Number(value.toPrecision(12))) : 'Cannot divide by zero';
  const press = (key: string) => {
    if (/^\d$/.test(key) || key === '.') {
      const current = fresh || !Number.isFinite(Number(display)) ? '0' : display;
      if (key === '.' && current.includes('.')) return;
      setDisplay(key === '.' ? current + '.' : current === '0' ? key : current.length < 16 ? current + key : current); setFresh(false); return;
    }
    if (key === 'C') { setDisplay('0'); setLeft(null); setOperator(null); setFresh(false); setExpression('Standard'); return; }
    if (key === 'CE') { setDisplay('0'); setFresh(false); return; }
    if (key === '⌫') { setDisplay(fresh ? '0' : display.slice(0, -1) || '0'); setFresh(false); return; }
    const value = Number(display); if (!Number.isFinite(value)) return;
    if (key === '±') { setDisplay(format(-value)); return; }
    if (key === '%') { setDisplay(format(left != null && (operator === '+' || operator === '−') ? left * value / 100 : value / 100)); return; }
    if (key === 'x²') { setDisplay(format(value * value)); setFresh(true); return; }
    if (key === '√') { setDisplay(value < 0 ? 'Invalid input' : format(Math.sqrt(value))); setFresh(true); return; }
    if (key === '1/x') { setDisplay(format(1 / value)); setFresh(true); return; }
    if (key === '=') { if (left != null && operator) { setExpression(`${left} ${operator} ${value} =`); setDisplay(format(calculate(left, value, operator))); setLeft(null); setOperator(null); setFresh(true); } return; }
    if (['+', '−', '×', '÷'].includes(key)) { const result = left != null && operator && !fresh ? calculate(left, value, operator) : value; setLeft(result); setDisplay(format(result)); setOperator(key as Operator); setExpression(`${format(result)} ${key}`); setFresh(true); }
  };
  const keys = ['%', 'CE', 'C', '⌫', '1/x', 'x²', '√', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '±', '0', '.', '='];
  return <AppFrame id="calculator"><div className="calc-body" tabIndex={0} aria-label="Calculator keypad" onKeyDown={e => {
    const map: Record<string,string> = { '*': '×', '/': '÷', '-': '−', Enter: '=', Escape: 'C', Backspace: '⌫' };
    const key = map[e.key] ?? e.key; if (keys.includes(key)) { e.preventDefault(); e.stopPropagation(); press(key); }
  }}><div className="calc-expression">{expression}</div><output className="calc-display" aria-label="Result" aria-live="polite">{display}</output><div className="calc-keys">{keys.map(key => <button key={key} className={key === '=' ? 'calc-equals' : /^\d$/.test(key) ? 'calc-number' : ''} onClick={() => press(key)}>{key}</button>)}</div></div></AppFrame>;
}
