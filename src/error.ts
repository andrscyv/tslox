import { RuntimeError } from './interpreter/runtime-error';
import { Token, TokenType } from './scanner/token';

export class ErrorReporter {
  public hadError = false;
  public hadRuntimeError = false;
  error(line: number, message: string): void {
    this.report(line, '', message);
  }
  report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
  parseError(token: Token, message: string): void {
    if (token.type == TokenType.EOF) {
      this.report(token.line, ' at end', message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }
  runtimeError(error: RuntimeError): void {
    const { token, message } = error;
    console.error(`${message} \n[line ${token.line}]`);
    this.hadRuntimeError = true;
  }
}
