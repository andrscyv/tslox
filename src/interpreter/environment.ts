import { Token } from '../scanner/token';
import { RuntimeError } from './runtime-error';

export class Environment {
  private valueMap = {};
  constructor(private enclosing: Environment = null) {}

  define(name: string, value: any) {
    this.valueMap[name] = value;
  }

  get(token: Token) {
    const varName = token.lexeme;
    if (Object.prototype.hasOwnProperty.call(this.valueMap, varName)) {
      return this.valueMap[varName];
    } else if (this.enclosing) {
      return this.enclosing.get(token);
    }

    throw new RuntimeError(token, `Undefined variable ${token.lexeme}.`);
  }

  assign(token: Token, value: any) {
    const varName = token.lexeme;
    if (Object.prototype.hasOwnProperty.call(this.valueMap, varName)) {
      this.valueMap[varName] = value;
    } else if (this.enclosing) {
      this.enclosing.assign(token, value);
    } else {
      throw new RuntimeError(token, `Undefined variable ${token.lexeme}.`);
    }
  }
}
