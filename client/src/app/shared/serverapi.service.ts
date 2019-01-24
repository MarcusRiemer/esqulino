import { Injectable, PLATFORM_ID, Inject, Optional, InjectionToken } from '@angular/core'
import { isPlatformServer } from '@angular/common'

import { ServerApi } from './serverapi'

/**
 * Instead of constructing URLs on the fly, they should be created using
 * this service. It ensures that the server actually provides the
 * capatabilities to respond to the request, abstracts away the concrete
 * URL to call and can do some basic parameter checks.
 *
 * This file is manually kept in sync with the rails route definitions
 * at `server/config/routes.rb`.
 *
 * TODO: Cleanup code so that these methods rely on each other instead
 *       of constructing the same base-url over and over again.
 */
@Injectable()
export class ServerApiService extends ServerApi {

  /**
   *
   */
  public constructor(
    @Inject(PLATFORM_ID)
    @Optional()
    private _platformId: Object
  ) {
    super(undefined);

    // Was a specific base URL provided? Then we simply take that.
    if (!this._apiBaseUrl) {
      // No specific URL, we fall back to the absolute default URL
      this._apiBaseUrl = "/api";

      // If we are running the universal server, there is no "parenting"
      // base URL that would contain the protocol and the hostname. In that
      // case the official server is used as a fallback.
      //
      // Beware: This may not be what you expect during development.
      if (this._platformId && isPlatformServer(this._platformId)) {
        this._apiBaseUrl = ServerApiService.BASE_HOST + this._apiBaseUrl;
      }
    }
  }
}
