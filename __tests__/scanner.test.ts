import { ErrorReporter } from '../src/error';
import { Scanner } from '../src/scanner';
import { TokenType } from '../src/token';

const reporter = new ErrorReporter();
describe('Scanner', () => {
  it('Scans a declaration', () => {
    const source = 'var ident;';
    const expectedTokens = [
      {
        type: TokenType.VAR,
        lexeme: 'var',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.IDENTIFIER,
        lexeme: 'ident',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.SEMICOLON,
        lexeme: ';',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.EOF,
        lexeme: '',
        literal: null,
        line: 1,
      },
    ];
    const scanner = new Scanner(source, reporter);
    const tokens = scanner.scanTokens();
    expect(tokens).toEqual(expectedTokens);
  });
  it('Scans an expression', () => {
    const source = '3 + 1';
    const expectedTokens = [
      {
        type: TokenType.NUMBER,
        lexeme: '3',
        literal: 3,
        line: 1,
      },
      {
        type: TokenType.PLUS,
        lexeme: '+',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.NUMBER,
        lexeme: '1',
        literal: 1,
        line: 1,
      },
      {
        type: TokenType.EOF,
        lexeme: '',
        literal: null,
        line: 1,
      },
    ];
    const scanner = new Scanner(source, reporter);
    const tokens = scanner.scanTokens();
    expect(tokens).toEqual(expectedTokens);
  });
  it('Scans a declaration and an expression', () => {
    const source = `var a = 2;
                    3 + 1;`;
    const expectedTokens = [
      {
        type: TokenType.VAR,
        lexeme: 'var',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.IDENTIFIER,
        lexeme: 'a',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.EQUAL,
        lexeme: '=',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.NUMBER,
        lexeme: '2',
        literal: 2,
        line: 1,
      },
      {
        type: TokenType.SEMICOLON,
        lexeme: ';',
        literal: null,
        line: 1,
      },
      {
        type: TokenType.NUMBER,
        lexeme: '3',
        literal: 3,
        line: 2,
      },
      {
        type: TokenType.PLUS,
        lexeme: '+',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.NUMBER,
        lexeme: '1',
        literal: 1,
        line: 2,
      },
      {
        type: TokenType.SEMICOLON,
        lexeme: ';',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.EOF,
        lexeme: '',
        literal: null,
        line: 2,
      },
    ];
    const scanner = new Scanner(source, reporter);
    const tokens = scanner.scanTokens();
    expect(tokens).toEqual(expectedTokens);
  });
  it('Scans for loop', () => {
    const source = `
    for ( var a = 1; a++; a > 0) {
        print 2
    };`;
    const expectedTokens = [
      {
        type: TokenType.FOR,
        lexeme: 'for',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.LEFT_PAREN,
        lexeme: '(',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.VAR,
        lexeme: 'var',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.IDENTIFIER,
        lexeme: 'a',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.EQUAL,
        lexeme: '=',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.NUMBER,
        lexeme: '1',
        literal: 1,
        line: 2,
      },
      {
        type: TokenType.SEMICOLON,
        lexeme: ';',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.IDENTIFIER,
        lexeme: 'a',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.PLUS,
        lexeme: '+',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.PLUS,
        lexeme: '+',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.SEMICOLON,
        lexeme: ';',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.IDENTIFIER,
        lexeme: 'a',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.GREATER,
        lexeme: '>',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.NUMBER,
        lexeme: '0',
        literal: 0,
        line: 2,
      },
      {
        type: TokenType.RIGHT_PAREN,
        lexeme: ')',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.LEFT_BRACE,
        lexeme: '{',
        literal: null,
        line: 2,
      },
      {
        type: TokenType.PRINT,
        lexeme: 'print',
        literal: null,
        line: 3,
      },
      {
        type: TokenType.NUMBER,
        lexeme: '2',
        literal: 2,
        line: 3,
      },
      {
        type: TokenType.RIGHT_BRACE,
        lexeme: '}',
        literal: null,
        line: 4,
      },
      {
        type: TokenType.SEMICOLON,
        lexeme: ';',
        literal: null,
        line: 4,
      },
      {
        type: TokenType.EOF,
        lexeme: '',
        literal: null,
        line: 4,
      },
    ];
    const scanner = new Scanner(source, reporter);
    const tokens = scanner.scanTokens();
    expect(tokens).toEqual(expectedTokens);
  });
});
