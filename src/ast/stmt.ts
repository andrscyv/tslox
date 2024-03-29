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
  visitIfStmt: (ifStmt: IfStmt) => R;
  visitWhileStmt: (whileStmt: WhileStmt) => R;
  visitFunDeclStmt: (funDeclStmt: FunDeclStmt) => R;
  visitReturnStmt: (returnStmt: ReturnStmt) => R;
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

export class FunDeclStmt implements Stmt {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Stmt[],
  ) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitFunDeclStmt(this);
  }
}

export class BlockStmt implements Stmt {
  constructor(public stmtList: Stmt[]) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitBlockStmt(this);
  }
}

export class IfStmt implements Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch: Stmt = null,
  ) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitIfStmt(this);
  }
}

export class WhileStmt implements Stmt {
  constructor(public condition: Expr, public body: Stmt) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitWhileStmt(this);
  }
}

export class ReturnStmt implements Stmt {
  constructor(public keyword: Token, public value: Expr) {}
  accept<R>(visitor: StmtVisitor<R>) {
    return visitor.visitReturnStmt(this);
  }
}
