import {
  Injectable,
  PLATFORM_ID,
  Inject,
  Optional,
  LOCALE_ID,
} from "@angular/core";
import { isPlatformServer } from "@angular/common";

import { environment } from "../../../environments/environment";

import { ServerApi } from "./serverapi";

/**
 * Inserts the given language string into the URL.
 */
function insertLanguageSubdomain(url: string, lang: string) {
  if (url.includes("://")) {
    return url.replace("://", "://" + lang + ".");
  } else {
    return lang + "." + url;
  }
}

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
  public constructor(
    @Inject(PLATFORM_ID)
    @Optional()
    platformId: Object,
    @Inject(LOCALE_ID)
    readonly localeId: string
  ) {
    super(
      isPlatformServer(platformId)
        ? insertLanguageSubdomain(environment.apiEndpoint, localeId)
        : "/api"
    );
  }
}
