import { assert } from 'console';
import {
  Assignment,
  Binary,
  Call,
  Expr,
  ExprVisitor,
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
  StmtVisitor,
  VarDeclStmt,
  WhileStmt,
} from '../ast/stmt';
import { Interpreter } from '../interpreter/interpreter';
import { Token } from '../scanner/token';

type Scope = Map<string, boolean>;

export class Resolver implements StmtVisitor<void>, ExprVisitor<unknown> {
  private scopes: Scope[] = [];
  constructor(private interpreter: Interpreter) {}
  getCurrentScope(): Scope {
    assert(this.scopes.length > 0, 'Tried to access inexistent scope');
    return this.scopes[this.scopes.length - 1];
  }
  beginScope() {
    this.scopes.push(new Map());
  }
  resolve(stmt: Stmt | Expr) {
    stmt.accept(this);
  }
  resolveStmtList(stmtList: Stmt[]) {
    for (const stmt of stmtList) {
      this.resolve(stmt);
    }
    return;
  }
  endScope() {
    this.scopes.pop();
  }
  declare(name: Token) {
    if (this.scopes.length === 0) {
      return;
    }

    const currentScope = this.getCurrentScope();
    currentScope.set(name.lexeme, false);
  }
  define(name: Token) {
    if (this.scopes.length === 0) {
      return;
    }

    const currentScope = this.getCurrentScope();
    currentScope.set(name.lexeme, true);
  }
  visitBlockStmt(blockStmt: BlockStmt) {
    this.beginScope();
    this.resolveStmtList(blockStmt.stmtList);
    this.endScope();
  }
  visitBinaryExpr: (expr: Binary) => unknown;
  visitLiteralExpr: (expr: Literal) => unknown;
  visitUnaryExpr: (expr: Unary) => unknown;
  visitGroupingExpr: (expr: Grouping) => unknown;
  visitVarExpr(expr: Variable) {
    if (
      this.scopes.length > 0 &&
      this.getCurrentScope().get(expr.name.lexeme) == false
    ) {
      error;
    }
  }
  visitAssignmentExpr: (expr: Assignment) => unknown;
  visitLogicalExpr: (expr: Logical) => unknown;
  visitCallExpr: (expr: Call) => unknown;
  visitExprStmt: (exprStmt: ExprStmt) => void;
  visitPrintStmt: (printStmt: PrintStmt) => void;
  visitVarDeclStmt(varDeclStmt: VarDeclStmt) {
    this.declare(varDeclStmt.identifier);
    if (varDeclStmt.initializer) {
      this.resolve(varDeclStmt.initializer);
    }
    this.define(varDeclStmt.identifier);
  }
  visitIfStmt: (ifStmt: IfStmt) => void;
  visitWhileStmt: (whileStmt: WhileStmt) => void;
  visitFunDeclStmt: (funDeclStmt: FunDeclStmt) => void;
  visitReturnStmt: (returnStmt: ReturnStmt) => void;
}
