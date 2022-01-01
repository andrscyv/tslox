import * as readline from 'readline';
import { Scanner } from './scanner/scanner';
import { Token } from './scanner/token';
import { readFileSync } from 'fs';
import { ErrorReporter } from './error';

const reporter = new ErrorReporter();

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
    run(line);
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

function run(source: string) {
  const scanner = new Scanner(source, reporter);
  const tokens: Token[] = scanner.scanTokens();
  tokens.forEach((token) => {
    console.log(token);
  });
}

main();
