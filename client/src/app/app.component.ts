import { Component, Optional } from '@angular/core';

import { Angulartics2Piwik } from 'angulartics2/piwik';

@Component({
  selector: 'sql-scratch',
  template: `<router-outlet></router-outlet>`
})
export class SqlScratchComponent {
  // The piwik service needs to be required somewhere at least once,
  // otherwise it wont be loaded.
  constructor(
    @Optional()
    piwik: Angulartics2Piwik,
  ) {
    if (piwik) {
      piwik.startTracking();
    }
  }
}
