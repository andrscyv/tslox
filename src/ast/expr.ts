import { Token } from '../scanner/token';

export interface Expr {
  accept: <R>(visitor: Visitor<R>) => R;
}
export interface Visitor<R> {
  visitBinaryExpr: (expr: Binary) => R;
}
export class Binary implements Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {}
  accept<R>(visitor: Visitor<R>) {
    return visitor.visitBinaryExpr(this);
  }
}
