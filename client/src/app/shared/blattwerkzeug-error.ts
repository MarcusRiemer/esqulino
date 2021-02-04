import { CustomError } from "ts-custom-error";

/**
 * Base class for all BlattWerkzeug specific errors.
 *
 * Extending the `Error` object in Node / Typescript is surprisingly nasty. The
 * following documentation was used for the current state:
 *
 * - https://stackoverflow.com/a/60323233/431715
 * - https://github.com/Microsoft/TypeScript/issues/13965
 * - https://github.com/adriengibrat/ts-custom-error
 */
export class BlattWerkzeugError extends CustomError {
  public constructor(message?: string) {
    super(message);
  }
}
