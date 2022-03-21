import { Binary, Expr, Literal, Unary } from '../ast/expr';
import { ErrorReporter } from '../error';
import { Token, TokenType } from '../scanner/token';
import { ParseError } from './error';
const {
  EOF,
  BANG_EQUAL,
  EQUAL_EQUAL,
  GREATER_EQUAL,
  GREATER,
  LESS_EQUAL,
  LESS,
  BANG,
  MINUS,
  NUMBER,
  STRING,
  TRUE,
  FALSE,
  NIL,
  LEFT_PAREN,
  RIGHT_PAREN,
  SLASH,
  STAR,
  PLUS,
} = TokenType;

export class Parser {
  private current = 0;

  constructor(private tokens: Token[], private reporter: ErrorReporter) {}

  public parse() {
    try {
      return this.expression();
    } catch (error) {
      console.info(error);
      return null;
    }
  }

  private isAtEnd() {
    return this.tokens[this.current].type === EOF;
  }

  private previous() {
    console.assert(this.current >= 0, {
      errorMsg: '[parser] Invalid call to previous',
    });
    return this.tokens[this.current - 1];
  }
  private advance() {
    if (!this.isAtEnd()) {
      this.current++;
    }

    return this.previous();
  }

  private peek() {
    return this.tokens[this.current];
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false;
    }
    return this.peek().type === type;
  }

  private match(...tokenTypes: TokenType[]): boolean {
    for (const type of tokenTypes) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private error(token: Token, message: string): ParseError {
    this.reporter.parseError(token, message);
    return new ParseError('Parser error');
  }

  private consume(tokenType: TokenType, errorMessage: string): Token {
    if (this.check(tokenType)) {
      return this.advance();
    }

    throw this.error(this.peek(), errorMessage);
  }

  private expression(): Expr {
    return this.equality();
  }

  private parseLeftAssocBinaryExpr(
    operandParser: () => Expr,
    operators: TokenType[],
  ): Expr {
    let expr: Expr = operandParser.call(this);

    while (this.match(...operators)) {
      const operator = this.previous();
      const right = operandParser.call(this);
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr {
    return this.parseLeftAssocBinaryExpr(this.comparison, [
      BANG_EQUAL,
      EQUAL_EQUAL,
    ]);
  }

  private comparison(): Expr {
    return this.parseLeftAssocBinaryExpr(this.term, [
      LESS,
      LESS_EQUAL,
      GREATER,
      GREATER_EQUAL,
    ]);
  }

  private term(): Expr {
    return this.parseLeftAssocBinaryExpr(this.factor, [MINUS, PLUS]);
  }

  private factor(): Expr {
    return this.parseLeftAssocBinaryExpr(this.unary, [SLASH, STAR]);
  }

  private unary(): Expr {
    if (this.match(BANG, MINUS)) {
      const operator = this.previous();
      const operand = this.unary();
      return new Unary(operator, operand);
    } else {
      return this.primary();
    }
  }

  private primary(): Expr {
    if (this.match(LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(RIGHT_PAREN, "Expect ')' after expression.");
      return expr;
    }

    const literalTokenTypes = [NUMBER, STRING, TRUE, FALSE, NIL];
    if (literalTokenTypes.includes(this.peek().type)) {
      const token = this.advance();
      return new Literal(token.literal, token.type);
    }

    throw this.error(this.peek(), 'Expect expression. ');
  }
}
