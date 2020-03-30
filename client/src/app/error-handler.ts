import {
  Injectable,
  ErrorHandler,
  Inject,
  Optional,
  PLATFORM_ID,
} from "@angular/core";

import * as Sentry from "@sentry/browser";

import { isPlatformBrowser } from "@angular/common";

/**
 * @return The element that is used to give a strong visual "hint" about a crash.
 */
export function crashFeedbackElement(): HTMLElement {
  return document.querySelector<HTMLElement>("mat-toolbar");
}

/**
 * Style the given element to indicate an error
 */
export function applyCrashFeedbackStyle() {
  const elem = crashFeedbackElement();
  if (elem) {
    elem.style.backgroundColor = "red";
  }
}

let _isApplicationCrashed = false;

/**
 * @return True, if the application has crashed without chance of recovery.
 */
export function isApplicationCrashed() {
  return _isApplicationCrashed;
}

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
    super();
  }

  handleError(error: any): void {
    // Let Angular do it's normal reporting
    super.handleError(error);

    if (isPlatformBrowser(this._platformId)) {
      // "IN YOUR FACE"-feedback
      applyCrashFeedbackStyle();
    }

    // And send the error on its way to be archived
    Sentry.captureException(error.originalError || error);

    // We are crashed ...
    _isApplicationCrashed = true;
  }
}
