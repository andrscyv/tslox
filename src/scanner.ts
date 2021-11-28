import { Token, TokenType } from './token';

export class Scanner {
  currentIdx: number;
  startIdx: number;
  line: number;
  private tokens: Token[];

  constructor(private source: string) {
    console.log('Scanner.constructor', source);
    this.currentIdx = 0;
    this.startIdx = 0;
    this.line = 1;
    this.tokens = [];
  }

  scanTokens(): Token[] {
    const tokens: Token[] = [];
    while (!this.isAtEnd()) {
      this.startIdx = this.currentIdx;
      this.scanToken();
    }
    tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return tokens;
  }

  isAtEnd(): boolean {
    return this.currentIdx >= this.source.length;
  }

  advance(): string {
    this.currentIdx++;
    return this.source[this.currentIdx - 1];
  }

  currentLexeme(): string {
    return this.source.substring(this.startIdx, this.currentIdx + 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addToken(tokenType: TokenType, literal: any = null): void {
    const lexeme = this.currentLexeme();
    this.tokens.push(new Token(tokenType, lexeme, literal, this.line));
  }

  scanToken(): void {
    const char = this.advance();
    switch (char) {
      case '(':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case '}':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ',':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case '.':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case '-':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case '+':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ';':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case '/':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case '*':
        this.addToken(TokenType.LEFT_PAREN);
        break;
      default:
        break;
    }
  }
}
