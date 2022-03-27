import {
  Assignemt,
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  Variable,
} from '../ast/expr';
import { BlockStmt, ExprStmt, PrintStmt, Stmt, VarDeclStmt } from '../ast/stmt';
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
  PRINT,
  SEMICOLON,
  VAR,
  IDENTIFIER,
  EQUAL,
  CLASS,
  FUN,
  FOR,
  IF,
  WHILE,
  RETURN,
  RIGHT_BRACE,
  LEFT_BRACE,
} = TokenType;

export class Parser {
  private current = 0;

  constructor(private tokens: Token[], private reporter: ErrorReporter) {}

  public parse() {
    const program: Stmt[] = [];
    try {
      while (!this.isAtEnd()) {
        program.push(this.declaration());
      }
      return program;
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

  private sinchronize() {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type === SEMICOLON) {
        return;
      }
      switch (this.peek().type) {
        case CLASS:
        case FUN:
        case VAR:
        case FOR:
        case IF:
        case WHILE:
        case PRINT:
        case RETURN:
          return;
      }
      this.advance();
    }
  }

  private declaration(): Stmt {
    try {
      if (this.match(VAR)) {
        return this.variableDeclaration();
      }

      return this.statement();
    } catch (error) {
      this.sinchronize();
      return null;
    }
  }

  private variableDeclaration(): Stmt {
    const identifier: Token = this.consume(IDENTIFIER, 'Expect variable name.');
    let initializer = null;

    if (this.match(EQUAL)) {
      initializer = this.expression();
    }

    this.consume(SEMICOLON, "Expect ';' after variable declaration.");
    return new VarDeclStmt(identifier, initializer);
  }
  private statement(): Stmt {
    if (this.match(PRINT)) {
      return this.printStatement();
    }

    if (this.match(LEFT_BRACE)) {
      return new BlockStmt(this.block());
    }

    return this.expressionStatement();
  }

  private block(): Stmt[] {
    const stmtList: Stmt[] = [];

    while (!this.isAtEnd() && !this.check(RIGHT_BRACE)) {
      stmtList.push(this.declaration());
    }

    this.consume(RIGHT_BRACE, "Expect '}' after block.");

    return stmtList;
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume(SEMICOLON, 'Expect ; after expression.');
    return new ExprStmt(expr);
  }
  private printStatement(): Stmt {
    const expr = this.expression();
    this.consume(SEMICOLON, 'Expect ; after value.');
    return new PrintStmt(expr);
  }

  private expression(): Expr {
    return this.assignment();
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

  private assignment(): Expr {
    const expr = this.equality();

    if (this.match(EQUAL)) {
      const equalToken = this.previous();
      // its assignment
      if (expr instanceof Variable) {
        const value = this.assignment();
        return new Assignemt(expr.name, value);
      }

      this.error(equalToken, 'Invalid assignment target.');
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
      return new Grouping(expr);
    }

    if (this.match(TRUE)) {
      return new Literal(true, TRUE);
    }
    if (this.match(FALSE)) {
      return new Literal(false, FALSE);
    }
    if (this.match(NIL)) {
      return new Literal(null, NIL);
    }
    if (this.match(IDENTIFIER)) {
      return new Variable(this.previous());
    }

    const literalTokenTypes = [NUMBER, STRING];
    if (literalTokenTypes.includes(this.peek().type)) {
      const token = this.advance();
      return new Literal(token.literal, token.type);
    }

    throw this.error(this.peek(), 'Expect expression. ');
  }
}
