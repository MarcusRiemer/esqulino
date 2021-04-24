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
  /**
   * Constructing a new error with a proper message and possibly a
   * free form context that may be helpful during debugging. Deriving
   * from this class for specific context is the preferred way to
   * convey structured information, but in many circumstances a single
   * unprobable error doesn't seem to warrant a whole new type.
   */
  public constructor(message?: string, readonly context?: unknown) {
    super(message);
  }
}
