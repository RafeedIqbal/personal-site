// No runtime imports, so Node's type-stripping tests can load these alongside the edge functions.

// A failure the HTTP caller may see verbatim, with its status code.
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// A job failure written for the visitor (bad file, unreadable PDF). Anything else a worker
// throws is replaced with a generic message so database, parser and provider details stay private.
export class UserError extends Error {}
