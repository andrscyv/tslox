export class ErrorReporter {
  public hadError = false;
  error(line: number, message: string): void {
    this.report(line, '', message);
  }
  report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}
