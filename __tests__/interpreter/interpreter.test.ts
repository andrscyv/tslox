import { ErrorReporter } from '../../src/error';
import { Interpreter } from '../../src/interpreter/interpreter';
import { getLastVal } from '../../src/interpreter/utils';
import { Parser } from '../../src/parser/parser';
import { Scanner } from '../../src/scanner/scanner';

function interpret(source: string) {
  const reporter = new ErrorReporter();
  const scanner = new Scanner(source, reporter);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens, reporter);
  const ast = parser.parse();
  const interpreter = new Interpreter(reporter);
  return interpreter.interpret(ast);
}
describe('interpreter', () => {
  it('sums 1 + 2', () => {
    const source = '1+2;';
    interpret(source);
    const res = getLastVal();
    expect(res).toBe(3);
  });
  it('sums -1 + 2', () => {
    const source = '-1+2;';
    interpret(source);
    const res = getLastVal();
    expect(res).toBe(1);
  });
  it('respect precedent', () => {
    const source = '-1+2*3 - 10/2;';
    interpret(source);
    const res = getLastVal();
    expect(res).toBe(0);
  });
});
