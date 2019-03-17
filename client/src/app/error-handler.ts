import { Injectable, ErrorHandler } from '@angular/core'

import * as Sentry from '@sentry/browser';

/**
 * Not actually a different way to handle errors, but with this
 * they may not go unnoticed so easily.
 */
@Injectable()
export class NotifyErrorHandler extends ErrorHandler {
  handleError(error: any): void {
    // Let Angular do it's normal reporting
    super.handleError(error);

    // "IN YOUR FACE"-feedback
    document.querySelector('body').style.backgroundColor = 'red';

    // And send the error on its way to be archived
    Sentry.captureException(error.originalError || error);
  }
}
