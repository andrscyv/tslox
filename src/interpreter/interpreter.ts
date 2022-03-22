import { Token, TokenType } from '../scanner/token';
import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  ExprVisitor,
} from '../ast/expr';
import { RuntimeError } from './runtime-error';
import { ErrorReporter } from '../error';

export class Interpreter implements ExprVisitor<unknown> {
  constructor(private reporter: ErrorReporter) {}
  private evaluate(expr: Expr) {
    return expr.accept(this);
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
  interpret(ast: Expr): string {
    try {
      const val = this.evaluate(ast);
      const loxString = this.stringify(val);
      console.log(loxString);
      return loxString;
    } catch (error) {
      if (error.token) {
        // its runtime error
        this.reporter.runtimeError(error);
      } else {
        console.error(error);
      }
      return '';
    }
  }
}
