import { Interpreter } from './interpreter';

export interface LoxCallable {
  loxCall(interpreter: Interpreter, args);
  arity(): number;
}
