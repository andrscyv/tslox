import { LoxCallable } from './callable';

export class Clock implements LoxCallable {
  arity(): number {
    return 0;
  }
  loxCall() {
    return new Date().getTime() / 1000;
  }
  toString() {
    return '<native fn>';
  }
}
