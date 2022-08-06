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

  it('short circuits AND', () => {
    const source = ` 
      nil and 1;
      `;
    const res = interpret(source);
    expect(res).toBe(null);
  });

  it('short circuits OR', () => {
    const source = ` 
      "hello" or nil;
      `;
    const res = interpret(source);
    expect(res).toBe('hello');
  });

  it('evaluates false if statement', () => {
    const source = ` 
      var a = false;
      if (a) 1;
      else
      2;
      `;
    const res = interpret(source);
    expect(res).toBe(2);
  });

  it('evaluates true if statement', () => {
    const source = ` 
      var a = true;
      if (a) 1;
      else
      2;
      `;
    const res = interpret(source);
    expect(res).toBe(1);
  });

  it('evaluates if with block statement', () => {
    const source = ` 
      var a = 0;
      if (false or true) {
        a = 3;
      }
      else a = 4;
      `;
    const res = interpret(source);
    expect(res).toBe(3);
  });

  it('evaluates false if with block statement', () => {
    const source = ` 
      var a = 0;
      if (nil and "hello") {
        a = "true case";
      }
      else {
        a = "false case";
      }
      `;
    const res = interpret(source);
    expect(res).toBe('false case');
  });

  it('interprets while statement', () => {
    const source = ` 
      var i = 0;
      while (i < 4) {
        print i/2;
        i = i + 1;
      }
      `;
    const res = interpret(source);
    expect(res).toBe(4);
  });

  it('interprets for loop', () => {
    const source = ` 
      for (var i = 0; i < 4 ; i = i +1 ) {
        print i;
      }
      `;
    const res = interpret(source);
    expect(res).toBe(4);
  });

  it('calls builtin function clock', () => {
    const source = ` 
      clock();
      `;
    const res = interpret(source);
    expect(typeof res).toBe('number');
  });

  it('calls user defined fun', () => {
    const source = ` 
      fun hello() {
        print "Hello world.";
      }
      hello();
      `;
    const res = interpret(source);
    expect(res).toBe(null);
  });

  it('calls user defined fun with return stmt', () => {
    const source = ` 
      fun hello() {
        print "Hello world.";
        return 1;
      }
      print hello();
      hello();
      `;
    const res = interpret(source);
    expect(res).toBe(1);
  });

  it('calls user defined fun with early return', () => {
    const source = ` 
      fun hello() {
        return "a";
        print "Hello world.";
        return 1;
      }
      print hello();
      hello();
      `;
    const res = interpret(source);
    expect(res).toBe('a');
  });

  it('runs fib function', () => {
    const source = ` 
      fun fib(n) {
        if (n <= 1) return n;
        return fib(n - 2) + fib(n - 1);
      }
      var ithFib;
      for (var i = 0; i < 20; i = i + 1) {
        ithFib = fib(i);
        print ithFib;
      }
      ithFib;
      `;
    const res = interpret(source);
    expect(res).toBe(4181);
  });
  it('runs function with closure', () => {
    const source = ` 
      fun makeCounter() {
        var i = 0;
        fun count() { i = i + 1; return i;}
        return count;
      }
      var counter = makeCounter();
      print counter(); // 1
      counter(); // 2
      `;
    const res = interpret(source);
    expect(res).toBe(2);
  });
});
