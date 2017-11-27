import { Injectable, ErrorHandler } from '@angular/core'

/**
 * Not actually a different way to handle errors, but with this
 * they may not go unnoticed so easily.
 */
@Injectable()
export class NotifyErrorHandler extends ErrorHandler {
  handleError(error: any): void {
    // Let Angular do it's normal reporting
    super.handleError(error);

    // But let the user know about it
    document.querySelector('body').style.backgroundColor = 'red';
  }
}
