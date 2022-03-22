import { Expr } from './expr';

export interface Stmt {
  accept: <R>(visitor: StmtVisitor<R>) => R;
}

export interface StmtVisitor<R> {
  visitExprStmt: (exprStmt: ExprStmt) => R;
  visitPrintStmt: (printStmt: PrintStmt) => R;
}

export class ExprStmt implements Stmt {
  constructor(public expr: Expr) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitExprStmt(this);
  }
}

export class PrintStmt implements Stmt {
  constructor(public expr: Expr) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitPrintStmt(this);
  }
}
