export class ParseError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
