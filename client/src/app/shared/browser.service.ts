import { Injectable, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'

import { Platform } from '@angular/cdk/platform';
import { BehaviorSubject, Observable, Subject, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

/** The meaningful modes of the sidebar */
export type SidebarMode = "over" | "side";

/** Bootstrap device sizes */
export const DEVICE_MIN_WIDTH = {
  "xs": 0,
  "sm": 576,
  "md": 768,
  "lg": 992,
  "xl": 1200
}

/**
 * Different aspects of the browser that is currently visiting the app.
 */
@Injectable()
export class BrowserService {

  /**
   * Components that rely on this state may spawn any time. We therefore
   * need to keep the last computed state (which is immediatly set in the
   * constructor).
   */
  private readonly _isMobile: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private readonly _platform: Platform,
    @Inject(PLATFORM_ID)
    @Optional()
    private readonly _platformId: Object
  ) {
    // On Browsers: Use an actual media Query
    if (this._platformId && isPlatformBrowser(_platformId)) {
      const mq = window.matchMedia(`(min-width: ${DEVICE_MIN_WIDTH.md}px)`);
      this._isMobile.next(!mq.matches);

      mq.addEventListener("change", (evt) => this._isMobile.next(!evt.matches));
    }
    // Otherwise: Use the user agent
    else {
      this._isMobile.next(this._platform.IOS || this._platform.ANDROID);
    }
  }

  /**
   * El cheapo mobile platform detection. Used to possibly hide various UI
   * elements on mobile. This should probably be improved to use media queries.
   */
  readonly isMobile$: Observable<boolean> = this._isMobile;

  /**
   * Best applicable mode for the sidebar: Should slide "over" the content on mobile.
   */
  readonly sidebarMode$: Observable<SidebarMode> = this.isMobile$.pipe(
    map(isMobile => isMobile ? "over" : "side")
  );
}