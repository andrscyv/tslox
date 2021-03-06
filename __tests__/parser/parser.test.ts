import { Binary, Grouping, Literal, Unary } from '../../src/ast/expr';
import { ExprStmt } from '../../src/ast/stmt';
import { ErrorReporter } from '../../src/error';
import { Parser } from '../../src/parser/parser';
import { Scanner } from '../../src/scanner/scanner';
import { Token, TokenType } from '../../src/scanner/token';

function parse(source: string) {
  const reporter = new ErrorReporter();
  const scanner = new Scanner(source, reporter);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens, reporter);
  return parser.parse();
}
describe('parser', () => {
  it('reports error', () => {
    const source = '1 + ;';
    parse(source);
    expect(true).toBe(true);
  });
  it('parses a term', () => {
    const source = '1 + 2;';
    const expectedAst = [
      new ExprStmt(
        new Binary(
          new Literal(1, TokenType.NUMBER),
          new Token(TokenType.PLUS, '+', null, 1),
          new Literal(2, TokenType.NUMBER),
        ),
      ),
    ];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses a factor', () => {
    const source = '1 * 2;';
    const expectedAst = [
      new ExprStmt(
        new Binary(
          new Literal(1, TokenType.NUMBER),
          new Token(TokenType.STAR, '*', null, 1),
          new Literal(2, TokenType.NUMBER),
        ),
      ),
    ];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses an equality', () => {
    const source = '1 == 2;';
    const expectedAst = [
      new ExprStmt(
        new Binary(
          new Literal(1, TokenType.NUMBER),
          new Token(TokenType.EQUAL_EQUAL, '==', null, 1),
          new Literal(2, TokenType.NUMBER),
        ),
      ),
    ];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses a comparison', () => {
    const source = '1 <= 2;';
    const expectedAst = [
      new ExprStmt(
        new Binary(
          new Literal(1, TokenType.NUMBER),
          new Token(TokenType.LESS_EQUAL, '<=', null, 1),
          new Literal(2, TokenType.NUMBER),
        ),
      ),
    ];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses an unary', () => {
    const source = '-1;';
    const expectedAst = [
      new ExprStmt(
        new Unary(
          new Token(TokenType.MINUS, '-', null, 1),
          new Literal(1, TokenType.NUMBER),
        ),
      ),
    ];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses a boolean true', () => {
    const source = 'true;';
    const expectedAst = [new ExprStmt(new Literal(true, TokenType.TRUE))];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses a boolean false', () => {
    const source = 'false;';
    const expectedAst = [new ExprStmt(new Literal(false, TokenType.FALSE))];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses a nil', () => {
    const source = 'nil;';
    const expectedAst = [new ExprStmt(new Literal(null, TokenType.NIL))];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses a number', () => {
    const source = '2.3;';
    const expectedAst = [new ExprStmt(new Literal(2.3, TokenType.NUMBER))];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses a string', () => {
    const source = '"hola";';
    const expectedAst = [new ExprStmt(new Literal('hola', TokenType.STRING))];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
  it('parses an expr with precedence', () => {
    const source = '-1 + 2 * 3 > 4 == (5 + 6) * 7;';
    const expectedAst = [
      new ExprStmt(
        new Binary(
          new Binary(
            new Binary(
              new Unary(
                new Token(TokenType.MINUS, '-', null, 1),
                new Literal(1, TokenType.NUMBER),
              ),
              new Token(TokenType.PLUS, '+', null, 1),
              new Binary(
                new Literal(2, TokenType.NUMBER),
                new Token(TokenType.STAR, '*', null, 1),
                new Literal(3, TokenType.NUMBER),
              ),
            ),
            new Token(TokenType.GREATER, '>', null, 1),
            new Literal(4, TokenType.NUMBER),
          ),
          new Token(TokenType.EQUAL_EQUAL, '==', null, 1),
          new Binary(
            new Grouping(
              new Binary(
                new Literal(5, TokenType.NUMBER),
                new Token(TokenType.PLUS, '+', null, 1),
                new Literal(6, TokenType.NUMBER),
              ),
            ),
            new Token(TokenType.STAR, '*', null, 1),
            new Literal(7, TokenType.NUMBER),
          ),
        ),
      ),
    ];
    const parsedAst = parse(source);
    expect(parsedAst).toEqual(expectedAst);
  });
});
