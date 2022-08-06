import {
  Assignment,
  Binary,
  Call,
  Expr,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
} from '../ast/expr';
import {
  BlockStmt,
  ExprStmt,
  FunDeclStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  Stmt,
  VarDeclStmt,
  WhileStmt,
} from '../ast/stmt';
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
  ELSE,
  OR,
  AND,
  COMMA,
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

      if (this.match(FUN)) {
        return this.functionDeclaration('function');
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

    if (this.match(RETURN)) {
      return this.returnStatement();
    }

    if (this.match(LEFT_BRACE)) {
      return new BlockStmt(this.block());
    }

    if (this.match(IF)) {
      return this.ifStatement();
    }

    if (this.match(WHILE)) {
      return this.whileStatement();
    }

    if (this.match(FOR)) {
      return this.forStatement();
    }

    return this.expressionStatement();
  }

  private functionDeclaration(kind: string): Stmt {
    const name: Token = this.consume(IDENTIFIER, `Expect ${kind} name.`);
    this.consume(LEFT_PAREN, `Expect '(' after ${kind} name.`);
    const params: Token[] = [];

    if (!this.check(RIGHT_PAREN)) {
      do {
        if (params.length >= 255) {
          this.error(this.peek(), `Can't have more than 255 parameters.`);
        }
        params.push(this.consume(IDENTIFIER, `Expect parameter name.`));
      } while (this.match(COMMA));
    }

    this.consume(RIGHT_PAREN, `Expect ')' after parameters.`);

    this.consume(LEFT_BRACE, `Expect '{' before ${kind} body.`);
    const body = this.block();

    return new FunDeclStmt(name, params, body);
  }

  private block(): Stmt[] {
    const stmtList: Stmt[] = [];

    while (!this.isAtEnd() && !this.check(RIGHT_BRACE)) {
      stmtList.push(this.declaration());
    }

    this.consume(RIGHT_BRACE, "Expect '}' after block.");

    return stmtList;
  }

  private ifStatement(): IfStmt {
    this.consume(LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = this.expression();

    this.consume(RIGHT_PAREN, "Expect ')' after if condition.");
    const thenBranch = this.statement();

    let elseBranch = null;
    if (this.match(ELSE)) {
      elseBranch = this.statement();
    }

    return new IfStmt(condition, thenBranch, elseBranch);
  }

  private whileStatement(): WhileStmt {
    this.consume(LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = this.expression();
    this.consume(RIGHT_PAREN, "Expect ')' after condition.");

    const body = this.statement();

    return new WhileStmt(condition, body);
  }

  private forStatement(): Stmt {
    this.consume(LEFT_PAREN, "Expect '(' after 'for'.");
    let initializer: Stmt;
    let condition: Expr;
    let increment: Expr;

    if (this.match(SEMICOLON)) {
      initializer = null;
    } else if (this.match(VAR)) {
      initializer = this.variableDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    if (!this.check(SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(SEMICOLON, "Expect ';' after loop condition.");

    if (!this.check(RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(RIGHT_PAREN, "Expect ')' after for clauses.");
    let body = this.statement();

    if (increment) {
      const incrementStmt = new ExprStmt(increment);
      body = new BlockStmt([body, incrementStmt]);
    }

    condition = condition || new Literal(true, TRUE);

    if (initializer) {
      body = new BlockStmt([initializer, new WhileStmt(condition, body)]);
    }

    return body;
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

  private returnStatement(): Stmt {
    let expr: Expr;
    const returnKeyword = this.previous();
    if (!this.check(SEMICOLON)) {
      expr = this.expression();
    }
    this.consume(SEMICOLON, `Expect ';' after return value.`);

    return new ReturnStmt(returnKeyword, expr);
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
    const expr = this.logicOr();

    if (this.match(EQUAL)) {
      const equalToken = this.previous();
      // its assignment
      if (expr instanceof Variable) {
        const value = this.assignment();
        return new Assignment(expr.name, value);
      }

      this.error(equalToken, 'Invalid assignment target.');
    }
    return expr;
  }

  private logicOr(): Expr {
    const expr = this.logicAnd();

    if (this.match(OR)) {
      const operator = this.previous();
      const right = this.logicAnd();
      return new Logical(expr, operator, right);
    }

    return expr;
  }

  private logicAnd(): Expr {
    const expr = this.equality();

    if (this.match(AND)) {
      const operator = this.previous();
      const right = this.equality();
      return new Logical(expr, operator, right);
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
      return this.call();
    }
  }

  private call(): Expr {
    let expr = this.primary();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.match(LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Call {
    const args: Expr[] = [];

    if (!this.check(RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 arguments.");
        }
        args.push(this.expression());
      } while (this.match(COMMA));
    }

    const paren: Token = this.consume(
      RIGHT_PAREN,
      "Expect ')' after arguments.",
    );

    return new Call(callee, paren, args);
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
