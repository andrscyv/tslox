import { Token, TokenType } from '../scanner/token';
import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  ExprVisitor,
  Variable,
  Assignemt,
} from '../ast/expr';
import { RuntimeError } from './runtime-error';
import { ErrorReporter } from '../error';
import {
  BlockStmt,
  ExprStmt,
  PrintStmt,
  Stmt,
  StmtVisitor,
  VarDeclStmt,
} from '../ast/stmt';
import { Environment } from './environment';

export class Interpreter implements ExprVisitor<unknown>, StmtVisitor<void> {
  public lastValue = null;
  private environment = new Environment();
  constructor(private reporter: ErrorReporter) {}
  private evaluate(expr: Expr) {
    return expr.accept(this);
  }
  private execute(stmt: Stmt) {
    return stmt.accept(this);
  }

  private executeBlock(stmtList: Stmt[], executionEnv: Environment) {
    console.assert(executionEnv, 'Missing executionEnv');
    const enclosing = this.environment;
    try {
      this.environment = executionEnv;

      for (const stmt of stmtList) {
        this.execute(stmt);
      }
    } finally {
      this.environment = enclosing;
    }
  }

  private isTruthy(value) {
    return value !== null && value !== false;
  }
  private checkNumberOperands(
    operator: Token,
    left: unknown,
    right: unknown = null,
  ) {
    if (typeof left === 'number') {
      if (right === null || typeof right === 'number') {
        return;
      }
      throw new RuntimeError(operator, 'Operands must be numbers.');
    }
  }
  private stringify(value: unknown) {
    console.assert(value !== undefined, 'undefined value');
    if (value === null) {
      return 'nil';
    }
    return value.toString();
  }

  visitVarDeclStmt(varDeclStmt: VarDeclStmt) {
    const { identifier, initializer } = varDeclStmt;
    let initialValue = null;
    if (initializer) {
      initialValue = this.evaluate(initializer);
    }
    this.environment.define(identifier.lexeme, initialValue);
  }
  visitVarExpr(expr: Variable) {
    return this.environment.get(expr.name);
  }

  visitAssignmentExpr(expr: Assignemt) {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }
  visitExprStmt(exprStmt: ExprStmt) {
    const val = this.evaluate(exprStmt.expr);
    this.lastValue = val;
  }

  visitBlockStmt(blockStmt: BlockStmt) {
    if (!blockStmt.stmtList) {
      return;
    }
    this.executeBlock(blockStmt.stmtList, new Environment(this.environment));
  }

  visitPrintStmt(printStmt: PrintStmt) {
    const value = this.evaluate(printStmt.expr);
    this.lastValue = value;
    console.log(this.stringify(value));
  }
  visitBinaryExpr(expr: Binary) {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);
    const { operator } = expr;

    switch (operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(operator, left, right);
        return left - right;
      case TokenType.PLUS:
        if (
          typeof left === typeof right &&
          (typeof left === 'string' || typeof left === 'number')
        )
          return left + right;
        throw new RuntimeError(
          operator,
          'Operands must be two numbers or two strings',
        );

        break;
      case TokenType.STAR:
        this.checkNumberOperands(operator, left, right);
        return left * right;
      case TokenType.SLASH:
        this.checkNumberOperands(operator, left, right);
        return left / right;
      case TokenType.GREATER:
        this.checkNumberOperands(operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperands(operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(operator, left, right);
        return left <= right;
      case TokenType.BANG_EQUAL:
        return left != right;
      case TokenType.EQUAL_EQUAL:
        return left === right;
      default:
        break;
    }
  }
  visitLiteralExpr(expr: Literal) {
    return expr.value;
  }
  visitUnaryExpr(expr: Unary) {
    const operand = this.evaluate(expr.operand);
    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -operand;
      case TokenType.BANG:
        return !this.isTruthy(operand);
      default:
        break;
    }
  }
  visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expr);
  }
  interpret(ast: Stmt[]): void {
    try {
      for (const stmt of ast) {
        this.execute(stmt);
      }
    } catch (error) {
      if (error.token) {
        // its runtime error
        this.reporter.runtimeError(error);
      } else {
        console.error(error);
      }
    }
  }
}
