import { Token } from '../scanner/token';

export class Parser {
  private current = 0;
  constructor(private tokens: Token[]) {}
}
