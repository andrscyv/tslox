import { Token, TokenType } from '../scanner/token';

export interface Expr {
  accept: <R>(visitor: Visitor<R>) => R;
}
export interface Visitor<R> {
  visitBinaryExpr: (expr: Binary) => R;
  visitLiteralExpr: (expr: Literal) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
}
export class Binary implements Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {}
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Unary implements Expr {
  constructor(public operator: Token, public operand: Expr) {}

  accept<R>(visitor: Visitor<R>) {
    return visitor.visitUnaryExpr(this);
  }
}
export class Grouping implements Expr {
  constructor(public expr: Expr) {}
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}
export class Literal implements Expr {
  constructor(public value, public type: TokenType) {}
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}
