import { Token, TokenType } from '../scanner/token';

export interface Expr {
  accept: <R>(visitor: ExprVisitor<R>) => R;
}
export interface ExprVisitor<R> {
  visitBinaryExpr: (expr: Binary) => R;
  visitLiteralExpr: (expr: Literal) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitVarExpr: (expr: Variable) => R;
  visitAssignmentExpr: (expr: Assignment) => R;
  visitLogicalExpr: (expr: Logical) => R;
  visitCallExpr: (expr: Call) => R;
}
export class Binary implements Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {}
  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}

export class Unary implements Expr {
  constructor(public operator: Token, public operand: Expr) {}

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitUnaryExpr(this);
  }
}
export class Grouping implements Expr {
  constructor(public expr: Expr) {}
  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Expr {
  constructor(public value, public type: TokenType) {}
  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitLiteralExpr(this);
  }
}

export class Logical implements Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {}
  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitLogicalExpr(this);
  }
}

export class Variable implements Expr {
  constructor(public name: Token) {}
  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitVarExpr(this);
  }
}

export class Assignment implements Expr {
  constructor(public name: Token, public value: Expr) {}
  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitAssignmentExpr(this);
  }
}

export class Call implements Expr {
  constructor(public callee: Expr, public paren: Token, public args: Expr[]) {}
  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitCallExpr(this);
  }
}
