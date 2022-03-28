import * as readline from 'readline';
import { Scanner } from './scanner/scanner';
import { Token } from './scanner/token';
import { readFileSync } from 'fs';
import { ErrorReporter } from './error';
import { Parser } from './parser/parser';
import { Interpreter } from './interpreter/interpreter';

const reporter = new ErrorReporter();
const interpreter = new Interpreter(reporter);

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    console.log('Usage: tslox [script]');
    process.exit(64);
  } else if (args.length === 1) {
    const file = args[0];
    runFile(file);
  } else {
    runPrompt();
  }
}

function runFile(file) {
  const buffer = readFileSync(file);
  const source = buffer.toString();
  run(source);
  if (reporter.hadError) {
    process.exit(65);
  } else if (reporter.hadRuntimeError) {
    process.exit(70);
  }
}
function runPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt('> ');
  rl.prompt();
  rl.on('line', (line) => {
    run(line, { printLastValue: true });
    reporter.hadError = false;
    rl.prompt();
  });
  rl.on('SIGINT', () => {
    rl.question('Are you sure you want to exit? ', (answer) => {
      if (answer.match(/^y(es)?$/i)) {
        process.exit(0);
      } else {
        rl.prompt();
      }
    });
  });
}

function run(
  source: string,
  opts: { printLastValue: boolean } = { printLastValue: false },
) {
  const scanner = new Scanner(source, reporter);
  const tokens: Token[] = scanner.scanTokens();
  const parser = new Parser(tokens, reporter);
  const ast = parser.parse();
  if (reporter.hadError) {
    return;
  }
  interpreter.interpret(ast, opts);
}

main();
