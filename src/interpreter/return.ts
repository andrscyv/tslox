export class Return extends Error {
  constructor(public value: unknown) {
    super();
  }
}
