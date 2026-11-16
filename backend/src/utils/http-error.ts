// Throw this from services/middlewares; the error middleware turns it into a JSON response.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
