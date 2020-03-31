import { Component, OnInit, Inject, LOCALE_ID } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { environment } from "../../environments/environment";

/**
 * Host-component for the front-page.
 */
@Component({
  templateUrl: "templates/version.html",
})
export class VersionComponent implements OnInit {
  constructor(
    private _title: Title,
    @Inject(LOCALE_ID) private readonly _localeId: string
  ) {}

  ngOnInit() {
    this._title.setTitle("BlattWerkzeug");
  }

  readonly GIT_HASH = environment.version.hash;

  readonly BUILD_DATE = environment.version.date;

  readonly ERROR_REPORTING = environment.sentry && environment.sentry.active;

  readonly LOCALE_ID = this._localeId;

  onRaiseError() {
    throw new Error(`Deliberate error, caused by user!`);
  }
}
