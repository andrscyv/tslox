import { ErrorReporter } from '../error';
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
    while (!this.isAtEnd()) {
      this.startIdx = this.currentIdx;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
    return this.tokens;
  }

  isAtEnd(): boolean {
    return this.currentIdx >= this.source.length;
  }

  advance(): string {
    return this.source[this.currentIdx++];
  }

  currentLexeme(): string {
    return this.source.substring(this.startIdx, this.currentIdx);
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

  isDigit(c): boolean {
    return c >= '0' && c <= '9';
  }

  isAlpha(c): boolean {
    return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c === '_';
  }

  isAlphaNumeric(c): boolean {
    return this.isDigit(c) || this.isAlpha(c);
  }

  peekTwoAhead(): string {
    if (this.currentIdx + 1 > this.source.length) {
      return '\0';
    }
    return this.source[this.currentIdx + 1];
  }

  number(): void {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === '.' && this.isDigit(this.peekTwoAhead)) {
      this.advance(); // consume dot

      // consume fractional part
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(TokenType.NUMBER, +this.currentLexeme());
  }

  identifier(): void {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const lexeme = this.currentLexeme();

    const reservedWords: TokenType[] = [
      TokenType.AND,
      TokenType.CLASS,
      TokenType.ELSE,
      TokenType.FALSE,
      TokenType.FOR,
      TokenType.FUN,
      TokenType.IF,
      TokenType.NIL,
      TokenType.OR,
      TokenType.PRINT,
      TokenType.RETURN,
      TokenType.SUPER,
      TokenType.THIS,
      TokenType.TRUE,
      TokenType.VAR,
      TokenType.WHILE,
    ];
    const tokenType = reservedWords.includes(lexeme.toUpperCase() as TokenType)
      ? (lexeme.toUpperCase() as TokenType)
      : TokenType.IDENTIFIER;

    this.addToken(tokenType);
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
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          this.reporter.error(this.line, `Unexpected character: ${char}`);
        }
        break;
    }
  }
}
