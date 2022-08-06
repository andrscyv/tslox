import { FunDeclStmt } from '../ast/stmt';
import { LoxCallable } from './callable';
import { Environment } from './environment';
import { Interpreter } from './interpreter';
import { Return } from './return';

export class LoxFunction implements LoxCallable {
  constructor(private declaration: FunDeclStmt, public closure: Environment) {}

  loxCall(interpreter: Interpreter, args: unknown[]) {
    const fnEnv = new Environment(this.closure);
    args.forEach((val, idx) => {
      fnEnv.define(this.declaration.params[idx].lexeme, val);
    });

    try {
      interpreter.executeBlock(this.declaration.body, fnEnv);
    } catch (error) {
      if (error instanceof Return) {
        return error.value;
      }
      throw error;
    }

    return null;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
