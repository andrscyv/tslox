import { ErrorReporter } from './error';
import { Token, TokenType } from './token';

export class Scanner {
  currentIdx: number;
  startIdx: number;
  line: number;
  private tokens: Token[];

  constructor(private source: string, private reporter: ErrorReporter) {
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
    return this.source[this.currentIdx++];
  }

  currentLexeme(): string {
    return this.source.substring(this.startIdx, this.currentIdx + 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addToken(tokenType: TokenType, literal: any = null): void {
    const lexeme = this.currentLexeme();
    this.tokens.push(new Token(tokenType, lexeme, literal, this.line));
  }

  match(char: string): boolean {
    if (this.isAtEnd() || this.source[this.currentIdx] !== char) {
      return false;
    }

    this.currentIdx++;
    return true;
  }

  peek(): string {
    if (this.isAtEnd()) {
      return '\0';
    }
    return this.source[this.currentIdx];
  }

  string(): void {
    while (!this.isAtEnd() && this.peek() !== '"') {
      if (this.peek() === '\n') {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.reporter.error(this.line, 'Unterminated String.');
      return;
    }

    // consume second quotes
    this.advance();

    this.addToken(
      TokenType.STRING,
      this.source.substring(this.startIdx + 1, this.currentIdx),
    );
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
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ',':
        this.addToken(TokenType.COMMA);
        break;
      case '.':
        this.addToken(TokenType.DOT);
        break;
      case '-':
        this.addToken(TokenType.MINUS);
        break;
      case '+':
        this.addToken(TokenType.PLUS);
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON);
        break;
      case '*':
        this.addToken(TokenType.STAR);
        break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(
          this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL,
        );
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(
          this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER,
        );
        break;
      case '/':
        if (this.match('/')) {
          while (!this.isAtEnd() && this.peek() !== '\n') {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case '"':
        this.string();
        break;
      case ' ':
      case '\r':
      case '\t':
        break;
      case '\n':
        this.line++;
        break;
      default:
        this.reporter.error(this.line, `Unexpected character: ${char}`);
        break;
    }
  }
}
