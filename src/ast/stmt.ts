import { Token } from '../scanner/token';
import { Expr } from './expr';

export interface Stmt {
  accept: <R>(visitor: StmtVisitor<R>) => R;
}

export interface StmtVisitor<R> {
  visitExprStmt: (exprStmt: ExprStmt) => R;
  visitPrintStmt: (printStmt: PrintStmt) => R;
  visitVarDeclStmt: (varDeclStmt: VarDeclStmt) => R;
  visitBlockStmt: (blockStmt: BlockStmt) => R;
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

export class VarDeclStmt implements Stmt {
  constructor(public identifier: Token, public initializer: Expr = null) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitVarDeclStmt(this);
  }
}

export class BlockStmt implements Stmt {
  constructor(public stmtList: Stmt[]) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitBlockStmt(this);
  }
}
