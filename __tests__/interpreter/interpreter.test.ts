import { ErrorReporter } from '../../src/error';
import { Interpreter } from '../../src/interpreter/interpreter';
import { Parser } from '../../src/parser/parser';
import { Scanner } from '../../src/scanner/scanner';

function interpret(source: string) {
  const reporter = new ErrorReporter();
  const scanner = new Scanner(source, reporter);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens, reporter);
  const ast = parser.parse();
  const interpreter = new Interpreter(reporter);
  interpreter.interpret(ast);
  return interpreter.lastValue;
}
describe('interpreter', () => {
  it('sums 1 + 2', () => {
    const source = '1+2;';
    const res = interpret(source);
    expect(res).toBe(3);
  });
  it('sums -1 + 2', () => {
    const source = '-1+2;';
    const res = interpret(source);
    expect(res).toBe(1);
  });
  it('respect precedent', () => {
    const source = '-1+2*3 - 10/2;';
    const res = interpret(source);
    expect(res).toBe(0);
  });
  it('lexical scope', () => {
    const source = 'var a = 1; { var a = 2; print a; }';
    const res = interpret(source);
    expect(res).toBe(2);
  });

  it('reassigns variable', () => {
    const source = ` 
      var a = 1;
      a = 2;
      a;
      `;
    const res = interpret(source);
    expect(res).toBe(2);
  });
});
