export function error(line: number, message: string): void {
  report(line, '', message);
}

function report(line: number, where: string, message: string): void {
  console.error(`[line ${line}] Error${where}: ${message}`);
}
