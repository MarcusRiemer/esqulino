import { Injectable, ErrorHandler, Inject, Optional, PLATFORM_ID } from '@angular/core'

import * as Sentry from '@sentry/browser';
import { isPlatformBrowser } from '@angular/common';

/**
 * Not actually a different way to handle errors, but with this
 * they may not go unnoticed so easily.
 */
@Injectable()
export class NotifyErrorHandler extends ErrorHandler {

  constructor(
    @Inject(PLATFORM_ID)
    @Optional()
    private _platformId: Object
  ) {
    super()
  }

  handleError(error: any): void {
    // Let Angular do it's normal reporting
    super.handleError(error);

    if (isPlatformBrowser(this._platformId)) {
      // "IN YOUR FACE"-feedback
      document.querySelector<HTMLElement>('mat-toolbar').style.backgroundColor = 'red';
    }

    // And send the error on its way to be archived
    Sentry.captureException(error.originalError || error);
  }
}
