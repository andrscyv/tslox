import { Token } from './token';

export class Scanner {
  constructor(input) {
    console.log('Scanner.constructor', input);
  }
  scanTokens(): Token[] {
    console.log('Scanner.scanTokens');
    return [];
  }
}
